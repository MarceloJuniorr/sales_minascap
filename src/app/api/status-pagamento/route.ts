import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import EfiPay from "sdk-node-apis-efi";
import options from "@/lib/credentials"
const efipay = new EfiPay(options);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pixId = searchParams.get("pixId");

    if (!pixId) {
      return NextResponse.json({ error: "Pix ID é obrigatório" }, { status: 400 });
    }

    const cobranca = await prisma.cobranca.findUnique({
      where: { pixId }
    });
    if (!cobranca) {
      return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 400 });
    }
    if (cobranca.status === 1 ) {
        return NextResponse.json({ status: 1, pixId, pedidoId: cobranca.pedidoId });
    }

    const params = {
        txid: cobranca.txid,
    }
    

    const change = await efipay.pixDetailCharge(params);
    console.log(change)

    if (!change.pix || change.pix.length === 0) {
        return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 422 });
    } 
    
    let status = 0;
    try {
        const baseUrl = new URL(req.url).origin; // Obtém dinamicamente a origem da requisição
        await fetch(`${baseUrl}/api/webhook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(change),
          });
          status = 1
    } catch (error) {
        status=2
        console.log(error);
        console.error("Erro ao carregar dados:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Erro disparar webhook" }, { status: 500 });
    }




    return NextResponse.json({ status, pixId, pedidoId: cobranca.pedidoId });
  } catch (error) {
    console.error("Erro ao consultar status do pagamento:", error);
    return NextResponse.json({ error: "Erro ao consultar status do pagamento" }, { status: 500 });
  }
}
