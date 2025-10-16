'use client';

import ModalBase from './ModalBase';
import { useRouter } from 'next/navigation';

export type ContratoDetalhe = {
  numero: string;
  fornecedor: string;
  inicio: string;
  fim: string;
  valorTotal: number;
  status: 'Vigente' | 'Encerrado' | 'Suspenso';
};

const money = (v:number)=> v.toLocaleString('pt-BR',{style:'currency', currency:'BRL'});
const fmt = (iso:string)=> new Date(iso).toLocaleDateString('pt-BR');

export default function DetalheContratoModal({
  open, onClose, data,
}: { open: boolean; onClose: () => void; data: ContratoDetalhe | null; }) {
  const router = useRouter();
  if (!data) return null;

  const criarOrdem = () => {
    const qs = new URLSearchParams({
      tipo: 'Compra',
      fornecedor: data.fornecedor,
      contrato: data.numero,
    }).toString();
    router.push(`/ordens/criar?${qs}`);
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={`Contrato ${data.numero}`}
      subtitle={`${data.fornecedor} • ${fmt(data.inicio)} → ${fmt(data.fim)}`}
    >
      {/* highlights */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Chip tone="slate">{data.status}</Chip>
        <Chip tone="sky">Valor: {money(data.valorTotal)}</Chip>
        <Chip tone="violet">Fornecedor: {data.fornecedor}</Chip>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info label="Início" value={fmt(data.inicio)} />
        <Info label="Fim" value={fmt(data.fim)} />
        <Info label="Status" value={data.status} />
        <Info label="Valor Total" value={money(data.valorTotal)} />
      </div>

      {/* Ações rápidas */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="bb-btn inline-flex items-center gap-2" onClick={criarOrdem}>
          Criar Ordem de Compra
        </button>
        <button className="bb-btn-ghost inline-flex items-center gap-2">Baixar PDF</button>
        <button className="bb-btn-ghost inline-flex items-center gap-2">Exportar CSV</button>
      </div>
    </ModalBase>
  );
}

function Info({label, value}:{label:string; value:string}) {
  return (
    <div className="p-3 rounded-xl border border-[#E6ECFF] bg-white">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Chip({children, tone}:{children:React.ReactNode; tone:'emerald'|'sky'|'amber'|'orange'|'red'|'slate'|'violet'}) {
  const map: Record<string,string> = {
    emerald:'bg-emerald-50 text-emerald-700 border-emerald-200',
    sky:'bg-sky-50 text-sky-700 border-sky-200',
    amber:'bg-amber-50 text-amber-700 border-amber-200',
    orange:'bg-orange-50 text-orange-700 border-orange-200',
    red:'bg-red-50 text-red-700 border-red-200',
    slate:'bg-slate-50 text-slate-700 border-slate-200',
    violet:'bg-violet-50 text-violet-700 border-violet-200',
  };
  return <span className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-semibold ${map[tone]}`}>{children}</span>;
}