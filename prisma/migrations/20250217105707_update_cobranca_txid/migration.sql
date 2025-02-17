/*
  Warnings:

  - A unique constraint covering the columns `[txid]` on the table `Cobranca` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `txid` to the `Cobranca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cobranca` ADD COLUMN `txid` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Cobranca_txid_key` ON `Cobranca`(`txid`);
