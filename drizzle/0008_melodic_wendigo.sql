ALTER TABLE IF EXISTS "players" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "teams" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "players" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "teams" CASCADE;--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'matches'
			AND column_name = 'team_a_id'
	) THEN
		ALTER TABLE "matches" RENAME COLUMN "team_a_id" TO "teamA";
	END IF;

	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'matches'
			AND column_name = 'team_b_id'
	) THEN
		ALTER TABLE "matches" RENAME COLUMN "team_b_id" TO "teamB";
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_team_a_id_fkey";
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_team_b_id_fkey";
--> statement-breakpoint
DROP INDEX IF EXISTS "matches_team_a_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "matches_team_b_id_idx";