CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"authorId" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);