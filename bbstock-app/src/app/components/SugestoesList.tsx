'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

type Categoria = 'Economia' | 'Oportunidades' | 'Risco';

type Sugestao = {
  id: string;
  titulo: string;
  descricao: string;
  economiaEstimativaBRL?: number; // em reais/ano
  impacto: 'Alto' | 'Médio' | 'Baixo';
  categoria: Categoria;
  acaoLabel?: string;
};

function formatBRL(n?: number) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

const categoriaCls: Record<Categoria, { bg: string; text: string; border: string }> = {
  Economia: { bg: 'bg-[#E9FCEB]', text: 'text-[#16a34a]', border: 'border-[#c7f0cf]' },
  Oportunidades: { bg: 'bg-[#E9F2FF]', text: 'text-[#1d4ed8]', border: 'border-[#cfe0ff]' },
  Risco: { bg: 'bg-[#FFF1F2]', text: 'text-[#e11d48]', border: 'border-[#FAD1D7]' },
};

function CategoriaPill({ categoria }: { categoria: Categoria }) {
  const c = categoriaCls[categoria];
  return (
    <span
      className={`inline-flex items-center rounded-full ${c.bg} ${c.text} border ${c.border} px-3 py-1 text-[12px] font-semibold`}
    >
      {categoria}
    </span>
  );
}

function IconeSugestao() {
  return (
    <div className="grid place-items-center h-14 w-14 rounded-xl bg-[#FFFBEA] border border-[#FDE68A] text-[#CA8A04]">
      <Sparkles size={22} />
    </div>
  );
}

function CardSugestao({
  sugestao,
  onApply,
  loading,
  applied,
}: {
  sugestao: Sugestao;
  onApply: (id: string) => Promise<void>;
  loading: boolean;
  applied: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#E6ECFF] bg-white p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
      <div className="flex gap-4">
        <IconeSugestao />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[#1E2A78] font-semibold">{sugestao.titulo}</div>
              <p className="text-[#5B6B98] text-[14px] mt-1 leading-relaxed">{sugestao.descricao}</p>
            </div>
            <CategoriaPill categoria={sugestao.categoria} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-[#6b7280] text-sm">Economia Estimada</div>
              <div className="text-[26px] font-extrabold text-[#16a34a] leading-tight">
                {formatBRL(sugestao.economiaEstimativaBRL)}
              </div>
            </div>
            <div>
              <div className="text-[#6b7280] text-sm">Impacto</div>
              <div className="text-[#1E2A78] font-semibold mt-1">{sugestao.impacto}</div>
            </div>
            <div className="flex items-end sm:items-center sm:justify-end">
              <button
                disabled={loading || applied}
                onClick={() => onApply(sugestao.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-white font-semibold transition
                  ${applied ? 'bg-[#059669]' : 'bg-[#0F2C93] hover:bg-[#0c257b]'}
                  disabled:opacity-60`}
                aria-label="Aplicar sugestão"
              >
                {applied ? 'Aplicada' : sugestao.acaoLabel ?? 'Aplicar'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SugestoesList() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [aplicadas, setAplicadas] = useState<Record<string, boolean>>({});

  const sugestoes = useMemo<Sugestao[]>(
    () => [
      {
        id: 's1',
        titulo: 'Considerar Fornecedores de TI',
        descricao:
          'Identificamos 5 fornecedores com produtos similares. Consolidação pode gerar economia de até R$ 280K/ano.',
        economiaEstimativaBRL: 280_000,
        impacto: 'Alto',
        categoria: 'Economia',
        acaoLabel: 'Aplicar',
      },
      {
        id: 's2',
        titulo: 'Antecipar Compra de Papel',
        descricao:
          'Previsão de aumento de 15% no preço. Recomendar compra antecipada para os próximos 6 meses.',
        economiaEstimativaBRL: 85_000,
        impacto: 'Médio',
        categoria: 'Oportunidades',
        acaoLabel: 'Aplicar',
      },
      {
        id: 's3',
        titulo: 'Revisar Contrato de Logística',
        descricao:
          'KPIs de SLA fora da meta nas regiões Sul e Sudeste. Revisão pode reduzir custos de urgência em 12%.',
        economiaEstimativaBRL: 120_000,
        impacto: 'Alto',
        categoria: 'Risco',
        acaoLabel: 'Mitigar',
      },
    ],
    []
  );

  async function aplicarSugestao(id: string) {
    try {
      setLoadingId(id);
      // Chamada opcional a uma API mock (comente se não quiser)
      await new Promise((r) => setTimeout(r, 900));
      // await fetch('/api/sugestoes/apply', { method: 'POST', body: JSON.stringify({ id }) });
      setAplicadas((prev) => ({ ...prev, [id]: true }));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="bg-[#EEF3FF] rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        {sugestoes.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white/80 border border-[#E1E8FF] overflow-hidden">
            <CardSugestao
              sugestao={s}
              onApply={aplicarSugestao}
              loading={loadingId === s.id}
              applied={!!aplicadas[s.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}