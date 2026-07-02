import { db } from "@/lib/db";

type LogParams = {
  userId?: string | null;
  userName: string;
  action: "login" | "logout" | "create" | "update" | "delete" | "register" | "login_locked";
  entityType: string;
  entityId?: string | null;
  details?: string | null;
};

export async function logActivity(params: LogParams) {
  await db.activityLog.create({
    data: {
      userId: params.userId ?? null,
      userName: params.userName,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      details: params.details ?? null,
    },
  });
}
