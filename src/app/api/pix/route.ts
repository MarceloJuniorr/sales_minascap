import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import EfiPay from "sdk-node-apis-efi";
import path from "path";

const efipay = new EfiPay({
  sandbox: true,
  client_id: process.env.EFI_CLIENT_ID!,
  client_secret: process.env.EFI_CLIENT_SECRET!,
  certificate: path.resolve(process.cwd(), process.env.EFI_CERTIFICATE_PATH!),
});

export async function POST(req: Request) {
  try {
    const { amount, customerName, customerCpf, produtos } = await req.json();
    const cpfLimpo = customerCpf.replace(/\D/g, "");

    // 1️⃣ Verifica se o cliente já existe
    let cliente = await prisma.cliente.findUnique({ where: { cpf: cpfLimpo } });
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: { nome: customerName, cpf: cpfLimpo },
      });
    }

    // 2️⃣ Cria o pedido
    const pedido = await prisma.pedido.create({
      data: { 
        clienteId: cliente.id, 
        total: amount, 
        status: 0, // Pendente
      },
    });

    // 3️⃣ Adiciona os produtos ao pedido
    for (const { produtoId, quantidade } of produtos) {
      await prisma.pedidoProduto.create({
        data: { pedidoId: pedido.id, produtoId, quantidade },
      });
    }

    // 4️⃣ Criar cobrança Pix via Efi Bank
    const chargeInput = {
      calendario: { expiracao: 3600 },
      devedor: { cpf: cpfLimpo, nome: customerName },
      valor: { original: amount.toFixed(2) },
      chave: process.env.EFI_PIX_KEY!,
      infoAdicionais: [{ nome: "Descrição", valor: "Pagamento do Bolão" }],
    };

    const charge = await efipay.pixCreateImmediateCharge({}, chargeInput);
    const { loc } = charge;

    // 5️⃣ Gerar QR Code
    const qrcode = await efipay.pixGenerateQRCode({ id: loc.id });

    // 6️⃣ Salvar cobrança no banco
    await prisma.cobranca.create({
      data: {
        pedidoId: pedido.id,
        pixQrCode: qrcode.imagemQrcode,
        pixCopiaCola: qrcode.qrcode,
        pixId: loc.id.toString(),
      },
    });

    return NextResponse.json({
      qrCode: qrcode.imagemQrcode,
      copyPasteCode: qrcode.qrcode,
    });
  } catch (error) {
    console.error("Erro ao criar cobrança Pix:", error);
    return NextResponse.json({ error: "Erro ao criar cobrança Pix" }, { status: 500 });
  }
}
