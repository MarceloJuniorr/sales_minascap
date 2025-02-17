/*
  Warnings:

  - Added the required column `urlIntegracao` to the `Integracao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Integracao` ADD COLUMN `urlIntegracao` VARCHAR(191) NOT NULL;
