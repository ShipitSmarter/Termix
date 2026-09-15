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