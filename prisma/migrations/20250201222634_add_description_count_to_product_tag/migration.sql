-- AlterTable
ALTER TABLE `WordpressProductTag` ADD COLUMN `count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `description` TEXT NULL;
