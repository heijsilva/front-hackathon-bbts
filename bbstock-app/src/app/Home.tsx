'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Package, ClipboardList, AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type KpiProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  badgeBg: string;
};

function KpiCard({ icon, label, value, badgeBg }: KpiProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE7FF] p-5 shadow-[0_10px_24px_-12px_rgba(26,35,126,0.15)]">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl grid place-items-center ring-1 ring-black/10" style={{ background: badgeBg }}>
          {icon}
        </div>
        <span className="text-sm text-[#6b7280]">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-[#1f2937]">{value}</div>
    </div>
  );
}

// Util: clamp + jitter
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function jitter(n: number, amt = 2, min = 0) {
  const j = n + (Math.random() * amt * 2 - amt);
  return clamp(Math.round(j), min, Number.MAX_SAFE_INTEGER);
}

export default function Home() {
  // Base de labels mensais
  const monthlyLabels = useMemo(
    () => ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    []
  );

  // Estados com dados "vivos"
  const [contratosLinha, setContratosLinha] = useState<number[]>([120, 126, 130, 128, 135, 142, 148, 150, 152, 154, 155, 156]);
  const [contratosPrestes, setContratosPrestes] = useState<number[]>([5, 7, 6, 8, 9, 10, 11, 12, 13, 11, 10, 9]);
  const [contratosVencidos, setContratosVencidos] = useState<number[]>([1, 1, 2, 2, 3, 2, 1, 2, 3, 3, 4, 4]);

  const [alertasMensais, setAlertasMensais] = useState<number[]>([8, 12, 7, 10, 14, 9, 11, 16, 12, 10, 9, 13]);

  // Estoque por classe (unidades)
  const [estoqueClasseABC, setEstoqueClasseABC] = useState<{ A: number; B: number; C: number }>({
    A: 820,
    B: 1560,
    C: 2310,
  });

  // Baixa por categoria (horizontal)
  const baixaEstoquePorCategoria = useMemo(
    () => ({
      labels: ['Cabo', 'Conector', 'Módulo', 'Transceptor', 'Bateria', 'Outros'],
    }),
    []
  );
  const [baixaEstoqueValores, setBaixaEstoqueValores] = useState<number[]>([22, 18, 12, 9, 7, 5]);

  // Ordens de planejamento
  const ordensPlanejamentoLabels = useMemo(
    () => ['Abertas', 'Em execução', 'Aguardando aprovação', 'Concluídas'],
    []
  );
  const [ordensPlanejamentoValores, setOrdensPlanejamentoValores] = useState<number[]>([23, 12, 7, 48]);

  // KPIs (exibidos no topo) — podem derivar dos estados acima ou ser independentes
  const kpiContratosAtivos = contratosLinha[contratosLinha.length - 1]; // último mês
  const kpiEstoqueAtualUnidades = estoqueClasseABC.A + estoqueClasseABC.B + estoqueClasseABC.C; // unidades
  const kpiOrdensServicoAbertas = 37; // mock
  const kpiPendencias = 23; // mock

  // Atualização artificial periódica
  useEffect(() => {
    const interval = setInterval(() => {
      // Desliza/atualiza séries mensais com jitter leve
      setContratosLinha((prev) => {
        const next = [...prev];
        next.shift();
        next.push(jitter(prev[prev.length - 1], 3, 100));
        return next;
      });

      setContratosPrestes((prev) => {
        const next = [...prev];
        next.shift();
        next.push(jitter(prev[prev.length - 1], 2, 3));
        return next;
      });

      setContratosVencidos((prev) => {
        const next = [...prev];
        next.shift();
        next.push(jitter(prev[prev.length - 1], 1, 0));
        return next;
      });

      setAlertasMensais((prev) => {
        const next = [...prev];
        next.shift();
        next.push(jitter(prev[prev.length - 1], 3, 5));
        return next;
      });

      // Estoque ABC oscila levemente, mas mantém totais plausíveis
      setEstoqueClasseABC((prev) => {
        const A = clamp(jitter(prev.A, 10, 600), 400, 1200);
        const B = clamp(jitter(prev.B, 15, 900), 700, 2200);
        const C = clamp(jitter(prev.C, 20, 1200), 1000, 3200);
        return { A, B, C };
      });

      setBaixaEstoqueValores((prev) => prev.map((v) => clamp(jitter(v, 2, 1), 1, 30)));

      setOrdensPlanejamentoValores((prev) => {
        // Mantém “Concluídas” mais estável, oscila os demais
        return prev.map((v, i) => (i === 3 ? clamp(jitter(v, 1, 40), 35, 60) : clamp(jitter(v, 2, 3), 3, 30)));
      });
    }, 5000); // 5s

    return () => clearInterval(interval);
  }, []);

  // Gráfico combo: Contratos Ativos/Prestes/Vencidos
  const contratosComboData: ChartData<'line'> = useMemo(
    () => ({
      labels: monthlyLabels,
      datasets: [
        {
          label: 'Contratos Ativos',
          data: contratosLinha,
          borderColor: '#1a237e',
          backgroundColor: 'rgba(26,35,126,0.12)',
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Prestes a Vencer',
          data: contratosPrestes,
          borderColor: '#ffa726',
          backgroundColor: 'rgba(255,167,38,0.12)',
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Vencidos',
          data: contratosVencidos,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.12)',
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [monthlyLabels, contratosLinha, contratosPrestes, contratosVencidos]
  );

  const contratosComboOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: { color: '#4b5563', usePointStyle: true, boxWidth: 8 },
        },
        tooltip: { mode: 'index' as const, intersect: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: { grid: { color: 'rgba(26,35,126,0.08)' }, ticks: { color: '#6b7280' } },
      },
    }),
    []
  );

  // Barras: Alertas emitidos
  const barAlertasData = useMemo(
    () => ({
      labels: monthlyLabels,
      datasets: [
        {
          label: 'Alertas Emitidos',
          data: alertasMensais,
          backgroundColor: 'rgba(255,167,38,0.25)',
          borderColor: '#ffa726',
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(255,167,38,0.45)',
        },
      ],
    }),
    [monthlyLabels, alertasMensais]
  );

  const barAlertasOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: { grid: { color: 'rgba(26,35,126,0.08)' }, ticks: { color: '#6b7280' } },
      },
    }),
    []
  );

  // Barras: Estoque atual por classe (A/B/C) — unidades
  const barEstoqueABCData = useMemo(
    () => ({
      labels: ['Classe A', 'Classe B', 'Classe C'],
      datasets: [
        {
          label: 'Unidades em estoque',
          data: [estoqueClasseABC.A, estoqueClasseABC.B, estoqueClasseABC.C],
          backgroundColor: ['#1a237e22', '#00897b22', '#4f46e522'],
          borderColor: ['#1a237e', '#00897b', '#4f46e5'],
          borderWidth: 1.5,
          borderRadius: 8,
          hoverBackgroundColor: ['#1a237e33', '#00897b33', '#4f46e533'],
        },
      ],
    }),
    [estoqueClasseABC]
  );

  const barEstoqueABCOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => ` ${ctx.parsed.y} un.`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: {
          grid: { color: 'rgba(26,35,126,0.08)' },
          ticks: {
            color: '#6b7280',
            callback: (v: any) => `${v} un.`,
          },
        },
      },
    }),
    []
  );

  // Horizontal: Produtos em baixa por categoria
  const barHorizontalBaixaData = useMemo(
    () => ({
      labels: baixaEstoquePorCategoria.labels,
      datasets: [
        {
          label: 'Produtos em baixa',
          data: baixaEstoqueValores,
          backgroundColor: 'rgba(0,137,123,0.25)',
          borderColor: '#00897b',
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(0,137,123,0.45)',
        },
      ],
    }),
    [baixaEstoquePorCategoria, baixaEstoqueValores]
  );

  const barHorizontalBaixaOptions = useMemo(
    () => ({
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(26,35,126,0.08)' }, ticks: { color: '#6b7280' } },
        y: { grid: { display: false }, ticks: { color: '#6b7280' } },
      },
    }),
    []
  );

  // Doughnut: Ordens de planejamento
  const doughnutOrdensData = useMemo(
    () => ({
      labels: ordensPlanejamentoLabels,
      datasets: [
        {
          label: 'Ordens',
          data: ordensPlanejamentoValores,
          backgroundColor: ['#1a237e', '#00897b', '#ffa726', '#c7d2fe'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }),
    [ordensPlanejamentoLabels, ordensPlanejamentoValores]
  );

  const doughnutOrdensOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#4b5563', usePointStyle: true, boxWidth: 8 } },
      },
      cutout: '62%',
    }),
    []
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="rounded-2xl border border-[#CFE0FF] bg-[#F7FAFF] p-4 sm:p-6">
        <div className="rounded-2xl border border-[#DDE7FF] bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna esquerda */}
            <section>
              <h2 className="text-[20px] font-semibold text-[#213B9A]">Visão geral do sistema de estoque</h2>

              {/* KPIs */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <KpiCard
                  icon={<CheckCircle size={20} className="text-[#22c55e]" />}
                  label="Contratos Ativos"
                  value={String(kpiContratosAtivos)}
                  badgeBg="#E8FDEB"
                />
                <KpiCard
                  icon={<Package size={20} className="text-[#4f46e5]" />}
                  label="Estoque Atual (un.)"
                  value={String(kpiEstoqueAtualUnidades)}
                  badgeBg="#EEF2FF"
                />
                <KpiCard
                  icon={<ClipboardList size={20} className="text-[#4f46e5]" />}
                  label="OS Abertas"
                  value={String(kpiOrdensServicoAbertas)}
                  badgeBg="#EAF0FF"
                />
                <KpiCard
                  icon={<AlertCircle size={20} className="text-[#ef4444]" />}
                  label="Pendências"
                  value={String(kpiPendencias)}
                  badgeBg="#FFECEE"
                />
              </div>

              {/* Tempo de atualização */}
              <div className="mt-6 flex items-center gap-2 text-[#6b7280] text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3"></path>
                  <path d="M21 12a9 9 0 1 1-9-9"></path>
                  <path d="M21 3v6h-6"></path>
                </svg>
                <span>Atualizado automaticamente a cada 5s</span>
              </div>
            </section>

            {/* Coluna direita: Relatórios */}
            <section className="flex flex-col">
              <h2 className="text-[20px] font-semibold text-[#213B9A]">Relatórios Inteligentes</h2>
              <div className="mt-5 rounded-2xl border border-[#DDE7FF] bg-white h-[360px] shadow-[0_8px_20px_-8px_rgba(26,35,126,0.08)] overflow-hidden">
                <div className="h-[360px] p-3">
                  {/* Combo: Ativos, Prestes a Vencer, Vencidos */}
                  <Line data={contratosComboData} options={contratosComboOptions} />
                </div>
              </div>
            </section>
          </div>

          {/* Linha de gráficos auxiliares */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alertas emitidos (barras) */}
            <div className="rounded-2xl border border-[#DDE7FF] bg-white p-4 h-[300px]">
              <h3 className="text-[16px] font-semibold text-[#1f2937]">Alertas emitidos (12 meses)</h3>
              <div className="h-[240px] mt-3">
                <Bar data={barAlertasData} options={barAlertasOptions} />
              </div>
            </div>

            {/* Estoque por classe ABC (unidades) */}
            <div className="rounded-2xl border border-[#DDE7FF] bg-white p-4 h-[300px]">
              <h3 className="text-[16px] font-semibold text-[#1f2937]">Estoque atual por classe (unidades)</h3>
              <div className="h-[240px] mt-3">
                <Bar data={barEstoqueABCData} options={barEstoqueABCOptions} />
              </div>
            </div>

            {/* Ordens de planejamento (doughnut) */}
            <div className="rounded-2xl border border-[#DDE7FF] bg-white p-4 h-[300px]">
              <h3 className="text-[16px] font-semibold text-[#1f2937]">Ordens de planejamento</h3>
              <div className="h-[240px] mt-3">
                <Doughnut data={doughnutOrdensData} options={doughnutOrdensOptions} />
              </div>
            </div>
          </div>

          {/* Linha secundária */}
          <div className="mt-8">
            <div className="rounded-2xl border border-[#DDE7FF] bg-white p-4 h-[300px]">
              <h3 className="text-[16px] font-semibold text-[#1f2937]">Produtos com baixa em estoque (por categoria)</h3>
              <div className="h-[240px] mt-3">
                <Bar data={barHorizontalBaixaData} options={barHorizontalBaixaOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}