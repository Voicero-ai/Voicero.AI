/*
  Warnings:

  - Added the required column `updatedAt` to the `WordpressCustomField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WordpressProductCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WordpressProductTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WordpressTag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `WordpressAuthor` ADD COLUMN `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `WordpressCategory` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `WordpressCustomField` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressProductCategory` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressProductTag` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `WordpressTag` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
