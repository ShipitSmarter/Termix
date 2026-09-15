CREATE TABLE "personal_host_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"personal_host_id" integer NOT NULL,
	"source_shared_host_id" integer NOT NULL,
	"source_snapshot_at" text NOT NULL,
	"source_type" text DEFAULT 'shared-host-import' NOT NULL,
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personal_host_sources" ADD CONSTRAINT "personal_host_sources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_host_sources" ADD CONSTRAINT "personal_host_sources_personal_host_id_ssh_data_id_fk" FOREIGN KEY ("personal_host_id") REFERENCES "public"."ssh_data"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "personal_host_sources_user_source_unique" ON "personal_host_sources" USING btree ("user_id","source_shared_host_id");--> statement-breakpoint
CREATE UNIQUE INDEX "personal_host_sources_personal_host_unique" ON "personal_host_sources" USING btree ("personal_host_id");--> statement-breakpoint
CREATE INDEX "idx_personal_host_sources_user_id" ON "personal_host_sources" USING btree ("user_id");