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
ALTER TABLE `shared_host_selections` ADD CONSTRAINT `shared_host_selections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_host_selections` ADD CONSTRAINT `shared_host_selections_host_id_ssh_data_id_fk` FOREIGN KEY (`host_id`) REFERENCES `ssh_data`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_shared_host_selections_user_id` ON `shared_host_selections` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_shared_host_selections_host_id` ON `shared_host_selections` (`host_id`);