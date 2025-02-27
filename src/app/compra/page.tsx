"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/CardContent";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CleaveInput } from "@/components/ui/CleaveInput";

interface Produto {
  cardboardLimit: number;
  groupLimit: number;
  id: number;
  nome: string;
  preco: string;
}

export default function PaymentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    cpf: "",
    produtosSelecionados: {} as Record<number, number>,
  });
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [edicao, setEdicao] = useState<string | null>(null);
  // Alteramos para boolean para facilitar a verificação
  const [activeSale, setActiveSale] = useState<boolean | null>(null);
  const [dataSorteio, setDataSorteio] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const edicaoRes = await fetch("/api/editions");
        const edicaoData = await edicaoRes.json();

        // Supondo que a API retorne activeSale como boolean
        if (edicaoData && edicaoData.edition && edicaoData.sorteio) {
          setEdicao(edicaoData.edition);
          setDataSorteio(edicaoData.sorteio);
          setActiveSale(edicaoData.activeSale);
          setProdutos(edicaoData.produtos || []);
        } else {
          setEdicao("N/A");
          setDataSorteio("Data não disponível");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setEdicao("Erro ao carregar");
        setDataSorteio("Erro ao carregar");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  // Cálculo do total a ser pago usando useMemo para otimizar performance
  const totalAmount = useMemo(() => {
    return Object.entries(formData.produtosSelecionados)
      .filter(([, qtd]) => qtd > 0)
      .reduce((acc, [produtoId, qtd]) => {
        const produto = produtos.find((p) => p.id === Number(produtoId));
        return acc + (produto ? parseFloat(produto.preco) * qtd : 0);
      }, 0);
  }, [formData.produtosSelecionados, produtos]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isProcessing) return; // Impede múltiplos cliques

    setIsProcessing(true); // Ativa o estado de carregamento

    try {
      const dataPix = JSON.stringify({
        amount: totalAmount,
        telefone: formData.phone,
        customerName: formData.name + " " + formData.surname,
        customerCpf: formData.cpf.replace(/\D/g, ""),
        produtos: Object.entries(formData.produtosSelecionados)
          .filter(([, qtd]) => qtd > 0)
          .map(([produtoId, qtd]) => ({
            produtoId: Number(produtoId),
            quantidade: qtd,
          })),
      });

      const response = await fetch("/api/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: dataPix,
      });

      const data: { qrCode: string; copyPasteCode: string; pedidoId: number } = await response.json();
      if (data.qrCode) {
        router.push(`/pix?pedidoId=${data.pedidoId}`);
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code Pix:", error);
    } finally {
      setIsProcessing(false); // Libera o botão após a requisição
    }
  };

  // Enquanto carrega, exibe mensagem de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-700 p-0">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  // Se activeSale for false, exibe mensagem amigável
  if (activeSale === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-700 p-0">
        <Card className="w-full max-w-md bg-red-700 text-white p-4">
          <CardContent>
            <div className="fixed top-0 left-0 right-0 h-[52px] bg-[#f8f8f8] flex items-center justify-center z-50">
              <Image
                src="https://app.minascap.com/assets/img/logo-topo.png"
                alt="Logo Topo"
                width={150}
                height={40}
              />
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">
              MINAS CAP | Edição: {edicao}
            </h2>
            <div className="text-center text-lg font-semibold mb-4">
              <p>As vendas para essa edição foram encerradas.</p>
              <p>Por favor, volte na próxima segunda-feira, onde a nova edição estará disponível.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Caso activeSale seja true, exibe o formulário
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-700 p-0">
      <Card className="w-full max-w-md bg-red-700 text-white p-4">
        <CardContent>
          <div className="fixed top-0 left-0 right-0 h-[52px] bg-[#f8f8f8] flex items-center justify-center z-50">
            <Image
              src="https://app.minascap.com/assets/img/logo-topo.png"
              alt="Logo Topo"
              width={150}
              height={40}
            />
          </div>
          <h2 className="text-xl font-bold mb-4 text-center">
            MINAS CAP | Edição: {edicao}
          </h2>

          <div className="text-center text-lg font-semibold mb-4">
            <p>
              Data do Sorteio: <span className="text-yellow-300">{dataSorteio}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Nome"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              name="surname"
              placeholder="Sobrenome"
              value={formData.surname}
              onChange={handleChange}
              required
            />
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
                    <span className="block font-bold text-lg">
                      {produto.nome} | R$ {produto.preco}
                    </span>
                    <span className="text-sm">
                      {produto.cardboardLimit} Cartelas e {produto.groupLimit} Pessoas
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      onClick={() => handleQuantityChange(produto.id, -1)}
                      className="p-2 rounded-full bg-yellow-700 hover:bg-yellow-600 font-bold"
                    >
                      -
                    </Button>
                    <span className="mx-2">
                      {formData.produtosSelecionados[produto.id] || 0}
                    </span>
                    <Button
                      type="button"
                      onClick={() => handleQuantityChange(produto.id, 1)}
                      className="p-2 rounded-full bg-yellow-700 hover:bg-yellow-600 font-bold"
                    >
                      +
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Totalizador */}
            <div className="text-center text-lg font-semibold text-yellow-300 mt-4">
              Total: R$ {totalAmount.toFixed(2)}
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-red-900 flex items-center justify-center"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                "Pagar com PIX"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
