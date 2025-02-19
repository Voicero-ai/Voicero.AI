/*
  Warnings:

  - A unique constraint covering the columns `[websiteId,shopifyId]` on the table `ShopifyBlog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ShopifyBlog_websiteId_shopifyId_key` ON `ShopifyBlog`(`websiteId`, `shopifyId`);
