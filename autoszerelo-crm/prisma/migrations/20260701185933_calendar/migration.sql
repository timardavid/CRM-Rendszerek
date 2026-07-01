-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "calendarToken" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "WorkOrder_scheduledAt_idx" ON "WorkOrder"("scheduledAt");
