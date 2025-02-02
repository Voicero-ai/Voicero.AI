-- CreateTable
CREATE TABLE `VectorDbConfig` (
    `id` VARCHAR(191) NOT NULL,
    `namespace` VARCHAR(191) NOT NULL,
    `websiteId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VectorDbConfig_websiteId_key`(`websiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VectorDbConfig` ADD CONSTRAINT `VectorDbConfig_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
