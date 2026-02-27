ALTER TABLE "news" ADD COLUMN "imageCover" text;
--> statement-breakpoint
UPDATE "news" SET "imageCover" = '' WHERE "imageCover" IS NULL;
--> statement-breakpoint
ALTER TABLE "news" ALTER COLUMN "imageCover" SET NOT NULL;