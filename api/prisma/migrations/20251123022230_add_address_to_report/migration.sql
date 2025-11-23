-- AlterTable
ALTER TABLE `report` ADD COLUMN `address` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PropositionVote` (
    `id` VARCHAR(191) NOT NULL,
    `propositionId` VARCHAR(191) NOT NULL,
    `voteType` VARCHAR(191) NOT NULL,
    `comment` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PropositionVote_userId_propositionId_key`(`userId`, `propositionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PropositionVote` ADD CONSTRAINT `PropositionVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
