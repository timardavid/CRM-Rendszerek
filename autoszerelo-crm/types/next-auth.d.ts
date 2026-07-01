import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "STAFF";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "STAFF";
  }
}
