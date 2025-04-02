import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log('Webhook recebido' + req);
    
    const notification = await req.json();
    const txid = notification.pix[0]?.txid;

    if (!txid) {
      return NextResponse.json({ error: "ID do Pix não encontrado" }, { status: 400 });
    }

    // Atualiza o status da cobrança para '1' (Confirmado)
    const cobranca = await prisma.cobranca.update({
      where: { txid },
      data: { status: 1 },
      include: {
        pedido: {
          include: {
            cliente: true,
            itensPedido: {
              include: {
                produto: true, // Inclui as URLs de integração de cada produto
              },
            },
          },
        },
      },
    });

    if (!cobranca.pedido) {
      return NextResponse.json({ error: "Pedido não encontrado para essa cobrança" }, { status: 400 });
    }

    // Preparar os dados para envio à plataforma de vendas
    const cliente = cobranca.pedido.cliente;
    const integracoes = cobranca.pedido.itensPedido.map((item) => ({
      pedidoId: cobranca.pedido.id,
      produtoId: item.produto.id,
      urlIntegracao: item.produto.urlIntegracao,
      amount: item.quantidade,
      name: cliente.nome,
      phone: cliente.telefone,
      promoterid: process.env.NEXT_PUBLIC_PROMOTER_ID!, // Definir via variável de ambiente
      status: 0, // 0 = Pendente, até que a venda seja registrada
    }));

    // Criar os registros de integração no banco antes do envio
    await prisma.integracao.createMany({ data: integracoes });

    // Fazer o POST para cada produto comprado
    for (const integracao of integracoes) {
      try {
        const response = await fetch(`${integracao.urlIntegracao}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: integracao.amount,
            customer: { name: integracao.name, phone: integracao.phone },
            name: integracao.name,
            phone: integracao.phone,
            promoterid: integracao.promoterid,
          }),
        });

        const responseData = await response.json();

        if (response.ok) {
          // Atualiza o status da integração para '1' (Enviado)
          await prisma.integracao.updateMany({
            where: { pedidoId: integracao.pedidoId, produtoId: integracao.produtoId },
            data: { status: 1 }, // 1 = Enviado com sucesso
          });
          console.log(`Venda enviada com sucesso: ${responseData.transaction}`);
        } else {
          // Se houver erro, registra o status como '2' (Erro)
          await prisma.integracao.updateMany({
            where: { pedidoId: integracao.pedidoId, produtoId: integracao.produtoId },
            data: { status: 2 }, // 2 = Erro no envio
          });
          console.error(`Erro ao enviar venda para ${integracao.urlIntegracao}:`, responseData);
        }
      } catch (error) {
        console.error(`Erro na requisição para ${integracao.urlIntegracao}:`, error);
        await prisma.integracao.updateMany({
          where: { pedidoId: integracao.pedidoId, produtoId: integracao.produtoId },
          data: { status: 2 }, // 2 = Erro no envio
        });
      }
    }

    return NextResponse.json({ message: "Pagamento confirmado e vendas enviadas com sucesso" });
  } catch (error) {
    console.error("Erro ao processar webhook:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Erro no Webhook" }, { status: 500 });
  }
}
