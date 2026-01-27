CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sortOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `dispensaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('main_clinic','pod_mobile') NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dispensaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockItemId` int NOT NULL,
	`alertType` enum('low_stock','out_of_stock','expiring_soon','expired') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dispensaryId` int NOT NULL,
	`categoryId` int,
	`name` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`unitPrice` decimal(10,2),
	`batchNumber` varchar(100),
	`expirationDate` timestamp,
	`source` varchar(255),
	`lowStockThreshold` int NOT NULL DEFAULT 10,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `stockItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockItemId` int NOT NULL,
	`dispensaryId` int NOT NULL,
	`transactionType` enum('issued','received','lost','adjustment') NOT NULL,
	`quantity` int NOT NULL,
	`previousQuantity` int NOT NULL,
	`newQuantity` int NOT NULL,
	`reason` text,
	`notes` text,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lastSelectedDispensaryId` int,
	`emailNotifications` boolean NOT NULL DEFAULT true,
	`smsNotifications` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','stock_controller','manager','founder') NOT NULL DEFAULT 'user';