-- AlterTable
ALTER TABLE `Website` ADD COLUMN `customInstructions` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PopUpQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `websiteId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
