-- CreateTable
CREATE TABLE `ShopifyCollection` (
    `id` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `ruleSet` JSON NULL,
    `sortOrder` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `websiteId` VARCHAR(191) NOT NULL,

    INDEX `ShopifyCollection_websiteId_idx`(`websiteId`),
    UNIQUE INDEX `ShopifyCollection_websiteId_handle_key`(`websiteId`, `handle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
