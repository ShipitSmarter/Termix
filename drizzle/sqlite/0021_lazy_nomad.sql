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
--> statement-breakpoint
CREATE TABLE `personal_host_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`personal_host_id` integer NOT NULL,
	`source_shared_host_id` integer NOT NULL,
	`source_snapshot_at` text NOT NULL,
	`source_type` text DEFAULT 'shared-host-import' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`personal_host_id`) REFERENCES `ssh_data`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personal_host_sources_user_source_unique` ON `personal_host_sources` (`user_id`,`source_shared_host_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `personal_host_sources_personal_host_unique` ON `personal_host_sources` (`personal_host_id`);--> statement-breakpoint
CREATE INDEX `idx_personal_host_sources_user_id` ON `personal_host_sources` (`user_id`);--> statement-breakpoint
CREATE TABLE `shared_host_selections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`host_id` integer NOT NULL,
	`folder` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`host_id`) REFERENCES `ssh_data`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shared_host_selections_user_host_unique` ON `shared_host_selections` (`user_id`,`host_id`);--> statement-breakpoint
CREATE INDEX `idx_shared_host_selections_user_id` ON `shared_host_selections` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_shared_host_selections_host_id` ON `shared_host_selections` (`host_id`);