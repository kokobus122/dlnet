CREATE TABLE IF NOT EXISTS "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nickname" text NOT NULL,
	"country" text NOT NULL,
	"teamId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"logoUrl" text NOT NULL,
	"country" text NOT NULL,
	"roster" text NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'matches'
			AND column_name = 'teamA'
	) THEN
		ALTER TABLE "matches" RENAME COLUMN "teamA" TO "team_a_id";
	END IF;

	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'matches'
			AND column_name = 'teamB'
	) THEN
		ALTER TABLE "matches" RENAME COLUMN "teamB" TO "team_b_id";
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'matches'
			AND column_name = 'team_a_id'
			AND data_type = 'text'
	) THEN
		INSERT INTO "teams" ("name", "tag", "logoUrl", "country", "roster")
		SELECT src.team_name, src.team_name, '', '', '[]'
		FROM (
			SELECT DISTINCT TRIM("team_a_id") AS team_name FROM "matches"
			UNION
			SELECT DISTINCT TRIM("team_b_id") AS team_name FROM "matches"
		) src
		WHERE src.team_name IS NOT NULL
			AND src.team_name <> ''
			AND NOT EXISTS (
				SELECT 1 FROM "teams" t WHERE LOWER(t."name") = LOWER(src.team_name)
			);

		ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "team_a_id_int" integer;
		ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "team_b_id_int" integer;

		UPDATE "matches" m
		SET "team_a_id_int" = t."id"
		FROM "teams" t
		WHERE LOWER(TRIM(t."name")) = LOWER(TRIM(m."team_a_id"));

		UPDATE "matches" m
		SET "team_b_id_int" = t."id"
		FROM "teams" t
		WHERE LOWER(TRIM(t."name")) = LOWER(TRIM(m."team_b_id"));

		ALTER TABLE "matches" ALTER COLUMN "team_a_id_int" SET NOT NULL;
		ALTER TABLE "matches" ALTER COLUMN "team_b_id_int" SET NOT NULL;

		ALTER TABLE "matches" DROP COLUMN "team_a_id";
		ALTER TABLE "matches" DROP COLUMN "team_b_id";
		ALTER TABLE "matches" RENAME COLUMN "team_a_id_int" TO "team_a_id";
		ALTER TABLE "matches" RENAME COLUMN "team_b_id_int" TO "team_b_id";
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'players_team_id_fkey') THEN
		ALTER TABLE "players" ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "players_team_id_idx" ON "players" USING btree ("teamId" int4_ops);--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'matches_team_a_id_fkey') THEN
		ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'matches_team_b_id_fkey') THEN
		ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_fkey" FOREIGN KEY ("team_b_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "matches_team_a_id_idx" ON "matches" USING btree ("team_a_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "matches_team_b_id_idx" ON "matches" USING btree ("team_b_id" int4_ops);