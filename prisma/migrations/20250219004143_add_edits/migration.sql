/*
  Warnings:

  - A unique constraint covering the columns `[websiteId,shopifyId]` on the table `ShopifyPage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[websiteId,handle]` on the table `ShopifyPage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ShopifyPage_handle_key` ON `ShopifyPage`;

-- DropIndex
DROP INDEX `ShopifyPage_shopifyId_key` ON `ShopifyPage`;

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyPage_websiteId_shopifyId_key` ON `ShopifyPage`(`websiteId`, `shopifyId`);

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyPage_websiteId_handle_key` ON `ShopifyPage`(`websiteId`, `handle`);
