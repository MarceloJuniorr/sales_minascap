import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [bolaoResponse, bolaoPremiumResponse] = await Promise.all([
      fetch("https://daniel.reconize.com.br/api/editions/active"),
      fetch("https://danielpremium.reconize.com.br/api/editions/active"),
    ]);

    const [bolaoData, bolaoPremiumData] = await Promise.all([
      bolaoResponse.json(),
      bolaoPremiumResponse.json(),
    ]);

    return NextResponse.json({
      edition: bolaoData[0]?.edition || "N/A",
      sorteio: bolaoData[0]?.sorteio || "Indisponível",
      bolaoValue: bolaoData[0]?.value || 10,
      bolaoPremiumValue: bolaoPremiumData[0]?.value || 90,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar os dados das edições" }, { status: 500 });
  }
}
