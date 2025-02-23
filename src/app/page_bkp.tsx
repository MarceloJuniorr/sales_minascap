"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const [edicao, setEdicao] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/editions")
      .then((res) => res.json())
      .then((data) => setEdicao(data.edition)) // Ajuste conforme a API retorna
      .catch((error) => console.error("Erro ao buscar edição:", error));
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col justify-between bg-gray-100">
      {/* Imagem Dinâmica otimizada com next/image */}
      {edicao ? (
        <div className="relative w-full h-full">
          <Image
            src={`https://www.minascap.com/MINASCAP/_lib/file/img/${edicao}_BANNER_APP_1080x1920-compressed.jpg`}
            alt="Banner Minas Cap"
            layout="fill"
            objectFit="cover"
            priority // Carrega com prioridade para melhorar o LCP
          />
        </div>
      ) : (
        <p className="text-center mt-10 text-lg">Carregando imagem...</p>
      )}

      {/* Botões Fixos */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center gap-4 p-4 bg-white shadow-lg">
        <button
          className="w-1/2 bg-red-600 text-white py-3 rounded-md text-lg font-bold"
          onClick={() => router.push("/resultado")}
        >
          Resultado
        </button>
        <button
          className="w-1/2 bg-green-600 text-white py-3 rounded-md text-lg font-bold"
          onClick={() => router.push("/comprar")}
        >
          Comprar
        </button>
      </div>
    </div>
  );
}
