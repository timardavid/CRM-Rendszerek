import { Plus, Pencil, Trash2, LogIn, LogOut, UserPlus, Lock } from "lucide-react";

const ACTION_VERBS: Record<string, string> = {
  create: "létrehozott",
  update: "módosított",
  delete: "törölt",
  login: "bejelentkezett",
  logout: "kijelentkezett",
  register: "regisztrált",
  login_locked: "fiókot zárolt (túl sok sikertelen próbálkozás)",
};

const ENTITY_LABELS: Record<string, string> = {
  User: "egy felhasználót",
  Customer: "egy ügyfelet",
  Vehicle: "egy járművet",
  WorkOrder: "egy munkalapot",
  CustomTable: "egy egyedi táblát",
  Invoice: "egy számlát",
  Quote: "egy árajánlatot",
  Settings: "a beállításokat",
};

const ACTION_ICONS: Record<string, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  login: LogIn,
  logout: LogOut,
  register: UserPlus,
  login_locked: Lock,
};

export function activityIcon(action: string) {
  return ACTION_ICONS[action] ?? Pencil;
}

export function activityIconColor(action: string) {
  if (action === "delete" || action === "login_locked") return "text-destructive";
  if (action === "create" || action === "register") return "text-green-600 dark:text-green-400";
  if (action === "login") return "text-primary";
  return "text-muted-foreground";
}

function entityPhrase(entityType: string) {
  if (entityType.startsWith("CustomRow:")) {
    return `egy rekordot ("${entityType.split(":")[1]}" táblában)`;
  }
  return ENTITY_LABELS[entityType] ?? "egy elemet";
}

export function activitySentence(log: { action: string; entityType: string }) {
  const verb = ACTION_VERBS[log.action] ?? log.action;

  if (log.action === "login" || log.action === "logout" || log.action === "register" || log.action === "login_locked") {
    return verb.charAt(0).toUpperCase() + verb.slice(1);
  }

  return `${entityPhrase(log.entityType)} ${verb}`.replace(/^./, (c) => c.toUpperCase());
}
