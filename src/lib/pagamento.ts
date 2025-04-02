import { prisma } from "@/lib/prisma";
import EfiPay from "sdk-node-apis-efi";
import options from "@/lib/credentials";
import * as cron from "node-cron";

const efipay = new EfiPay(options);
let cronIniciado = false;

export async function verificarStatusPagamento(pixId: string, baseUrl: string) {
  console.log(`${baseUrl} - Verificando pagamento para PIX ID: ${pixId}`);
  const cobranca = await prisma.cobranca.findUnique({ where: { pixId } });
  if (!cobranca) return { error: "Cobrança não encontrada", status: 400 };
  if (cobranca.status === 1) return { status: 1, pixId, pedidoId: cobranca.pedidoId };

  const params = { txid: cobranca.txid };
  const change = await efipay.pixDetailCharge(params);
  if (!change.pix || change.pix.length === 0) return { error: "Pagamento não encontrado", status: 422 };

  try {
    console.log(`Enviando webhook para: ${process.env.URL_BACKEND}/api/webhook`);
    await fetch(`${process.env.URL_BACKEND}/api/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(change),
    });
    await prisma.cobranca.update({ where: { pixId }, data: { status: 1 } });
    return { status: 1, pixId, pedidoId: cobranca.pedidoId };
  } catch (err) {
    console.error(`Erro ao disparar webhook: ${err}`);
    return { error: "Erro ao disparar webhook", status: 500 };
  }
}

export async function rotinaVerificacaoPedidos() {
  console.log("Executando rotina de verificação de pedidos...");

  const pedidosPendentes = await prisma.cobranca.findMany({
    where: { status: 0 },
  });

  for (const pedido of pedidosPendentes) {
    if (pedido.countRetry >= 20) {
      await prisma.cobranca.update({ where: { pixId: pedido.pixId }, data: { status: 2 } });
    } else if (process.env.URL_BACKEND) {
      await prisma.cobranca.update({ where: { pixId: pedido.pixId }, data: { countRetry: pedido.countRetry + 1 } });
      await verificarStatusPagamento(pedido.pixId, process.env.URL_BACKEND);
    }
  }
  console.log(`Rotina executada: ${pedidosPendentes.length} pedidos verificados.`);
}

if (!cronIniciado) {
  cronIniciado = true;

  cron.schedule("* * * * *", async () => {
    console.log("Executando cron job para verificação de pagamentos...");
    await rotinaVerificacaoPedidos();
  });

  console.log("Cron job de verificação de pagamentos iniciado com sucesso.");
}
