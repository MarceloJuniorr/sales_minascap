"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/CardContent";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CleaveInput } from "@/components/ui/CleaveInput";

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: string; // Preço atualizado obtido do endpoint de edição
}

export default function PaymentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    cpf: "",
    produtosSelecionados: {} as Record<number, number>, // ID do produto => quantidade
  });
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch("/api/produtos");
        const data = await response.json();
        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    };
    fetchProdutos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (produtoId: number, delta: number) => {
    setFormData((prev) => {
      const novaQuantidade = Math.max(0, (prev.produtosSelecionados[produtoId] || 0) + delta);
      return {
        ...prev,
        produtosSelecionados: { ...prev.produtosSelecionados, [produtoId]: novaQuantidade },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const totalAmount = Object.entries(formData.produtosSelecionados)
      .filter(([, qtd]) => qtd > 0)
      .reduce((acc, [produtoId, qtd]) => {
        const produto = produtos.find((p: { id: number; preco: string }) => p.id === Number(produtoId));
        return acc + (produto ? parseFloat(produto.preco) * (qtd as number) : 0);
      }, 0);
  
    try {
      const response = await fetch("/api/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          customerName: formData.name,
          customerCpf: formData.cpf.replace(/\D/g, ""), // Remove caracteres não numéricos do CPF
          produtos: Object.entries(formData.produtosSelecionados)
            .filter(([, qtd]) => qtd > 0)
            .map(([produtoId, qtd]) => ({
              produtoId: Number(produtoId),
              quantidade: qtd as number,
            })),
        }),
      });
  
      const data: { qrCode: string; copyPasteCode: string; pedidoId: number } = await response.json();
      if (data.qrCode) {
        router.push(`/pix?pedidoId=${data.pedidoId}&copyPasteCode=${encodeURIComponent(data.copyPasteCode)}&qrCode=${encodeURIComponent(data.qrCode)}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erro ao gerar QR Code Pix:", error.message);
      } else {
        console.error("Erro desconhecido ao gerar QR Code Pix");
      }
    }
  };
  
  
  
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800 p-4">
      <Card className="w-full max-w-md bg-red-700 text-white p-4">
        <CardContent>
          <h2 className="text-xl font-bold mb-4 text-center">MINAS CAP | SELECIONE SEUS PRODUTOS</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Nome" value={formData.name} onChange={handleChange} required />
            <Input name="surname" placeholder="Sobrenome" value={formData.surname} onChange={handleChange} required />
            <CleaveInput
              options={{ phone: true, phoneRegionCode: "BR" }}
              name="phone"
              placeholder="Telefone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <CleaveInput
              options={{ blocks: [3, 3, 3, 2], delimiters: [".", ".", "-"], numericOnly: true }}
              name="cpf"
              placeholder="CPF"
              value={formData.cpf}
              onChange={handleChange}
              required
            />

            {/* Renderiza os produtos dinamicamente */}
            <div className="space-y-4">
              {produtos.map((produto) => (
                <Card key={produto.id} className="p-4 flex justify-between items-center bg-red-600">
                  <div>
                    <span className="block font-bold">{produto.nome}</span>
                    <span className="text-sm">{produto.descricao}</span>
                    <span className="text-lg font-bold block mt-1">R$ {produto.preco}</span>
                  </div>
                  <div className="flex items-center">
                    <Button onClick={() => handleQuantityChange(produto.id, -1)} className="px-2">-</Button>
                    <span className="mx-2">{formData.produtosSelecionados[produto.id] || 0}</span>
                    <Button onClick={() => handleQuantityChange(produto.id, 1)} className="px-2">+</Button>
                  </div>
                </Card>
              ))}
            </div>

            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-red-900">
              Gerar QR Code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
