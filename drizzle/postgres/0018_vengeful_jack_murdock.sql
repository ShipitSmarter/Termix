CREATE TABLE "collab_room_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"room_role" text DEFAULT 'member' NOT NULL,
	"added_by" varchar(255),
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collab_rooms" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_user_id" varchar(255) NOT NULL,
	"persistent" boolean DEFAULT false NOT NULL,
	"presenter_user_id" varchar(255),
	"stage_protocol" text,
	"stage_host_id" integer,
	"stage_share_id" varchar(255),
	"guest_link_token" varchar(255),
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"ended_at" text
);
--> statement-breakpoint
CREATE TABLE "credential_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"credential_id" integer NOT NULL,
	"user_id" varchar(255),
	"role_id" integer,
	"granted_by" varchar(255) NOT NULL,
	"permission_level" text DEFAULT 'use' NOT NULL,
	"expires_at" varchar(255),
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folder_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_user_id" varchar(255) NOT NULL,
	"folder" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"role_id" integer,
	"granted_by" varchar(255) NOT NULL,
	"permission_level" text DEFAULT 'connect' NOT NULL,
	"expires_at" varchar(255),
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugin_install_counts" (
	"id" serial PRIMARY KEY NOT NULL,
	"plugin_id" varchar(255) NOT NULL,
	"registry_id" varchar(255) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"source" text DEFAULT 'aggregate-telemetry' NOT NULL,
	"updated_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugin_permission_grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"plugin_id" varchar(255) NOT NULL,
	"capability" varchar(255) NOT NULL,
	"granted_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"granted_by" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugin_registries" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"kind" text DEFAULT 'community' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"signing_key" text,
	"last_checked_at" text,
	"last_index_hash" text
);
--> statement-breakpoint
CREATE TABLE "plugins" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"version" text NOT NULL,
	"tier" text DEFAULT 'available' NOT NULL,
	"source" text DEFAULT 'community' NOT NULL,
	"registry_id" varchar(255),
	"state" text DEFAULT 'disabled' NOT NULL,
	"installed_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"auto_update" boolean DEFAULT false NOT NULL,
	"manifest_json" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secret_sources" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"kind" text DEFAULT 'onepassword-connect' NOT NULL,
	"base_url" text NOT NULL,
	"token" text NOT NULL,
	"shared" boolean DEFAULT false NOT NULL,
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared_credential_secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"credential_access_id" integer NOT NULL,
	"target_user_id" varchar(255) NOT NULL,
	"credential_id" integer NOT NULL,
	"encrypted_username" text,
	"auth_type" text DEFAULT 'password' NOT NULL,
	"encrypted_password" text,
	"encrypted_key" text,
	"encrypted_key_password" text,
	"key_type" text,
	"public_key" text,
	"cert_public_key" text,
	"created_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" varchar(255) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ssh_data" ALTER COLUMN "folder" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "snippets" ALTER COLUMN "folder" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ssh_credentials" ALTER COLUMN "folder" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "vault_profiles" ALTER COLUMN "folder" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ssh_data" ADD COLUMN "enable_web_ui" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ssh_data" ADD COLUMN "enable_ai_assistant" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ssh_data" ADD COLUMN "web_ui_config" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "show_pin_app_rail_button" boolean;--> statement-breakpoint
ALTER TABLE "collab_room_members" ADD CONSTRAINT "collab_room_members_room_id_collab_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collab_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collab_room_members" ADD CONSTRAINT "collab_room_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collab_room_members" ADD CONSTRAINT "collab_room_members_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collab_rooms" ADD CONSTRAINT "collab_rooms_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collab_rooms" ADD CONSTRAINT "collab_rooms_presenter_user_id_users_id_fk" FOREIGN KEY ("presenter_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collab_rooms" ADD CONSTRAINT "collab_rooms_stage_host_id_ssh_data_id_fk" FOREIGN KEY ("stage_host_id") REFERENCES "public"."ssh_data"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collab_rooms" ADD CONSTRAINT "collab_rooms_stage_share_id_session_shares_id_fk" FOREIGN KEY ("stage_share_id") REFERENCES "public"."session_shares"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_access" ADD CONSTRAINT "credential_access_credential_id_ssh_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."ssh_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_access" ADD CONSTRAINT "credential_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_access" ADD CONSTRAINT "credential_access_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_access" ADD CONSTRAINT "credential_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_access" ADD CONSTRAINT "folder_access_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_access" ADD CONSTRAINT "folder_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_access" ADD CONSTRAINT "folder_access_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_access" ADD CONSTRAINT "folder_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_permission_grants" ADD CONSTRAINT "plugin_permission_grants_plugin_id_plugins_id_fk" FOREIGN KEY ("plugin_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plugin_permission_grants" ADD CONSTRAINT "plugin_permission_grants_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_sources" ADD CONSTRAINT "secret_sources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_credential_secrets" ADD CONSTRAINT "shared_credential_secrets_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_credential_secrets" ADD CONSTRAINT "shared_credential_secrets_credential_id_ssh_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."ssh_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_credential_secrets" ADD CONSTRAINT "shared_cred_secrets_access_id_fk" FOREIGN KEY ("credential_access_id") REFERENCES "public"."credential_access"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_collab_room_members_room_user" ON "collab_room_members" USING btree ("room_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_collab_room_members_user" ON "collab_room_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_collab_rooms_owner" ON "collab_rooms" USING btree ("owner_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_collab_rooms_guest_token" ON "collab_rooms" USING btree ("guest_link_token");--> statement-breakpoint
CREATE INDEX "idx_credential_access_user_id" ON "credential_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_credential_access_role_id" ON "credential_access" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_credential_access_credential_id" ON "credential_access" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "idx_folder_access_owner_folder" ON "folder_access" USING btree ("owner_user_id","folder");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_plugin_install_counts_plugin_registry" ON "plugin_install_counts" USING btree ("plugin_id","registry_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_plugin_permission_grants_plugin_capability" ON "plugin_permission_grants" USING btree ("plugin_id","capability");--> statement-breakpoint
CREATE INDEX "idx_plugins_registry_id" ON "plugins" USING btree ("registry_id");--> statement-breakpoint
CREATE INDEX "idx_secret_sources_user" ON "secret_sources" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_shared_credential_secrets_scope" ON "shared_credential_secrets" USING btree ("credential_access_id","target_user_id");--> statement-breakpoint
CREATE INDEX "idx_shared_credential_secrets_target" ON "shared_credential_secrets" USING btree ("target_user_id","credential_id");