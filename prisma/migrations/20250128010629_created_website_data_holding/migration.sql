/*
  Warnings:

  - You are about to drop the `Extension` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Extension` DROP FOREIGN KEY `Extension_userId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailCode` VARCHAR(191) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `profilePicture` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Extension`;

-- CreateTable
CREATE TABLE `Website` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `renewsOn` DATETIME(3) NOT NULL,
    `plan` VARCHAR(191) NOT NULL,
    `stripeId` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `syncFrequency` VARCHAR(191) NOT NULL DEFAULT 'daily',
    `lastSyncedAt` DATETIME(3) NULL,
    `monthlyQueries` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Website_stripeId_key`(`stripeId`),
    INDEX `Website_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessKey` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `key` VARCHAR(191) NOT NULL,
    `websiteId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AccessKey_key_key`(`key`),
    INDEX `AccessKey_websiteId_idx`(`websiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerifiedDevice` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VerifiedDevice_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Website` ADD CONSTRAINT `Website_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessKey` ADD CONSTRAINT `AccessKey_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerifiedDevice` ADD CONSTRAINT `VerifiedDevice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
