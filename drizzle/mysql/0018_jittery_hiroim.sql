CREATE TABLE `collab_room_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`room_role` text NOT NULL DEFAULT ('member'),
	`added_by` varchar(255),
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `collab_room_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_collab_room_members_room_user` UNIQUE(`room_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `collab_rooms` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`owner_user_id` varchar(255) NOT NULL,
	`persistent` boolean NOT NULL DEFAULT false,
	`presenter_user_id` varchar(255),
	`stage_protocol` text,
	`stage_host_id` int,
	`stage_share_id` varchar(255),
	`guest_link_token` varchar(255),
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`ended_at` text,
	CONSTRAINT `collab_rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_collab_rooms_guest_token` UNIQUE(`guest_link_token`)
);
--> statement-breakpoint
CREATE TABLE `credential_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`credential_id` int NOT NULL,
	`user_id` varchar(255),
	`role_id` int,
	`granted_by` varchar(255) NOT NULL,
	`permission_level` text NOT NULL DEFAULT ('use'),
	`expires_at` varchar(255),
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `credential_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `folder_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner_user_id` varchar(255) NOT NULL,
	`folder` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`role_id` int,
	`granted_by` varchar(255) NOT NULL,
	`permission_level` text NOT NULL DEFAULT ('connect'),
	`expires_at` varchar(255),
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `folder_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plugin_install_counts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plugin_id` varchar(255) NOT NULL,
	`registry_id` varchar(255) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`source` text NOT NULL DEFAULT ('aggregate-telemetry'),
	`updated_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `plugin_install_counts_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_plugin_install_counts_plugin_registry` UNIQUE(`plugin_id`,`registry_id`)
);
--> statement-breakpoint
CREATE TABLE `plugin_permission_grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plugin_id` varchar(255) NOT NULL,
	`capability` varchar(255) NOT NULL,
	`granted_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`granted_by` varchar(255) NOT NULL,
	CONSTRAINT `plugin_permission_grants_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_plugin_permission_grants_plugin_capability` UNIQUE(`plugin_id`,`capability`)
);
--> statement-breakpoint
CREATE TABLE `plugin_registries` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`kind` text NOT NULL DEFAULT ('community'),
	`enabled` boolean NOT NULL DEFAULT true,
	`signing_key` text,
	`last_checked_at` text,
	`last_index_hash` text,
	CONSTRAINT `plugin_registries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`version` text NOT NULL,
	`tier` text NOT NULL DEFAULT ('available'),
	`source` text NOT NULL DEFAULT ('community'),
	`registry_id` varchar(255),
	`state` text NOT NULL DEFAULT ('disabled'),
	`installed_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`auto_update` boolean NOT NULL DEFAULT false,
	`manifest_json` text NOT NULL,
	CONSTRAINT `plugins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `secret_sources` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`kind` text NOT NULL DEFAULT ('onepassword-connect'),
	`base_url` text NOT NULL,
	`token` text NOT NULL,
	`shared` boolean NOT NULL DEFAULT false,
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `secret_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_credential_secrets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`credential_access_id` int NOT NULL,
	`target_user_id` varchar(255) NOT NULL,
	`credential_id` int NOT NULL,
	`encrypted_username` text,
	`auth_type` text NOT NULL DEFAULT ('password'),
	`encrypted_password` text,
	`encrypted_key` text,
	`encrypted_key_password` text,
	`key_type` text,
	`public_key` text,
	`cert_public_key` text,
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `shared_credential_secrets_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_shared_credential_secrets_scope` UNIQUE(`credential_access_id`,`target_user_id`)
);
--> statement-breakpoint
ALTER TABLE `ssh_data` MODIFY COLUMN `folder` varchar(255);--> statement-breakpoint
ALTER TABLE `snippets` MODIFY COLUMN `folder` varchar(255);--> statement-breakpoint
ALTER TABLE `ssh_credentials` MODIFY COLUMN `folder` varchar(255);--> statement-breakpoint
ALTER TABLE `vault_profiles` MODIFY COLUMN `folder` varchar(255);--> statement-breakpoint
ALTER TABLE `ssh_data` ADD `enable_web_ui` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ssh_data` ADD `enable_ai_assistant` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ssh_data` ADD `web_ui_config` text;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `show_pin_app_rail_button` boolean;--> statement-breakpoint
ALTER TABLE `collab_room_members` ADD CONSTRAINT `collab_room_members_room_id_collab_rooms_id_fk` FOREIGN KEY (`room_id`) REFERENCES `collab_rooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collab_room_members` ADD CONSTRAINT `collab_room_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collab_room_members` ADD CONSTRAINT `collab_room_members_added_by_users_id_fk` FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collab_rooms` ADD CONSTRAINT `collab_rooms_owner_user_id_users_id_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collab_rooms` ADD CONSTRAINT `collab_rooms_presenter_user_id_users_id_fk` FOREIGN KEY (`presenter_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collab_rooms` ADD CONSTRAINT `collab_rooms_stage_host_id_ssh_data_id_fk` FOREIGN KEY (`stage_host_id`) REFERENCES `ssh_data`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collab_rooms` ADD CONSTRAINT `collab_rooms_stage_share_id_session_shares_id_fk` FOREIGN KEY (`stage_share_id`) REFERENCES `session_shares`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `credential_access` ADD CONSTRAINT `credential_access_credential_id_ssh_credentials_id_fk` FOREIGN KEY (`credential_id`) REFERENCES `ssh_credentials`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `credential_access` ADD CONSTRAINT `credential_access_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `credential_access` ADD CONSTRAINT `credential_access_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `credential_access` ADD CONSTRAINT `credential_access_granted_by_users_id_fk` FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `folder_access` ADD CONSTRAINT `folder_access_owner_user_id_users_id_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `folder_access` ADD CONSTRAINT `folder_access_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `folder_access` ADD CONSTRAINT `folder_access_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `folder_access` ADD CONSTRAINT `folder_access_granted_by_users_id_fk` FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plugin_permission_grants` ADD CONSTRAINT `plugin_permission_grants_plugin_id_plugins_id_fk` FOREIGN KEY (`plugin_id`) REFERENCES `plugins`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plugin_permission_grants` ADD CONSTRAINT `plugin_permission_grants_granted_by_users_id_fk` FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `secret_sources` ADD CONSTRAINT `secret_sources_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_credential_secrets` ADD CONSTRAINT `shared_credential_secrets_target_user_id_users_id_fk` FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_credential_secrets` ADD CONSTRAINT `shared_credential_secrets_credential_id_ssh_credentials_id_fk` FOREIGN KEY (`credential_id`) REFERENCES `ssh_credentials`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_credential_secrets` ADD CONSTRAINT `shared_cred_secrets_access_id_fk` FOREIGN KEY (`credential_access_id`) REFERENCES `credential_access`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_collab_room_members_user` ON `collab_room_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_collab_rooms_owner` ON `collab_rooms` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `idx_credential_access_user_id` ON `credential_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_credential_access_role_id` ON `credential_access` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_credential_access_credential_id` ON `credential_access` (`credential_id`);--> statement-breakpoint
CREATE INDEX `idx_folder_access_owner_folder` ON `folder_access` (`owner_user_id`,`folder`);--> statement-breakpoint
CREATE INDEX `idx_plugins_registry_id` ON `plugins` (`registry_id`);--> statement-breakpoint
CREATE INDEX `idx_secret_sources_user` ON `secret_sources` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_shared_credential_secrets_target` ON `shared_credential_secrets` (`target_user_id`,`credential_id`);