CREATE TABLE `collab_room_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` text NOT NULL,
	`user_id` text NOT NULL,
	`room_role` text DEFAULT 'member' NOT NULL,
	`added_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `collab_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_collab_room_members_room_user` ON `collab_room_members` (`room_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `idx_collab_room_members_user` ON `collab_room_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `collab_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`persistent` integer DEFAULT false NOT NULL,
	`presenter_user_id` text,
	`stage_protocol` text,
	`stage_host_id` integer,
	`stage_share_id` text,
	`guest_link_token` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`ended_at` text,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`presenter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`stage_host_id`) REFERENCES `ssh_data`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`stage_share_id`) REFERENCES `session_shares`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_collab_rooms_owner` ON `collab_rooms` (`owner_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_collab_rooms_guest_token` ON `collab_rooms` (`guest_link_token`);--> statement-breakpoint
CREATE TABLE `credential_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`credential_id` integer NOT NULL,
	`user_id` text,
	`role_id` integer,
	`granted_by` text NOT NULL,
	`permission_level` text DEFAULT 'use' NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`credential_id`) REFERENCES `ssh_credentials`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_credential_access_user_id` ON `credential_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_credential_access_role_id` ON `credential_access` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_credential_access_credential_id` ON `credential_access` (`credential_id`);--> statement-breakpoint
CREATE TABLE `folder_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_user_id` text NOT NULL,
	`folder` text NOT NULL,
	`user_id` text,
	`role_id` integer,
	`granted_by` text NOT NULL,
	`permission_level` text DEFAULT 'connect' NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_folder_access_owner_folder` ON `folder_access` (`owner_user_id`,`folder`);--> statement-breakpoint
CREATE TABLE `plugin_install_counts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plugin_id` text NOT NULL,
	`registry_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`source` text DEFAULT 'aggregate-telemetry' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_plugin_install_counts_plugin_registry` ON `plugin_install_counts` (`plugin_id`,`registry_id`);--> statement-breakpoint
CREATE TABLE `plugin_permission_grants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plugin_id` text NOT NULL,
	`capability` text NOT NULL,
	`granted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`granted_by` text NOT NULL,
	FOREIGN KEY (`plugin_id`) REFERENCES `plugins`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_plugin_permission_grants_plugin_capability` ON `plugin_permission_grants` (`plugin_id`,`capability`);--> statement-breakpoint
CREATE TABLE `plugin_registries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`kind` text DEFAULT 'community' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`signing_key` text,
	`last_checked_at` text,
	`last_index_hash` text
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`version` text NOT NULL,
	`tier` text DEFAULT 'available' NOT NULL,
	`source` text DEFAULT 'community' NOT NULL,
	`registry_id` text,
	`state` text DEFAULT 'disabled' NOT NULL,
	`installed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`auto_update` integer DEFAULT false NOT NULL,
	`manifest_json` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_plugins_registry_id` ON `plugins` (`registry_id`);--> statement-breakpoint
CREATE TABLE `secret_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text DEFAULT 'onepassword-connect' NOT NULL,
	`base_url` text NOT NULL,
	`token` text NOT NULL,
	`shared` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_secret_sources_user` ON `secret_sources` (`user_id`);--> statement-breakpoint
CREATE TABLE `shared_credential_secrets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`credential_access_id` integer NOT NULL,
	`target_user_id` text NOT NULL,
	`credential_id` integer NOT NULL,
	`encrypted_username` text,
	`auth_type` text DEFAULT 'password' NOT NULL,
	`encrypted_password` text,
	`encrypted_key` text(16384),
	`encrypted_key_password` text,
	`key_type` text,
	`public_key` text(4096),
	`cert_public_key` text(8192),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`credential_id`) REFERENCES `ssh_credentials`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`credential_access_id`) REFERENCES `credential_access`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_shared_credential_secrets_scope` ON `shared_credential_secrets` (`credential_access_id`,`target_user_id`);--> statement-breakpoint
CREATE INDEX `idx_shared_credential_secrets_target` ON `shared_credential_secrets` (`target_user_id`,`credential_id`);--> statement-breakpoint
ALTER TABLE `ssh_data` ADD `enable_web_ui` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ssh_data` ADD `enable_ai_assistant` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ssh_data` ADD `web_ui_config` text;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `show_pin_app_rail_button` integer;