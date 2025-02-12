/*
  Warnings:

  - You are about to drop the column `produto` on the `Integracao` table. All the data in the column will be lost.
  - You are about to drop the column `bolaoQtd` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `cartelaQtd` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `premiumQtd` on the `Pedido` table. All the data in the column will be lost.
  - Added the required column `produtoId` to the `Integracao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Integracao` DROP COLUMN `produto`,
    ADD COLUMN `produtoId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Pedido` DROP COLUMN `bolaoQtd`,
    DROP COLUMN `cartelaQtd`,
    DROP COLUMN `premiumQtd`;

-- CreateTable
CREATE TABLE `Produto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `urlIntegracao` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Produto_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoProduto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedidoId` INTEGER NOT NULL,
    `produtoId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PedidoProduto` ADD CONSTRAINT `PedidoProduto_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoProduto` ADD CONSTRAINT `PedidoProduto_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Integracao` ADD CONSTRAINT `Integracao_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
