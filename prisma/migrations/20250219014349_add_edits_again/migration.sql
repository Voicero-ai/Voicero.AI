/*
  Warnings:

  - A unique constraint covering the columns `[blogId,shopifyId]` on the table `ShopifyBlogPost` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ShopifyBlogPost_blogId_shopifyId_key` ON `ShopifyBlogPost`(`blogId`, `shopifyId`);
