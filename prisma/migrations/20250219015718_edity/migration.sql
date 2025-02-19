/*
  Warnings:

  - You are about to drop the column `shopifyStoreId` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the `ShopifyStore` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[websiteId,handle]` on the table `ShopifyBlog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[websiteId,shopifyId]` on the table `ShopifyBlogPost` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[websiteId,handle]` on the table `ShopifyBlogPost` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[websiteId,handle]` on the table `ShopifyPage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[websiteId,handle]` on the table `ShopifyProduct` will be added. If there are existing duplicate values, this will fail.
  - Made the column `websiteId` on table `ShopifyBlog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `websiteId` to the `ShopifyBlogPost` table without a default value. This is not possible if the table is not empty.
  - Made the column `websiteId` on table `ShopifyPage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `websiteId` on table `ShopifyProduct` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `ShopifyBlogPost_blogId_shopifyId_key` ON `ShopifyBlogPost`;

-- DropIndex
DROP INDEX `ShopifyProduct_handle_key` ON `ShopifyProduct`;

-- DropIndex
DROP INDEX `ShopifyProduct_shopifyId_key` ON `ShopifyProduct`;

-- DropIndex
DROP INDEX `Website_shopifyStoreId_key` ON `Website`;

-- AlterTable
ALTER TABLE `ShopifyBlog` MODIFY `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ShopifyBlogPost` ADD COLUMN `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ShopifyPage` MODIFY `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ShopifyProduct` MODIFY `websiteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Website` DROP COLUMN `shopifyStoreId`;

-- DropTable
DROP TABLE `ShopifyStore`;

-- CreateIndex
CREATE INDEX `ShopifyBlog_websiteId_idx` ON `ShopifyBlog`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyBlog_websiteId_handle_key` ON `ShopifyBlog`(`websiteId`, `handle`);

-- CreateIndex
CREATE INDEX `ShopifyBlogPost_websiteId_idx` ON `ShopifyBlogPost`(`websiteId`);

-- CreateIndex
CREATE INDEX `ShopifyBlogPost_blogId_idx` ON `ShopifyBlogPost`(`blogId`);

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyBlogPost_websiteId_shopifyId_key` ON `ShopifyBlogPost`(`websiteId`, `shopifyId`);

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyBlogPost_websiteId_handle_key` ON `ShopifyBlogPost`(`websiteId`, `handle`);

-- CreateIndex
CREATE INDEX `ShopifyPage_websiteId_idx` ON `ShopifyPage`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyPage_websiteId_handle_key` ON `ShopifyPage`(`websiteId`, `handle`);

-- CreateIndex
CREATE INDEX `ShopifyProduct_websiteId_idx` ON `ShopifyProduct`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyProduct_websiteId_handle_key` ON `ShopifyProduct`(`websiteId`, `handle`);
