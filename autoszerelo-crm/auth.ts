import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { claimBootstrapAdmin } from "@/lib/bootstrap";
import { oauthProviders } from "@/lib/oauth-config";

const OAUTH_PROVIDERS = new Set(["google", "github"]);

const SESSION_AGE = 30 * 24 * 60 * 60;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

class TwoFactorRequiredError extends CredentialsSignin {
  code = "2FA_REQUIRED";
}

class TwoFactorInvalidError extends CredentialsSignin {
  code = "2FA_INVALID";
}

class AccountLockedError extends CredentialsSignin {
  constructor(minutesLeft: number) {
    super();
    this.code = `ACCOUNT_LOCKED:${minutesLeft}`;
  }
}

async function registerFailedAttempt(userId: string, currentCount: number) {
  const nextCount = currentCount + 1;
  if (nextCount >= MAX_FAILED_ATTEMPTS) {
    const user = await db.user.update({
      where: { id: userId },
      data: { failedLoginCount: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MS) },
    });
    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "login_locked",
      entityType: "User",
      entityId: user.id,
      details: `Fiók zárolva ${MAX_FAILED_ATTEMPTS} sikertelen bejelentkezési kísérlet után`,
    });
  } else {
    await db.user.update({ where: { id: userId }, data: { failedLoginCount: nextCount } });
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Jelszó", type: "password" },
        twoFactorCode: { label: "2FA kód", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          throw new AccountLockedError(minutesLeft);
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          await registerFailedAttempt(user.id, user.failedLoginCount);
          return null;
        }

        if (user.twoFactorEnabled) {
          const code = (credentials?.twoFactorCode as string | undefined ?? "").trim();
          if (!code) throw new TwoFactorRequiredError();

          const valid = speakeasy.totp.verify({
            secret: user.twoFactorSecret ?? "",
            encoding: "base32",
            token: code,
            window: 2,
          });
          if (!valid) {
            await registerFailedAttempt(user.id, user.failedLoginCount);
            throw new TwoFactorInvalidError();
          }
        }

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date(), failedLoginCount: 0, lockedUntil: null },
        });

        await logActivity({
          userId: user.id,
          userName: user.name,
          action: "login",
          entityType: "User",
          entityId: user.id,
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    ...(oauthProviders.google
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
      : []),
    ...(oauthProviders.github
      ? [GitHub({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! })]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !OAUTH_PROVIDERS.has(account.provider)) return true;

      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      const existing = await db.user.findUnique({ where: { email } });
      if (existing) return true;

      // No matching account yet — only allow this to create the very first
      // (bootstrap) admin. Once the system has an admin, unknown OAuth
      // emails are rejected, matching the closed-access model of Credentials
      // registration.
      const userCount = await db.user.count();
      if (userCount > 0) return false;

      const created = await claimBootstrapAdmin({
        name: user.name ?? email,
        email,
        companyName: user.name ?? "CRM",
      });
      return created !== null;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account && OAUTH_PROVIDERS.has(account.provider)) {
          const dbUser = await db.user.findUnique({ where: { email: user.email!.toLowerCase().trim() } });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } else {
          token.id = user.id;
          token.role = user.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!account || !OAUTH_PROVIDERS.has(account.provider)) return;
      const email = user.email?.toLowerCase().trim();
      if (!email) return;

      const dbUser = await db.user.findUnique({ where: { email } });
      if (!dbUser) return;

      await db.user.update({ where: { id: dbUser.id }, data: { lastLoginAt: new Date() } });
      await logActivity({
        userId: dbUser.id,
        userName: dbUser.name,
        action: "login",
        entityType: "User",
        entityId: dbUser.id,
        details: `Bejelentkezve: ${account.provider === "google" ? "Google" : "GitHub"}`,
      });
    },
  },
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: SESSION_AGE,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});
