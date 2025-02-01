-- AlterTable
ALTER TABLE `WordpressCategory` ADD COLUMN `websiteId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `WordpressCategory_websiteId_idx` ON `WordpressCategory`(`websiteId`);

-- AddForeignKey
ALTER TABLE `WordpressCategory` ADD CONSTRAINT `WordpressCategory_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
