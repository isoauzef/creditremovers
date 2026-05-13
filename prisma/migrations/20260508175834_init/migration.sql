-- CreateTable
CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(128) NOT NULL,
    `lastName` VARCHAR(128) NOT NULL,
    `resetToken` VARCHAR(128) NULL,
    `resetExpiresAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customer_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_submissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(128) NOT NULL,
    `lastName` VARCHAR(128) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `state` VARCHAR(64) NULL,
    `creditScoreRange` VARCHAR(32) NULL,
    `negativeItemsCount` VARCHAR(32) NULL,
    `notes` TEXT NULL,
    `source` VARCHAR(64) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkout_submissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerUserId` INTEGER NULL,
    `firstName` VARCHAR(128) NOT NULL,
    `lastName` VARCHAR(128) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `addressLine1` VARCHAR(255) NOT NULL,
    `addressLine2` VARCHAR(255) NULL,
    `city` VARCHAR(128) NOT NULL,
    `state` VARCHAR(64) NOT NULL,
    `zip` VARCHAR(16) NOT NULL,
    `dateOfBirth` DATE NOT NULL,
    `ssnCiphertext` LONGBLOB NULL,
    `ssnEncryptedDek` LONGBLOB NULL,
    `ssnIv` LONGBLOB NULL,
    `ssnAuthTag` LONGBLOB NULL,
    `ssnLast4` VARCHAR(4) NULL,
    `idDocS3Key` VARCHAR(512) NULL,
    `idDocFilename` VARCHAR(255) NULL,
    `idDocMimeType` VARCHAR(64) NULL,
    `billDocS3Key` VARCHAR(512) NULL,
    `billDocFilename` VARCHAR(255) NULL,
    `billDocMimeType` VARCHAR(64) NULL,
    `signatureName` VARCHAR(255) NULL,
    `signatureDataUrl` LONGTEXT NULL,
    `signatureDate` DATETIME(3) NULL,
    `signatureIpHash` VARCHAR(128) NULL,
    `authConsent` BOOLEAN NOT NULL DEFAULT false,
    `paymentPlan` VARCHAR(16) NOT NULL,
    `stripeCustomerId` VARCHAR(255) NULL,
    `stripeSubscriptionId` VARCHAR(255) NULL,
    `stripeSubscriptionScheduleId` VARCHAR(255) NULL,
    `stripePaymentIntentId` VARCHAR(255) NULL,
    `stripePaymentMethodId` VARCHAR(255) NULL,
    `paymentStatus` VARCHAR(32) NOT NULL DEFAULT 'pending',
    `monthsBilled` INTEGER NOT NULL DEFAULT 0,
    `totalPaidCents` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `checkout_submissions_customerUserId_idx`(`customerUserId`),
    INDEX `checkout_submissions_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pii_audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminUserId` INTEGER NOT NULL,
    `checkoutSubmissionId` INTEGER NOT NULL,
    `field` VARCHAR(32) NOT NULL,
    `action` VARCHAR(32) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `userAgent` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pii_audit_logs_checkoutSubmissionId_idx`(`checkoutSubmissionId`),
    INDEX `pii_audit_logs_adminUserId_idx`(`adminUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_report_rounds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerUserId` INTEGER NOT NULL,
    `roundNumber` INTEGER NOT NULL,
    `summaryDate` DATE NOT NULL,
    `previousSummaryDate` DATE NULL,
    `equifaxScore` INTEGER NOT NULL,
    `equifaxPrevScore` INTEGER NOT NULL,
    `experianScore` INTEGER NOT NULL,
    `experianPrevScore` INTEGER NOT NULL,
    `transunionScore` INTEGER NOT NULL,
    `transunionPrevScore` INTEGER NOT NULL,
    `disputesDeletedThisRound` INTEGER NOT NULL DEFAULT 0,
    `disputesDeletedLastRound` INTEGER NOT NULL DEFAULT 0,
    `disputesDeletedGrandTotal` INTEGER NOT NULL DEFAULT 0,
    `disputesOnGoingThisRound` INTEGER NOT NULL DEFAULT 0,
    `disputesOnGoingLastRound` INTEGER NOT NULL DEFAULT 0,
    `disputesOnGoingGrandTotal` INTEGER NOT NULL DEFAULT 0,
    `unDisputedNegativeThisRound` INTEGER NOT NULL DEFAULT 0,
    `unDisputedNegativeLastRound` INTEGER NOT NULL DEFAULT 0,
    `unDisputedNegativeGrandTotal` INTEGER NOT NULL DEFAULT 0,
    `updatedToPositiveThisRound` INTEGER NOT NULL DEFAULT 0,
    `updatedToPositiveLastRound` INTEGER NOT NULL DEFAULT 0,
    `updatedToPositiveGrandTotal` INTEGER NOT NULL DEFAULT 0,
    `newItemsAddedThisRound` INTEGER NOT NULL DEFAULT 0,
    `newItemsAddedLastRound` INTEGER NOT NULL DEFAULT 0,
    `newItemsAddedGrandTotal` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `credit_report_rounds_customerUserId_idx`(`customerUserId`),
    UNIQUE INDEX `credit_report_rounds_customerUserId_roundNumber_key`(`customerUserId`, `roundNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_articles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `coverImageUrl` VARCHAR(512) NULL,
    `author` VARCHAR(128) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `news_articles_slug_key`(`slug`),
    INDEX `news_articles_published_publishedAt_idx`(`published`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(64) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `subject` VARCHAR(500) NOT NULL,
    `previewText` VARCHAR(500) NULL,
    `content` JSON NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_templates_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(128) NOT NULL,
    `value` TEXT NOT NULL,
    `group` VARCHAR(32) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_content` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page` VARCHAR(64) NOT NULL,
    `section` VARCHAR(64) NOT NULL,
    `content` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `page_content_page_section_key`(`page`, `section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `checkout_submissions` ADD CONSTRAINT `checkout_submissions_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `customer_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pii_audit_logs` ADD CONSTRAINT `pii_audit_logs_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pii_audit_logs` ADD CONSTRAINT `pii_audit_logs_checkoutSubmissionId_fkey` FOREIGN KEY (`checkoutSubmissionId`) REFERENCES `checkout_submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_report_rounds` ADD CONSTRAINT `credit_report_rounds_customerUserId_fkey` FOREIGN KEY (`customerUserId`) REFERENCES `customer_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
