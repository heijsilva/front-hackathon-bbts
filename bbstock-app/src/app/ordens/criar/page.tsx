'use client';

import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';

export default function CriarOrdemPage() {
  const qp = useSearchParams();

  const tipo = qp.get('tipo') ?? 'Compra';
  const codigo = qp.get('codigo') ?? '';
  const fornecedor = qp.get('fornecedor') ?? '';
  const origem = qp.get('origem') ?? '';
  const destino = qp.get('destino') ?? '';
  const contrato = qp.get('contrato') ?? '';
  const quantidade = qp.get('quantidade') ?? '';
  const valorUnit = qp.get('valorUnit') ?? '';

  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      {/* Corrigido: usar uma chave aceita pelo Header (ou remover o prop). */}
      <Header showTabs activeTab="criarordem" />
      {/* Alternativa sem destaque:
          <Header showTabs /> 
      */}

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <div className="rounded-2xl border border-[#E6ECFF] bg-white p-5">
          <h1 className="text-xl font-semibold text-[#0F1A2B] mb-4">
            Criar Ordem de {tipo}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tipo" value={tipo} />
            <Field label="Código" value={codigo} />
            <Field label="Fornecedor" value={fornecedor} />
            <Field label="Origem" value={origem} />
            <Field label="Destino" value={destino} />
            <Field label="Contrato" value={contrato} />
            <Field label="Quantidade" value={quantidade} />
            <Field label="Valor Unitário" value={valorUnit} />
          </div>

          <div className="mt-5 flex gap-2">
            <button className="bb-btn">Salvar</button>
            <button className="bb-btn-ghost">Cancelar</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-[#E6ECFF] bg-white">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold text-slate-900">{value || '-'}</div>
    </div>
  );
}