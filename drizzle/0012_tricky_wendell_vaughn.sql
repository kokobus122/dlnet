CREATE TABLE "player_team_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "players" DROP CONSTRAINT "players_team_id_fkey";
--> statement-breakpoint
DROP INDEX "players_team_id_idx";--> statement-breakpoint
ALTER TABLE "player_team_history" ADD CONSTRAINT "player_team_history_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_team_history" ADD CONSTRAINT "player_team_history_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "player_team_history_player_id_idx" ON "player_team_history" USING btree ("player_id" int4_ops);--> statement-breakpoint
CREATE INDEX "player_team_history_team_id_idx" ON "player_team_history" USING btree ("team_id" int4_ops);--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "teamId";