-- DropForeignKey
ALTER TABLE `AccessKey` DROP FOREIGN KEY `AccessKey_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `AiMessage` DROP FOREIGN KEY `AiMessage_threadId_fkey`;

-- DropForeignKey
ALTER TABLE `AiThread` DROP FOREIGN KEY `AiThread_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopifyBlog` DROP FOREIGN KEY `ShopifyBlog_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopifyBlogPost` DROP FOREIGN KEY `ShopifyBlogPost_blogId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopifyComment` DROP FOREIGN KEY `ShopifyComment_postId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopifyMedia` DROP FOREIGN KEY `ShopifyMedia_productId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopifyPage` DROP FOREIGN KEY `ShopifyPage_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopifyProduct` DROP FOREIGN KEY `ShopifyProduct_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopifyProductVariant` DROP FOREIGN KEY `ShopifyProductVariant_productId_fkey`;

-- DropForeignKey
ALTER TABLE `ShopifyReview` DROP FOREIGN KEY `ShopifyReview_productId_fkey`;

-- DropForeignKey
ALTER TABLE `VectorDbConfig` DROP FOREIGN KEY `VectorDbConfig_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `VerifiedDevice` DROP FOREIGN KEY `VerifiedDevice_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Website` DROP FOREIGN KEY `Website_userId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressAuthor` DROP FOREIGN KEY `WordpressAuthor_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressCategory` DROP FOREIGN KEY `WordpressCategory_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressComment` DROP FOREIGN KEY `WordpressComment_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressComment` DROP FOREIGN KEY `WordpressComment_postId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressCustomField` DROP FOREIGN KEY `WordpressCustomField_postId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressCustomField` DROP FOREIGN KEY `WordpressCustomField_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressCustomField` DROP FOREIGN KEY `WordpressCustomField_wordpressProductId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressMedia` DROP FOREIGN KEY `WordpressMedia_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressPage` DROP FOREIGN KEY `WordpressPage_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressPost` DROP FOREIGN KEY `WordpressPost_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressPost` DROP FOREIGN KEY `WordpressPost_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressProduct` DROP FOREIGN KEY `WordpressProduct_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressProductCategory` DROP FOREIGN KEY `WordpressProductCategory_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressProductTag` DROP FOREIGN KEY `WordpressProductTag_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressReview` DROP FOREIGN KEY `WordpressReview_productId_fkey`;

-- DropForeignKey
ALTER TABLE `WordpressTag` DROP FOREIGN KEY `WordpressTag_websiteId_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressCategoryToWordpressPost` DROP FOREIGN KEY `_WordpressCategoryToWordpressPost_A_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressCategoryToWordpressPost` DROP FOREIGN KEY `_WordpressCategoryToWordpressPost_B_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressPostToWordpressTag` DROP FOREIGN KEY `_WordpressPostToWordpressTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressPostToWordpressTag` DROP FOREIGN KEY `_WordpressPostToWordpressTag_B_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressProductToWordpressProductCategory` DROP FOREIGN KEY `_WordpressProductToWordpressProductCategory_A_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressProductToWordpressProductCategory` DROP FOREIGN KEY `_WordpressProductToWordpressProductCategory_B_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressProductToWordpressProductTag` DROP FOREIGN KEY `_WordpressProductToWordpressProductTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_WordpressProductToWordpressProductTag` DROP FOREIGN KEY `_WordpressProductToWordpressProductTag_B_fkey`;

-- DropIndex
DROP INDEX `ShopifyBlog_websiteId_fkey` ON `ShopifyBlog`;

-- DropIndex
DROP INDEX `ShopifyBlogPost_blogId_fkey` ON `ShopifyBlogPost`;

-- DropIndex
DROP INDEX `ShopifyComment_postId_fkey` ON `ShopifyComment`;

-- DropIndex
DROP INDEX `ShopifyMedia_productId_fkey` ON `ShopifyMedia`;

-- DropIndex
DROP INDEX `ShopifyPage_websiteId_fkey` ON `ShopifyPage`;

-- DropIndex
DROP INDEX `ShopifyProductVariant_productId_fkey` ON `ShopifyProductVariant`;

-- DropIndex
DROP INDEX `ShopifyReview_productId_fkey` ON `ShopifyReview`;

-- DropIndex
DROP INDEX `WordpressComment_parentId_fkey` ON `WordpressComment`;

-- DropIndex
DROP INDEX `WordpressComment_postId_fkey` ON `WordpressComment`;

-- DropIndex
DROP INDEX `WordpressCustomField_wordpressProductId_fkey` ON `WordpressCustomField`;

-- DropIndex
DROP INDEX `WordpressPost_authorId_fkey` ON `WordpressPost`;

-- DropIndex
DROP INDEX `WordpressReview_productId_fkey` ON `WordpressReview`;
