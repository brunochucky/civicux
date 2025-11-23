-- AlterTable
ALTER TABLE `user` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `age` INTEGER NULL,
    ADD COLUMN `education` VARCHAR(191) NULL,
    ADD COLUMN `interests` JSON NULL,
    ADD COLUMN `notificationChannel` VARCHAR(191) NULL,
    ADD COLUMN `profession` VARCHAR(191) NULL,
    ADD COLUMN `receiveUpdates` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `subscribedThemes` JSON NULL,
    ADD COLUMN `whatsapp` VARCHAR(191) NULL;
