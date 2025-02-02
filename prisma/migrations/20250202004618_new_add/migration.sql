/*
  Warnings:

  - A unique constraint covering the columns `[slug,websiteId]` on the table `WordpressPage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,websiteId]` on the table `WordpressPost` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,websiteId]` on the table `WordpressProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,websiteId]` on the table `WordpressTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `websiteId` to the `WordpressTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `WordpressPage_slug_key` ON `WordpressPage`;

-- DropIndex
DROP INDEX `WordpressPost_slug_key` ON `WordpressPost`;

-- DropIndex
DROP INDEX `WordpressProduct_slug_key` ON `WordpressProduct`;

-- DropIndex
DROP INDEX `WordpressTag_slug_key` ON `WordpressTag`;

-- AlterTable
ALTER TABLE `WordpressPage` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `WordpressPost` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `WordpressProduct` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `WordpressTag` ADD COLUMN `websiteId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `WordpressPage_slug_websiteId_key` ON `WordpressPage`(`slug`, `websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `WordpressPost_slug_websiteId_key` ON `WordpressPost`(`slug`, `websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `WordpressProduct_slug_websiteId_key` ON `WordpressProduct`(`slug`, `websiteId`);

-- CreateIndex
CREATE INDEX `WordpressTag_websiteId_idx` ON `WordpressTag`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `WordpressTag_slug_websiteId_key` ON `WordpressTag`(`slug`, `websiteId`);

-- AddForeignKey
ALTER TABLE `WordpressTag` ADD CONSTRAINT `WordpressTag_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
