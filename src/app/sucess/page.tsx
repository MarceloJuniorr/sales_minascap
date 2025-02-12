"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/CardContent";
import { Button } from "@/components/ui/Button";

export default function PaymentSuccess() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800 p-4">
      <Card className="w-full max-w-md bg-red-700 text-white p-6 text-center">
        <CardContent>
          <div className="text-6xl mb-4 text-yellow-400">✅</div>
          <h2 className="text-2xl font-bold">Pagamento Aprovado!</h2>
          <p className="mt-2">Obrigado pela sua compra.</p>
          <p className="mt-1">Em breve, você receberá as informações dos grupos e cartelas no WhatsApp.</p>
          <Button 
            onClick={() => router.push("/")}
            className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-red-900 py-2 rounded">
            Voltar para Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
