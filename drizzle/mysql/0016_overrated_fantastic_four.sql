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
ALTER TABLE `personal_host_sources` ADD CONSTRAINT `personal_host_sources_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_host_sources` ADD CONSTRAINT `personal_host_sources_personal_host_id_ssh_data_id_fk` FOREIGN KEY (`personal_host_id`) REFERENCES `ssh_data`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_personal_host_sources_user_id` ON `personal_host_sources` (`user_id`);