CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"ingameName" text NOT NULL,
	"teamId" integer NOT NULL,
	"country" text NOT NULL,
	"position" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"founded" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" RENAME COLUMN "teamA" TO "team_a_id";--> statement-breakpoint
ALTER TABLE "matches" RENAME COLUMN "teamB" TO "team_b_id";--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "players_team_id_idx" ON "players" USING btree ("teamId" int4_ops);--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_fkey" FOREIGN KEY ("team_b_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "matches_team_a_id_idx" ON "matches" USING btree ("team_a_id" int4_ops);--> statement-breakpoint
CREATE INDEX "matches_team_b_id_idx" ON "matches" USING btree ("team_b_id" int4_ops);