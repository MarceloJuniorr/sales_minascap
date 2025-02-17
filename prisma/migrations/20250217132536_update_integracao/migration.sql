/*
  Warnings:

  - Added the required column `amount` to the `Integracao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Integracao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Integracao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promoterid` to the `Integracao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Integracao` ADD COLUMN `amount` INTEGER NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `promoterid` VARCHAR(191) NOT NULL;
