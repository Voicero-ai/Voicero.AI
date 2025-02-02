/*
  Warnings:

  - You are about to drop the column `description` on the `WordpressAuthor` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `WordpressAuthor` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `WordpressAuthor` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `WordpressCustomField` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `WordpressCustomField` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `WordpressCustomField` table. All the data in the column will be lost.
  - You are about to drop the column `wpId` on the `WordpressCustomField` table. All the data in the column will be lost.
  - You are about to drop the column `altText` on the `WordpressMedia` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `WordpressMedia` table. All the data in the column will be lost.
  - You are about to drop the column `featuredMediaId` on the `WordpressPage` table. All the data in the column will be lost.
  - You are about to drop the column `featuredMediaId` on the `WordpressPost` table. All the data in the column will be lost.
  - You are about to drop the column `wordpressMediaId` on the `WordpressPost` table. All the data in the column will be lost.
  - You are about to drop the `_WordpressMediaToWordpressProduct` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug,websiteId]` on the table `WordpressCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId,metaKey]` on the table `WordpressCustomField` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,websiteId]` on the table `WordpressProductCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,websiteId]` on the table `WordpressProductTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdAt` to the `WordpressAuthor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WordpressAuthor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteId` to the `WordpressAuthor` table without a default value. This is not possible if the table is not empty.
  - Made the column `websiteId` on table `WordpressCategory` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `metaKey` to the `WordpressCustomField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metaValue` to the `WordpressCustomField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postType` to the `WordpressCustomField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteId` to the `WordpressCustomField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `WordpressMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WordpressMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `WordpressMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteId` to the `WordpressMedia` table without a default value. This is not possible if the table is not empty.
  - Made the column `websiteId` on table `WordpressPage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `websiteId` on table `WordpressPost` required. This step will fail if there are existing NULL values in that column.
  - Made the column `websiteId` on table `WordpressProduct` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `websiteId` to the `WordpressProductCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteId` to the `WordpressProductTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `WordpressCategory` DROP FOREIGN KEY `WordpressCategory_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressCustomField` DROP FOREIGN KEY `WordpressCustomField_productId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressPage` DROP FOREIGN KEY `WordpressPage_featuredMediaId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressPage` DROP FOREIGN KEY `WordpressPage_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressPost` DROP FOREIGN KEY `WordpressPost_featuredMediaId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressPost` DROP FOREIGN KEY `WordpressPost_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressPost` DROP FOREIGN KEY `WordpressPost_wordpressMediaId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressProduct` DROP FOREIGN KEY `WordpressProduct_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressMediaToWordpressProduct` DROP FOREIGN KEY `_WordpressMediaToWordpressProduct_A_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressMediaToWordpressProduct` DROP FOREIGN KEY `_WordpressMediaToWordpressProduct_B_fkey`;

-- DropIndex
DROP INDEX `WordpressAuthor_slug_key` ON `WordpressAuthor`;

-- DropIndex
DROP INDEX `WordpressCategory_slug_key` ON `WordpressCategory`;

-- DropIndex
DROP INDEX `WordpressCustomField_productId_fkey` ON `WordpressCustomField`;

-- DropIndex
DROP INDEX `WordpressCustomField_wpId_key` ON `WordpressCustomField`;

-- DropIndex
DROP INDEX `WordpressPage_featuredMediaId_fkey` ON `WordpressPage`;

-- DropIndex
DROP INDEX `WordpressPost_featuredMediaId_fkey` ON `WordpressPost`;

-- DropIndex
DROP INDEX `WordpressPost_wordpressMediaId_fkey` ON `WordpressPost`;

-- DropIndex
DROP INDEX `WordpressProductCategory_slug_key` ON `WordpressProductCategory`;

-- DropIndex
DROP INDEX `WordpressProductTag_slug_key` ON `WordpressProductTag`;

-- AlterTable
ALTER TABLE `WordpressAuthor` DROP COLUMN `description`,
    DROP COLUMN `link`,
    DROP COLUMN `slug`,
    ADD COLUMN `avatarUrl` VARCHAR(191) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `url` VARCHAR(191) NULL,
    ADD COLUMN `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressCategory` MODIFY `description` TEXT NULL,
    MODIFY `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressComment` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE `WordpressCustomField` DROP COLUMN `key`,
    DROP COLUMN `productId`,
    DROP COLUMN `value`,
    DROP COLUMN `wpId`,
    ADD COLUMN `metaKey` VARCHAR(191) NOT NULL,
    ADD COLUMN `metaValue` TEXT NOT NULL,
    ADD COLUMN `postType` VARCHAR(191) NOT NULL,
    ADD COLUMN `websiteId` VARCHAR(191) NOT NULL,
    ADD COLUMN `wordpressProductId` INTEGER NULL;

-- AlterTable
ALTER TABLE `WordpressMedia` DROP COLUMN `altText`,
    DROP COLUMN `sourceUrl`,
    ADD COLUMN `alt` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `metadata` JSON NULL,
    ADD COLUMN `mimeType` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `url` VARCHAR(191) NOT NULL,
    ADD COLUMN `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressPage` DROP COLUMN `featuredMediaId`,
    MODIFY `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressPost` DROP COLUMN `featuredMediaId`,
    DROP COLUMN `wordpressMediaId`,
    MODIFY `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressProduct` MODIFY `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressProductCategory` ADD COLUMN `count` INTEGER NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `parent` INTEGER NULL,
    ADD COLUMN `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressProductTag` ADD COLUMN `websiteId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_WordpressMediaToWordpressProduct`;

-- CreateIndex
CREATE INDEX `WordpressAuthor_websiteId_idx` ON `WordpressAuthor`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `WordpressCategory_slug_websiteId_key` ON `WordpressCategory`(`slug`, `websiteId`);

-- CreateIndex
CREATE INDEX `WordpressCustomField_websiteId_idx` ON `WordpressCustomField`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `WordpressCustomField_postId_metaKey_key` ON `WordpressCustomField`(`postId`, `metaKey`);

-- CreateIndex
CREATE INDEX `WordpressMedia_websiteId_idx` ON `WordpressMedia`(`websiteId`);

-- CreateIndex
CREATE INDEX `WordpressProductCategory_websiteId_idx` ON `WordpressProductCategory`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `WordpressProductCategory_slug_websiteId_key` ON `WordpressProductCategory`(`slug`, `websiteId`);

-- CreateIndex
CREATE INDEX `WordpressProductTag_websiteId_idx` ON `WordpressProductTag`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `WordpressProductTag_slug_websiteId_key` ON `WordpressProductTag`(`slug`, `websiteId`);

-- AddForeignKey
ALTER TABLE `WordpressPost` ADD CONSTRAINT `WordpressPost_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressPage` ADD CONSTRAINT `WordpressPage_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressProduct` ADD CONSTRAINT `WordpressProduct_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressMedia` ADD CONSTRAINT `WordpressMedia_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressAuthor` ADD CONSTRAINT `WordpressAuthor_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressCategory` ADD CONSTRAINT `WordpressCategory_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressProductCategory` ADD CONSTRAINT `WordpressProductCategory_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressProductTag` ADD CONSTRAINT `WordpressProductTag_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressCustomField` ADD CONSTRAINT `WordpressCustomField_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressCustomField` ADD CONSTRAINT `WordpressCustomField_wordpressProductId_fkey` FOREIGN KEY (`wordpressProductId`) REFERENCES `WordpressProduct`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `WordpressPage` RENAME INDEX `WordpressPage_websiteId_fkey` TO `WordpressPage_websiteId_idx`;

-- RenameIndex
ALTER TABLE `WordpressPost` RENAME INDEX `WordpressPost_websiteId_fkey` TO `WordpressPost_websiteId_idx`;

-- RenameIndex
ALTER TABLE `WordpressProduct` RENAME INDEX `WordpressProduct_websiteId_fkey` TO `WordpressProduct_websiteId_idx`;
