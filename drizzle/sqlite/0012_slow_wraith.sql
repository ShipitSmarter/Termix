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
CREATE INDEX `idx_personal_host_sources_user_id` ON `personal_host_sources` (`user_id`);