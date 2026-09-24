CREATE TABLE `homepage_profile_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profile_id` int NOT NULL,
	`user_id` varchar(255),
	`role_id` int,
	`access_kind` text NOT NULL,
	CONSTRAINT `homepage_profile_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homepage_profile_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profile_id` int NOT NULL,
	`type_id` text NOT NULL,
	`title` text,
	`config` text NOT NULL DEFAULT ('{}'),
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `homepage_profile_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homepage_profile_layouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profile_id` int NOT NULL,
	`layout` text NOT NULL DEFAULT ('{}'),
	CONSTRAINT `homepage_profile_layouts_id` PRIMARY KEY(`id`),
	CONSTRAINT `homepage_profile_layouts_profile_id_unique` UNIQUE(`profile_id`)
);
--> statement-breakpoint
CREATE TABLE `homepage_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`visibility` text NOT NULL DEFAULT ('private'),
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `homepage_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_host_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`personal_host_id` int NOT NULL,
	`source_shared_host_id` int NOT NULL,
	`source_snapshot_at` text NOT NULL,
	`source_type` text NOT NULL DEFAULT ('shared-host-import'),
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `personal_host_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `personal_host_sources_user_source_unique` UNIQUE(`user_id`,`source_shared_host_id`),
	CONSTRAINT `personal_host_sources_personal_host_unique` UNIQUE(`personal_host_id`)
);
--> statement-breakpoint
CREATE TABLE `shared_host_selections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`host_id` int NOT NULL,
	`folder` text,
	`created_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` varchar(255) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `shared_host_selections_id` PRIMARY KEY(`id`),
	CONSTRAINT `shared_host_selections_user_host_unique` UNIQUE(`user_id`,`host_id`)
);
--> statement-breakpoint
ALTER TABLE `homepage_profile_access` ADD CONSTRAINT `homepage_profile_access_profile_id_homepage_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profile_access` ADD CONSTRAINT `homepage_profile_access_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profile_access` ADD CONSTRAINT `homepage_profile_access_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profile_items` ADD CONSTRAINT `homepage_profile_items_profile_id_homepage_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profile_layouts` ADD CONSTRAINT `homepage_profile_layouts_profile_id_homepage_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profiles` ADD CONSTRAINT `homepage_profiles_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_host_sources` ADD CONSTRAINT `personal_host_sources_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_host_sources` ADD CONSTRAINT `personal_host_sources_personal_host_id_ssh_data_id_fk` FOREIGN KEY (`personal_host_id`) REFERENCES `ssh_data`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_host_selections` ADD CONSTRAINT `shared_host_selections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_host_selections` ADD CONSTRAINT `shared_host_selections_host_id_ssh_data_id_fk` FOREIGN KEY (`host_id`) REFERENCES `ssh_data`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_profile` ON `homepage_profile_access` (`profile_id`);--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_user` ON `homepage_profile_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_role` ON `homepage_profile_access` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_personal_host_sources_user_id` ON `personal_host_sources` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_shared_host_selections_user_id` ON `shared_host_selections` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_shared_host_selections_host_id` ON `shared_host_selections` (`host_id`);