"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function PixPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pedidoId = searchParams.get("pedidoId");
  const [copyPasteCode, setCopyPasteCode] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixId, setPixId] = useState<string | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!pedidoId) return;

    const fetchPaymentData = async () => {
      try {
        const response = await fetch(`/api/get-cobranca?pedidoId=${pedidoId}`);
        const data = await response.json();

        setCopyPasteCode(data.copyPasteCode);
        setQrCode(data.qrCode);
        setPixId(data.pixId);
        setTxid(data.txid);
      } catch (error) {
        console.error("Erro ao buscar dados da cobrança:", error);
      }
    };

    fetchPaymentData();
  }, [pedidoId]);

  useEffect(() => {
    if (!pixId) return;

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/status-pagamento?pixId=${pixId}`);
        const data = await response.json();

        if (data.status === 1) {
          router.push("/sucess"); // Redireciona para a tela de sucesso
        } else {
          setStatus(data.status);
        }
      } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
      }
    };

    const interval = setInterval(checkPaymentStatus, 5000); // Verifica a cada 5 segundos
    return () => clearInterval(interval);
  }, [pixId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800 p-4">
      <div className="w-full max-w-md bg-red-700 text-white p-4 shadow rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Aguardando Pagamento</h1>
        {pedidoId && <p className="text-center mb-4">Seu pedido <strong>#{pedidoId}</strong> está aguardando pagamento.</p>}

        {qrCode && (
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold">QR Code</h2>
            <Image src={qrCode} alt="QR Code" width={200} height={200} className="my-4" priority />
          </div>
        )}

        {copyPasteCode && (
          <div>
            <h2 className="text-lg font-semibold">Código Pix</h2>
            <p className="bg-red-600 p-2 rounded break-all">{copyPasteCode}</p>
          </div>
        )}

        <p className="text-center mt-4">
          Status: {status === 0 ? "Pendente" : status === 1 ? "Confirmado" : status === 2 ? "Erro no pagamento" : "Verificando..."}
        </p>
      </div>
    </div>
  );
}
