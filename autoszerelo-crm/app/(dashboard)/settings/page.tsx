import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AccountTab } from "@/components/settings/account-tab";
import { TwoFactorTab } from "@/components/settings/two-factor-tab";
import { TeamTab } from "@/components/settings/team-tab";
import { BrandingTab } from "@/components/settings/branding-tab";
import { CalendarTab } from "@/components/settings/calendar-tab";
import { DangerZoneTab } from "@/components/settings/danger-zone-tab";

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const [me, settings, members] = await Promise.all([
    db.user.findUnique({ where: { id: session!.user.id } }),
    db.settings.findUnique({ where: { id: "singleton" } }),
    db.user.findMany({
      select: { id: true, name: true, email: true, role: true, twoFactorEnabled: true, lastLoginAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Beállítások</h1>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Fiók</TabsTrigger>
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          {isAdmin && <TabsTrigger value="team">Csapat</TabsTrigger>}
          {isAdmin && <TabsTrigger value="branding">Márkázás</TabsTrigger>}
          <TabsTrigger value="calendar">Naptár</TabsTrigger>
          <TabsTrigger value="danger">Veszélyzóna</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab initialName={me?.name ?? ""} initialEmail={me?.email ?? ""} />
        </TabsContent>

        <TabsContent value="2fa">
          <TwoFactorTab enabled={me?.twoFactorEnabled ?? false} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="team">
            <TeamTab
              members={members.map((m) => ({ ...m, lastLoginAt: m.lastLoginAt?.toISOString() ?? null }))}
              currentUserId={session!.user.id}
            />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="branding">
            <BrandingTab
              initialCompanyName={settings?.companyName ?? ""}
              initialAccentColor={settings?.accentColor ?? "#2563eb"}
              initialContactEmail={settings?.contactEmail ?? ""}
              initialContactPhone={settings?.contactPhone ?? ""}
              initialAddress={settings?.address ?? ""}
            />
          </TabsContent>
        )}

        <TabsContent value="calendar">
          <CalendarTab calendarToken={settings?.calendarToken ?? null} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="danger">
          <DangerZoneTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
