import { prisma } from "@/lib/prisma";

async function adicionarProduto() {
  try {
    await prisma.produto.create({
        data: {
          nome: "Bolão",
          descricao: "Pacote com 10 Cartelas e 10 Pessoas",
          urlIntegracao: "http://localhost:8004",
        },
      });
    

    console.log("✅ Produto inserido com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inserir produto:", error);
  } finally {
    await prisma.$disconnect(); // Fecha a conexão com o banco
  }
}

adicionarProduto();