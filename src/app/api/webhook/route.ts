import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const notification = await req.json();
    const pixId = notification.pix[0]?.txid;

    if (!pixId) {
      return NextResponse.json({ error: "ID do Pix não encontrado" }, { status: 400 });
    }

    // Atualiza o status do pagamento para 1 (Confirmado)
    const cobranca = await prisma.cobranca.update({
      where: { pixId },
      data: { status: 1 },
      include: {
        pedido: {
          include: {
            itensPedido: {
              include: {
                produto: true,
              },
            },
          },
        },
      },
    });

    if (!cobranca.pedido) {
      return NextResponse.json({ error: "Pedido não encontrado para essa cobrança" }, { status: 400 });
    }

    // Criar os registros na tabela de integração com status 0 (pendente)
    const integracoes = cobranca.pedido.itensPedido.map((item) => ({
      pedidoId: cobranca.pedido.id,
      produtoId: item.produto.id,
      status: 0, // Pendente
    }));

    await prisma.integracao.createMany({ data: integracoes });

    return NextResponse.json({ message: "Pagamento confirmado e integração criada com sucesso" });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Erro no Webhook" }, { status: 500 });
  }
}
