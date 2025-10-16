'use client';

import Header from '@/app/components/Header';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronRight, RefreshCcw } from 'lucide-react';

/* Tipos */
type Criticidade = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
type Alerta = {
  id: string;
  codigo: string;           // código do produto
  severidade: number;       // 0..100
  criticidade: Criticidade; // mapeado pela severidade
  dataEmissao: string;      // ISO string
  cd: string;               // Centro de Distribuição
};

/* Util */
function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/* Badge por criticidade */
function CritBadge({ level }: { level: Criticidade }) {
  const map = {
    Baixo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Médio': 'bg-amber-50 text-amber-700 border-amber-200',
    Alto: 'bg-orange-50 text-orange-700 border-orange-200',
    'Crítico': 'bg-red-50 text-red-700 border-red-200',
  } as const;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${map[level]}`}>
      {level}
    </span>
  );
}

/* Barra de severidade */
function SeveridadeBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const color =
    pct >= 85 ? 'bg-red-500' :
    pct >= 70 ? 'bg-orange-500' :
    pct >= 40 ? 'bg-amber-500' :
                'bg-emerald-500';
  return (
    <div className="w-full">
      <div className="h-2.5 w-full rounded-full bg-[#EEF2FF]">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-[#1E2A78] font-medium">{pct}%</div>
    </div>
  );
}

/* Mapeamento severidade -> criticidade */
function criticFromSev(sev: number): Criticidade {
  if (sev >= 85) return 'Crítico';
  if (sev >= 70) return 'Alto';
  if (sev >= 40) return 'Médio';
  return 'Baixo';
}

/* CDs mock (substitua pelo seu backend se quiser) */
const CDs = [
  'CD São Paulo',
  'CD Rio de Janeiro',
  'CD Curitiba',
  'CD Recife',
  'CD Salvador',
  'CD Brasília',
] as const;

/* Gera dados mock (troque por fetch ao seu backend) */
function generateMockAlertas(n = 18): Alerta[] {
  const codigos = [
    'ROXR-033849', 'AOLR-068182', 'WOSR-096625', 'AARO-020619', 'QOER-084064', 'VEIF-010806',
    'HCKB-398523', 'YOLR-082236', 'ZKTR-778901', 'PLMN-445566'
  ];
  const arr: Alerta[] = [];
  for (let i = 0; i < n; i++) {
    const codigo = codigos[Math.floor(Math.random() * codigos.length)];
    const sev = Math.floor(Math.random() * 101);
    const cd = CDs[Math.floor(Math.random() * CDs.length)];
    const dt = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)); // últimos 7 dias
    arr.push({
      id: `${codigo}-${i}-${dt.getTime()}`,
      codigo,
      severidade: sev,
      criticidade: criticFromSev(sev),
      dataEmissao: dt.toISOString(),
      cd,
    });
  }
  // Ordena por mais severo primeiro
  return arr.sort((a, b) => b.severidade - a.severidade);
}

/* Classe utilitária para filtros legíveis */
const filterInputCls =
  'h-12 rounded-xl bg-white px-4 text-[15px] text-[#0F1A2B] ' +
  'border border-[#9BB3FF] placeholder:text-[#6E7BA6] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#6B7CFF]/40 focus:border-[#4E61F0] ' +
  'shadow-sm w-full';

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [q, setQ] = useState('');
  const [criticFilter, setCriticFilter] = useState<Criticidade | 'Todos'>('Todos');
  const [cdFilter, setCdFilter] = useState<string>('Todos');

  useEffect(() => {
    // Substitua por fetch('/api/alertas') se já tiver endpoint
    setAlertas(generateMockAlertas());
  }, []);

  const filtrados = useMemo(() => {
    return alertas.filter((a) => {
      const matchQ = q
        ? a.codigo.toLowerCase().includes(q.toLowerCase()) ||
          a.cd.toLowerCase().includes(q.toLowerCase())
        : true;
      const matchCrit = criticFilter === 'Todos' ? true : a.criticidade === criticFilter;
      const matchCd = cdFilter === 'Todos' ? true : a.cd === cdFilter;
      return matchQ && matchCrit && matchCd;
    });
  }, [alertas, q, criticFilter, cdFilter]);

  function reload() {
    setAlertas(generateMockAlertas());
  }

  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      <Header showTabs activeTab="alertas" />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <section className="rounded-2xl border border-[#C7D2FE] bg-white/60 shadow-[inset_0_0_0_9999px_rgba(99,102,241,0.06)] p-4 sm:p-6">
          <div className="rounded-2xl border border-[#DDE7FF] bg-white">
            {/* Título + Ação */}
            <div className="px-5 py-4 border-b border-[#EEF2FF] flex items-center justify-between">
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1E2A78] flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Alertas Urgentes
              </h2>
              <button
                onClick={reload}
                className="inline-flex items-center gap-2 rounded-lg border border-[#9BB3FF] px-3 py-2
                           text-[#0F2C93] hover:bg-[#EEF3FF] bg-white shadow-sm"
                title="Recarregar"
              >
                <RefreshCcw size={16} /> Atualizar
              </button>
            </div>

            {/* Filtros com melhor legibilidade */}
            <div className="px-5 py-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 min-w-[260px]">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por código ou CD..."
                    className={filterInputCls}
                  />
                </div>
                <div className="w-full lg:w-[320px]">
                  <select
                    value={criticFilter}
                    onChange={(e) => setCriticFilter(e.target.value as any)}
                    className={filterInputCls}
                  >
                    <option value="Todos">Todas as criticidades</option>
                    <option value="Crítico">Crítico</option>
                    <option value="Alto">Alto</option>
                    <option value="Médio">Médio</option>
                    <option value="Baixo">Baixo</option>
                  </select>
                </div>
                <div className="w-full lg:w-[280px]">
                  <select
                    value={cdFilter}
                    onChange={(e) => setCdFilter(e.target.value)}
                    className={filterInputCls}
                  >
                    <option value="Todos">Todos os CDs</option>
                    {CDs.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de alertas */}
            <ul className="px-5 pb-5 divide-y divide-[#EEF2FF]">
              {filtrados.length === 0 && (
                <li className="py-10 text-center text-slate-500">Nenhum alerta encontrado.</li>
              )}
              {filtrados.map((a) => (
                <li key={a.id} className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Código + Criticidade */}
                    <div className="min-w-[210px]">
                      <div className="text-sm text-slate-500">Código do produto</div>
                      <div className="text-[15px] font-semibold text-slate-900">{a.codigo}</div>
                      <div className="mt-2">
                        <CritBadge level={a.criticidade} />
                      </div>
                    </div>

                    {/* Barra de severidade */}
                    <div className="flex-1">
                      <div className="text-sm text-slate-500 mb-1">Severidade</div>
                      <SeveridadeBar value={a.severidade} />
                    </div>

                    {/* Data emissão */}
                    <div className="min-w-[180px]">
                      <div className="text-sm text-slate-500">Emitido em</div>
                      <div className="text-[15px] font-medium text-slate-800">{fmtDate(a.dataEmissao)}</div>
                    </div>

                    {/* CD */}
                    <div className="min-w-[200px]">
                      <div className="text-sm text-slate-500">Centro de Distribuição</div>
                      <div className="text-[15px] font-medium text-slate-800">{a.cd}</div>
                    </div>

                    {/* Ação futura (modal) */}
                    <div className="min-w-[140px] flex justify-end">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-[#DDE7FF] px-3 py-2 text-[#0F2C93] hover:bg-[#F7FAFF]"
                        // onClick={() => openModal(a)} // para implementar depois
                      >
                        Ver detalhes <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}