// /api/status-pagamento.ts
import { NextResponse } from "next/server";
import { verificarStatusPagamento } from "@/lib/pagamento";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pixId = searchParams.get("pixId");
    if (!pixId) return NextResponse.json({ error: "Pix ID é obrigatório" }, { status: 400 });

    const result = await verificarStatusPagamento(pixId, new URL(req.url).origin);
    return NextResponse.json(result, { status: result.status || 200 });
  } catch (err) {
    console.error("Erro ao verificar status do pagamento:", err);
    return NextResponse.json({ error: "Erro ao verificar status do pagamento" }, { status: 500 });
  }
}
