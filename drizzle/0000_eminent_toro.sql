CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2),
	"pv" integer,
	"stock" integer,
	"category" text,
	"qr_code_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"user_id" text,
	"username" text,
	"name" text,
	"surname" text,
	"phone" text,
	"email" text,
	"role" text DEFAULT 'Member',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id")
);
