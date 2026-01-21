-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "notifyFiles" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyRsvps" BOOLEAN NOT NULL DEFAULT true;
