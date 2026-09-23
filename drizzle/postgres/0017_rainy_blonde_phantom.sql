CREATE TABLE "homepage_profile_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"user_id" varchar(255),
	"role_id" integer,
	"access_kind" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_profile_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"type_id" text NOT NULL,
	"title" text,
	"config" text DEFAULT '{}' NOT NULL,
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_profile_layouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"layout" text DEFAULT '{}' NOT NULL,
	CONSTRAINT "homepage_profile_layouts_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "homepage_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homepage_profile_access" ADD CONSTRAINT "homepage_profile_access_profile_id_homepage_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."homepage_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_profile_access" ADD CONSTRAINT "homepage_profile_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_profile_access" ADD CONSTRAINT "homepage_profile_access_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_profile_items" ADD CONSTRAINT "homepage_profile_items_profile_id_homepage_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."homepage_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_profile_layouts" ADD CONSTRAINT "homepage_profile_layouts_profile_id_homepage_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."homepage_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_profiles" ADD CONSTRAINT "homepage_profiles_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_homepage_profile_access_profile" ON "homepage_profile_access" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_homepage_profile_access_user" ON "homepage_profile_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_homepage_profile_access_role" ON "homepage_profile_access" USING btree ("role_id");