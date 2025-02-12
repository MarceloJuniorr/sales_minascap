/*
  Warnings:

  - You are about to alter the column `status` on the `Cobranca` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `status` on the `Integracao` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `status` on the `Pedido` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Cobranca` MODIFY `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Integracao` MODIFY `status` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Pedido` MODIFY `status` INTEGER NOT NULL DEFAULT 0;
