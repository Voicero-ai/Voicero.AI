/*
  Warnings:

  - You are about to drop the column `targetType` on the `ShopifyDiscount` table. All the data in the column will be lost.
  - You are about to drop the column `valueType` on the `ShopifyDiscount` table. All the data in the column will be lost.
  - You are about to alter the column `value` on the `ShopifyDiscount` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.
  - A unique constraint covering the columns `[websiteId,shopifyId]` on the table `ShopifyDiscount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `ShopifyDiscount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteId` to the `ShopifyDiscount` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `ShopifyDiscount_shopifyId_key` ON `ShopifyDiscount`;

-- AlterTable
ALTER TABLE `ShopifyDiscount` DROP COLUMN `targetType`,
    DROP COLUMN `valueType`,
    ADD COLUMN `appliesTo` VARCHAR(191) NULL,
    ADD COLUMN `code` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD COLUMN `websiteId` VARCHAR(191) NOT NULL,
    MODIFY `value` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `ShopifyDiscount_websiteId_idx` ON `ShopifyDiscount`(`websiteId`);

-- CreateIndex
CREATE UNIQUE INDEX `ShopifyDiscount_websiteId_shopifyId_key` ON `ShopifyDiscount`(`websiteId`, `shopifyId`);
