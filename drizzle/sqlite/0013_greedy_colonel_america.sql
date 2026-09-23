CREATE TABLE `homepage_profile_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` integer NOT NULL,
	`user_id` text,
	`role_id` integer,
	`access_kind` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_profile` ON `homepage_profile_access` (`profile_id`);--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_user` ON `homepage_profile_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_homepage_profile_access_role` ON `homepage_profile_access` (`role_id`);--> statement-breakpoint
CREATE TABLE `homepage_profile_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` integer NOT NULL,
	`type_id` text NOT NULL,
	`title` text,
	`config` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `homepage_profile_layouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` integer NOT NULL,
	`layout` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `homepage_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `homepage_profile_layouts_profile_id_unique` ON `homepage_profile_layouts` (`profile_id`);--> statement-breakpoint
CREATE TABLE `homepage_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
