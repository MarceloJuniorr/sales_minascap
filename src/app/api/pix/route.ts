import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import EfiPay from "sdk-node-apis-efi";
import options from "@/lib/credentials"
const efipay = new EfiPay(options);

export async function POST(req: Request) {
  try {
    const { amount, customerName, customerCpf, produtos,telefone } = await req.json();
    const cpfLimpo = customerCpf.replace(/\D/g, "");
    const telefoneLimpo = telefone.replace(/\D/g, "");
    console.log('Iniciando verificacao do cliente');
    
    // 1️⃣ Verifica se o cliente já existe
    let cliente = await prisma.cliente.findUnique({ where: { cpf: cpfLimpo } });

    
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: { nome: customerName, cpf: cpfLimpo, telefone: telefoneLimpo },
      });
    }

    console.log(cliente);


    // 2️⃣ Cria o pedido
    const pedido = await prisma.pedido.create({
      data: { 
        clienteId: cliente.id, 
        total: amount, 
        status: 0, // Pendente
      },
    });

    console.log(pedido);
    

    // 3️⃣ Adiciona os produtos ao pedido
    for (const { produtoId, quantidade } of produtos) {
      const newProduto= await prisma.pedidoProduto.create({
        data: { pedidoId: pedido.id, produtoId, quantidade },
      });
      console.log(newProduto)
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
    console.log(charge);
    
    const { loc, txid } = charge;

    // 5️⃣ Gerar QR Code
    const qrcode = await efipay.pixGenerateQRCode({ id: loc.id });
    console.log(qrcode);
    

    // 6️⃣ Salvar cobrança no banco
    await prisma.cobranca.create({
      data: {
        pedidoId: pedido.id,
        pixQrCode: qrcode.imagemQrcode,
        pixCopiaCola: qrcode.qrcode,
        pixId: loc.id.toString(),
        txid: txid
      },
    });

    return NextResponse.json({
      pedidoId:pedido.id,
      qrCode: qrcode.imagemQrcode,
      copyPasteCode: qrcode.qrcode,
      pixId: loc.id, // Passando o Pix ID
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Erro ao criar cobrança Pix" }, { status: 500 });
  }
}
