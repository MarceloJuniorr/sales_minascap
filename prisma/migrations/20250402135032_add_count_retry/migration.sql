-- AlterTable
ALTER TABLE `Cobranca` ADD COLUMN `countRetry` INTEGER NOT NULL DEFAULT 0,
    MODIFY `pixQrCode` TEXT NOT NULL;
