CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lectureNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`fileType` varchar(32) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int,
	`aiEnabled` enum('on','off') NOT NULL DEFAULT 'on',
	`uploadedBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
