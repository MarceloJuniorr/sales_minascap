import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pixId = searchParams.get("pixId");

    if (!pixId) {
      return NextResponse.json({ error: "Pix ID é obrigatório" }, { status: 400 });
    }

    const cobranca = await prisma.cobranca.findUnique({
      where: { pixId },
      select: { status: true },
    });

    if (!cobranca) {
      return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ status: cobranca.status });
  } catch (error) {
    console.error("Erro ao consultar status do pagamento:", error);
    return NextResponse.json({ error: "Erro ao consultar status do pagamento" }, { status: 500 });
  }
}
