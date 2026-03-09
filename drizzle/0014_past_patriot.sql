ALTER TABLE "events" ADD COLUMN "prizePool" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
UPDATE "events"
SET
	"prizePool" = 0,
	"location" = 'TBD',
	"start_date" = NOW(),
	"end_date" = NOW()
WHERE
	"prizePool" IS NULL
	OR "location" IS NULL
	OR "start_date" IS NULL
	OR "end_date" IS NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "prizePool" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "location" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "end_date" SET NOT NULL;