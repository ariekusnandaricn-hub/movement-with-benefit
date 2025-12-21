CREATE TABLE `judges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('Acting','Vocal','Model') NOT NULL,
	`title` varchar(255),
	`description` text,
	`photoUrl` text,
	`order_index` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `judges_id` PRIMARY KEY(`id`)
);
