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
        produtos.map(async (item: { nome: string; urlIntegracao: string; id: number}) => {
          try {
            const response = await fetch(item.urlIntegracao + '/api/editions/active');
            
            const edicaoData: { 
              value: number; 
              groupLimit: number; 
              cardboardLimit: number;
              activeSale: boolean}[] = await response.json();
            
            if (edicaoData[0].activeSale === true) {
              
              return {
                id: item.id,
                nome: item.nome,
                preco: edicaoData[0].value,
                groupLimit: edicaoData[0].groupLimit,
                cardboardLimit: edicaoData[0].cardboardLimit
              };
            }
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
