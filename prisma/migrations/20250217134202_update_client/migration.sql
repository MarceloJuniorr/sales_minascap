/*
  Warnings:

  - Made the column `telefone` on table `Cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Cliente` MODIFY `telefone` VARCHAR(191) NOT NULL;
