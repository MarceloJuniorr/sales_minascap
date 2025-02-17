import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pedidoId = searchParams.get("pedidoId");

  if (!pedidoId) {
    return NextResponse.json({ error: "Pedido ID é obrigatório" }, { status: 400 });
  }

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(pedidoId) },
      include: { cobranca: true },
    });

    if (!pedido || !pedido.cobranca) {
      return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      qrCode: pedido.cobranca.pixQrCode,
      copyPasteCode: pedido.cobranca.pixCopiaCola,
      pixId: pedido.cobranca.pixId,
      txid: pedido.cobranca.txid
    });
  } catch (error) {
    console.error("Erro ao buscar cobrança:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
