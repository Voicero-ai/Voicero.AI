/*
  Warnings:

  - A unique constraint covering the columns `[websiteId,shopifyId]` on the table `ShopifyProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ShopifyMedia` MODIFY `shopifyId` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `ShopifyProduct` MODIFY `shopifyId` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `ShopifyProductVariant` MODIFY `shopifyId` BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyProduct_websiteId_shopifyId_key` ON `ShopifyProduct`(`websiteId`, `shopifyId`);
