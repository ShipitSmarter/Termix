CREATE TABLE "shared_host_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"host_id" integer NOT NULL,
	"folder" text,
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_host_selections" ADD CONSTRAINT "shared_host_selections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_host_selections" ADD CONSTRAINT "shared_host_selections_host_id_ssh_data_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."ssh_data"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "shared_host_selections_user_host_unique" ON "shared_host_selections" USING btree ("user_id","host_id");--> statement-breakpoint
CREATE INDEX "idx_shared_host_selections_user_id" ON "shared_host_selections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_shared_host_selections_host_id" ON "shared_host_selections" USING btree ("host_id");