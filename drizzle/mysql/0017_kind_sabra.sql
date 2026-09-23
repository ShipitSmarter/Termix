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
ALTER TABLE `homepage_profile_access` ADD CONSTRAINT `homepage_profile_access_profile_id_homepage_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profile_access` ADD CONSTRAINT `homepage_profile_access_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profile_access` ADD CONSTRAINT `homepage_profile_access_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profile_items` ADD CONSTRAINT `homepage_profile_items_profile_id_homepage_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profile_layouts` ADD CONSTRAINT `homepage_profile_layouts_profile_id_homepage_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homepage_profiles` ADD CONSTRAINT `homepage_profiles_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_profile` ON `homepage_profile_access` (`profile_id`);--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_user` ON `homepage_profile_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_role` ON `homepage_profile_access` (`role_id`);