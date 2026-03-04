CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"teamA" text NOT NULL,
	"teamB" text NOT NULL,
	"scoreA" integer NOT NULL,
	"scoreB" integer NOT NULL,
	"match_date" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "match_id" integer;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_match_id_idx" ON "comments" USING btree ("match_id" int4_ops);