"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/CardContent";

export default function PaymentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [edicao, setEdicao] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const edicaoRes = await fetch("/api/editions");
        const edicaoData = await edicaoRes.json();

        if (edicaoData && edicaoData.edition && edicaoData.sorteio) {
          setEdicao(edicaoData.edition);
        } else {
          setEdicao("N/A");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setEdicao("Erro ao carregar");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompra = () => {
    router.push("/compra");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800 p-0">
      <Card className="w-full max-w-md bg-red-700 text-white p-0 relative">
        <CardContent>
          <div className="text-center text-lg font-semibold mb-4">
          <div className="fixed top-0 left-0 right-0 h-[52px] bg-[#f8f8f8] flex items-center justify-center z-50">
            <Image
              src="https://app.minascap.com/assets/img/logo-topo.png"
              alt="Logo Topo"
              width={150} // ajuste conforme necessário
              height={40} // ajuste conforme necessário
            />
          </div>
            {isLoading ? (
              <p>Carregando edição...</p>
            ) : edicao && edicao !== "N/A" && edicao !== "Erro ao carregar" ? (
              <div className="relative w-full aspect-[9/16] mt-14">
                <Image
                  //src={`https://www.minascap.com/MINASCAP/_lib/file/img/${edicao}_BANNER_APP_1080x1920-compressed.jpg`}
                  src={`https://www.minascap.com/MINASCAP/_lib/file/img/XXX_BANNER_APP_1080x1920-compressed(4).jpg`}
                  alt="Banner Minas Cap"
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </div>
            ) : (
              <p>Imagem não disponível.</p>
            )}
          </div>
          {/* Container sticky para o botão */}
          <div className="sticky bottom-0 pt-0 bg-red-700">
            <button
              onClick={handleCompra}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-2 px-4 h-[52px] shadow"
            >
              Adquira seu bolão agora!
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
