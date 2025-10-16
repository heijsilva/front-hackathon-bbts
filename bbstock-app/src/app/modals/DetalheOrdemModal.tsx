'use client';

import ModalBase from './ModalBase';
import { useRouter } from 'next/navigation';

export type OrdemDetalhe = {
  id: string;
  tipo: 'Compra' | 'Planejamento';
  codigo: string;
  quantidade: number;
  fornecedor?: string;
  origem?: string;
  destino?: string;
  valorUnit?: number;
  subtotal?: number;
  dataCriacao: string;
  status: 'Rascunho' | 'Registrada' | 'Aprovada' | 'Concluída' | 'Cancelada';
};

const money = (v?:number)=> v!=null ? v.toLocaleString('pt-BR',{style:'currency', currency:'BRL'}) : '-';
const fmtDT = (iso:string)=> new Date(iso).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

export default function DetalheOrdemModal({
  open, onClose, data,
}: { open:boolean; onClose:()=>void; data: OrdemDetalhe | null; }) {
  const router = useRouter();
  if (!data) return null;

  const duplicar = () => {
    const qs = new URLSearchParams({
      tipo: data.tipo,
      codigo: data.codigo,
      quantidade: String(data.quantidade),
      fornecedor: data.fornecedor ?? '',
      origem: data.origem ?? '',
      destino: data.destino ?? '',
      valorUnit: data.valorUnit ? String(data.valorUnit) : '',
    }).toString();
    router.push(`/ordens/criar?${qs}`);
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={`Ordem ${data.id}`}
      subtitle={`${data.tipo} • ${fmtDT(data.dataCriacao)}`}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <Chip tone="violet">{data.tipo}</Chip>
        <Chip tone="slate">{data.status}</Chip>
        {data.fornecedor && <Chip tone="sky">Fornecedor: {data.fornecedor}</Chip>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info label="Código" value={data.codigo} />
        <Info label="Quantidade" value={String(data.quantidade)} />
        {data.tipo==='Compra' ? (
          <>
            <Info label="Valor Unitário" value={money(data.valorUnit)} />
            <Info label="Subtotal" value={money(data.subtotal)} />
          </>
        ) : (
          <>
            <Info label="Origem" value={data.origem ?? '-'} />
            <Info label="Destino" value={data.destino ?? '-'} />
          </>
        )}
        <Info label="Data" value={fmtDT(data.dataCriacao)} />
        <Info label="Status" value={data.status} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="bb-btn" onClick={duplicar}>Duplicar Ordem</button>
        <button className="bb-btn-ghost">Editar</button>
        <button className="bb-btn-ghost">Exportar CSV</button>
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