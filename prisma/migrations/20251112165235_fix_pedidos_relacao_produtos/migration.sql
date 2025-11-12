-- CreateTable
CREATE TABLE `Pedidos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PedidosProdutos` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PedidosProdutos_AB_unique`(`A`, `B`),
    INDEX `_PedidosProdutos_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PedidosProdutos` ADD CONSTRAINT `_PedidosProdutos_A_fkey` FOREIGN KEY (`A`) REFERENCES `Pedidos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PedidosProdutos` ADD CONSTRAINT `_PedidosProdutos_B_fkey` FOREIGN KEY (`B`) REFERENCES `Produtos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
