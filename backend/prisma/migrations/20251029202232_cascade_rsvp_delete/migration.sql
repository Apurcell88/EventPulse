-- DropForeignKey
ALTER TABLE "public"."RSVP" DROP CONSTRAINT "RSVP_eventId_fkey";

-- AddForeignKey
ALTER TABLE "public"."RSVP" ADD CONSTRAINT "RSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
