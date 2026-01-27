ALTER TABLE `userPreferences` MODIFY COLUMN `smsNotifications` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);