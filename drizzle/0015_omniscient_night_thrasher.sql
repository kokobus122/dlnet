ALTER TABLE "events" ADD COLUMN "logo" text;--> statement-breakpoint
UPDATE "events"
SET "logo" = '/event-default-logo.png'
WHERE "logo" IS NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "logo" SET NOT NULL;