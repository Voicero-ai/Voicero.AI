-- CreateTable
CREATE TABLE `ShopifyReportLink` (
    `id` VARCHAR(191) NOT NULL,
    `websiteId` VARCHAR(191) NOT NULL,
    `reportType` VARCHAR(191) NOT NULL,
    `s3Key` VARCHAR(191) NOT NULL,
    `s3Url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ShopifyReportLink_websiteId_idx`(`websiteId`),
    UNIQUE INDEX `ShopifyReportLink_websiteId_reportType_key`(`websiteId`, `reportType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
