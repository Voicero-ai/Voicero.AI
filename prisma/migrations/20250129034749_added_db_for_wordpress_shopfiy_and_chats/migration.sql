/*
  Warnings:

  - A unique constraint covering the columns `[shopifyStoreId]` on the table `Website` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Website` ADD COLUMN `aiAssistantId` VARCHAR(191) NULL,
    ADD COLUMN `shopifyStoreId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `WordpressPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `excerpt` TEXT NULL,
    `link` VARCHAR(191) NOT NULL,
    `featuredMediaId` INTEGER NULL,
    `authorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `wordpressMediaId` INTEGER NULL,
    `websiteId` VARCHAR(191) NULL,

    UNIQUE INDEX `WordpressPost_wpId_key`(`wpId`),
    UNIQUE INDEX `WordpressPost_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressPage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `featuredMediaId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `websiteId` VARCHAR(191) NULL,

    UNIQUE INDEX `WordpressPage_wpId_key`(`wpId`),
    UNIQUE INDEX `WordpressPage_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `permalink` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `regularPrice` DOUBLE NULL,
    `salePrice` DOUBLE NULL,
    `stockQuantity` INTEGER NULL,
    `description` TEXT NOT NULL,
    `shortDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `websiteId` VARCHAR(191) NULL,

    UNIQUE INDEX `WordpressProduct_wpId_key`(`wpId`),
    UNIQUE INDEX `WordpressProduct_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressMedia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `sourceUrl` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `caption` VARCHAR(191) NULL,

    UNIQUE INDEX `WordpressMedia_wpId_key`(`wpId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressAuthor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `WordpressAuthor_wpId_key`(`wpId`),
    UNIQUE INDEX `WordpressAuthor_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `WordpressCategory_wpId_key`(`wpId`),
    UNIQUE INDEX `WordpressCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WordpressTag_wpId_key`(`wpId`),
    UNIQUE INDEX `WordpressTag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressProductCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WordpressProductCategory_wpId_key`(`wpId`),
    UNIQUE INDEX `WordpressProductCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressProductTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WordpressProductTag_wpId_key`(`wpId`),
    UNIQUE INDEX `WordpressProductTag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `parentId` INTEGER NULL,

    UNIQUE INDEX `WordpressComment_wpId_key`(`wpId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressReview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `reviewer` VARCHAR(191) NOT NULL,
    `reviewerEmail` VARCHAR(191) NOT NULL,
    `review` TEXT NOT NULL,
    `rating` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `verified` BOOLEAN NOT NULL,

    UNIQUE INDEX `WordpressReview_wpId_key`(`wpId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WordpressCustomField` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wpId` INTEGER NOT NULL,
    `postId` INTEGER NULL,
    `productId` INTEGER NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `WordpressCustomField_wpId_key`(`wpId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyStore` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `websiteId` VARCHAR(191) NULL,

    UNIQUE INDEX `ShopifyStore_shopId_key`(`shopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyProduct` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `vendor` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `websiteId` VARCHAR(191) NULL,

    UNIQUE INDEX `ShopifyProduct_shopifyId_key`(`shopifyId`),
    UNIQUE INDEX `ShopifyProduct_handle_key`(`handle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `sku` VARCHAR(191) NULL,
    `inventory` INTEGER NULL,
    `productId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ShopifyProductVariant_shopifyId_key`(`shopifyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyMedia` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `caption` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NULL,

    UNIQUE INDEX `ShopifyMedia_shopifyId_key`(`shopifyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyReview` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `reviewer` VARCHAR(191) NOT NULL,
    `verified` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ShopifyReview_shopifyId_key`(`shopifyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyDiscount` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `valueType` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ShopifyDiscount_shopifyId_key`(`shopifyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyGiftCard` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `balance` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `expiresOn` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ShopifyGiftCard_shopifyId_key`(`shopifyId`),
    UNIQUE INDEX `ShopifyGiftCard_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyPage` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `websiteId` VARCHAR(191) NULL,

    UNIQUE INDEX `ShopifyPage_shopifyId_key`(`shopifyId`),
    UNIQUE INDEX `ShopifyPage_handle_key`(`handle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyBlog` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `websiteId` VARCHAR(191) NULL,

    UNIQUE INDEX `ShopifyBlog_shopifyId_key`(`shopifyId`),
    UNIQUE INDEX `ShopifyBlog_handle_key`(`handle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyBlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `blogId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ShopifyBlogPost_shopifyId_key`(`shopifyId`),
    UNIQUE INDEX `ShopifyBlogPost_handle_key`(`handle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyComment` (
    `id` VARCHAR(191) NOT NULL,
    `shopifyId` INTEGER NOT NULL,
    `body` TEXT NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `postId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ShopifyComment_shopifyId_key`(`shopifyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiThread` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `websiteId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastMessageAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AiThread_websiteId_idx`(`websiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiMessage` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `pageUrl` VARCHAR(191) NULL,
    `scrollToText` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AiMessage_threadId_idx`(`threadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_WordpressPostToWordpressTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_WordpressPostToWordpressTag_AB_unique`(`A`, `B`),
    INDEX `_WordpressPostToWordpressTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_WordpressProductToWordpressProductCategory` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_WordpressProductToWordpressProductCategory_AB_unique`(`A`, `B`),
    INDEX `_WordpressProductToWordpressProductCategory_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_WordpressProductToWordpressProductTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_WordpressProductToWordpressProductTag_AB_unique`(`A`, `B`),
    INDEX `_WordpressProductToWordpressProductTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_WordpressMediaToWordpressProduct` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_WordpressMediaToWordpressProduct_AB_unique`(`A`, `B`),
    INDEX `_WordpressMediaToWordpressProduct_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_WordpressCategoryToWordpressPost` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_WordpressCategoryToWordpressPost_AB_unique`(`A`, `B`),
    INDEX `_WordpressCategoryToWordpressPost_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Website_shopifyStoreId_key` ON `Website`(`shopifyStoreId`);

-- AddForeignKey
ALTER TABLE `WordpressPost` ADD CONSTRAINT `WordpressPost_featuredMediaId_fkey` FOREIGN KEY (`featuredMediaId`) REFERENCES `WordpressMedia`(`wpId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressPost` ADD CONSTRAINT `WordpressPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `WordpressAuthor`(`wpId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressPost` ADD CONSTRAINT `WordpressPost_wordpressMediaId_fkey` FOREIGN KEY (`wordpressMediaId`) REFERENCES `WordpressMedia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressPost` ADD CONSTRAINT `WordpressPost_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressPage` ADD CONSTRAINT `WordpressPage_featuredMediaId_fkey` FOREIGN KEY (`featuredMediaId`) REFERENCES `WordpressMedia`(`wpId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressPage` ADD CONSTRAINT `WordpressPage_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressProduct` ADD CONSTRAINT `WordpressProduct_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressComment` ADD CONSTRAINT `WordpressComment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `WordpressPost`(`wpId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressComment` ADD CONSTRAINT `WordpressComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `WordpressComment`(`wpId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressReview` ADD CONSTRAINT `WordpressReview_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `WordpressProduct`(`wpId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressCustomField` ADD CONSTRAINT `WordpressCustomField_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `WordpressPost`(`wpId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordpressCustomField` ADD CONSTRAINT `WordpressCustomField_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `WordpressProduct`(`wpId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopifyProduct` ADD CONSTRAINT `ShopifyProduct_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopifyProductVariant` ADD CONSTRAINT `ShopifyProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `ShopifyProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopifyMedia` ADD CONSTRAINT `ShopifyMedia_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `ShopifyProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopifyReview` ADD CONSTRAINT `ShopifyReview_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `ShopifyProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopifyPage` ADD CONSTRAINT `ShopifyPage_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopifyBlog` ADD CONSTRAINT `ShopifyBlog_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopifyBlogPost` ADD CONSTRAINT `ShopifyBlogPost_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `ShopifyBlog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopifyComment` ADD CONSTRAINT `ShopifyComment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `ShopifyBlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiThread` ADD CONSTRAINT `AiThread_websiteId_fkey` FOREIGN KEY (`websiteId`) REFERENCES `Website`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiMessage` ADD CONSTRAINT `AiMessage_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `AiThread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressPostToWordpressTag` ADD CONSTRAINT `_WordpressPostToWordpressTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `WordpressPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressPostToWordpressTag` ADD CONSTRAINT `_WordpressPostToWordpressTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `WordpressTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressProductToWordpressProductCategory` ADD CONSTRAINT `_WordpressProductToWordpressProductCategory_A_fkey` FOREIGN KEY (`A`) REFERENCES `WordpressProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressProductToWordpressProductCategory` ADD CONSTRAINT `_WordpressProductToWordpressProductCategory_B_fkey` FOREIGN KEY (`B`) REFERENCES `WordpressProductCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressProductToWordpressProductTag` ADD CONSTRAINT `_WordpressProductToWordpressProductTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `WordpressProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressProductToWordpressProductTag` ADD CONSTRAINT `_WordpressProductToWordpressProductTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `WordpressProductTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressMediaToWordpressProduct` ADD CONSTRAINT `_WordpressMediaToWordpressProduct_A_fkey` FOREIGN KEY (`A`) REFERENCES `WordpressMedia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressMediaToWordpressProduct` ADD CONSTRAINT `_WordpressMediaToWordpressProduct_B_fkey` FOREIGN KEY (`B`) REFERENCES `WordpressProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressCategoryToWordpressPost` ADD CONSTRAINT `_WordpressCategoryToWordpressPost_A_fkey` FOREIGN KEY (`A`) REFERENCES `WordpressCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WordpressCategoryToWordpressPost` ADD CONSTRAINT `_WordpressCategoryToWordpressPost_B_fkey` FOREIGN KEY (`B`) REFERENCES `WordpressPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
