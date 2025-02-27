import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const response = await fetch(process.env.EFI_API_EDITION_URL!);
    const edicaoData = await response.json();    

    const baseUrl = new URL(req.url).origin; // Obtém dinamicamente a origem da requisição
    const produtosResponse = await fetch(`${baseUrl}/api/produtos`);
    const produtos = await produtosResponse.json();
    console.log(produtos);
    


    return NextResponse.json({
      edition: edicaoData[0].edition,
      sorteio: edicaoData[0].sorteio,
      activeSale: edicaoData[0].activeSale,
      produtos,
    });
  } catch (error) {
    console.error("Erro ao buscar edição e produtos:", error);
    return NextResponse.json({ error: "Erro ao buscar edição e produtos" }, { status: 500 });
  }
}


