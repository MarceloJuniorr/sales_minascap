import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      select: {
        id: true,
        nome: true,
        descricao: true,
        urlIntegracao: true,
      },
    });

    // Buscar valores atualizados para cada produto
    const produtosComValores = await Promise.all(
        produtos.map(async (item: { nome: string; value?: number }) => {
          try {
            const response = await fetch(process.env.EFI_API_EDITION_URL!);
            const edicaoData: { nome: string; value: number }[] = await response.json();
      
            return {
              ...item,
              preco: edicaoData.find((produto) => produto.nome === item.nome)?.value || "N/A",
            };
          } catch (error) {
            console.error(`Erro ao buscar edição para o produto ${item.nome}:`, error);
            return { ...item, preco: "Erro" };
          }
        })
      );

    return NextResponse.json(produtosComValores);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}
