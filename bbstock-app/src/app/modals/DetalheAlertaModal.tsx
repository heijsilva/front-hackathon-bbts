// src/app/modals/DetalheAlertaModal.tsx
'use client';
import ModalBase from './ModalBase';
import { useRouter } from 'next/navigation';

export type AlertaDetalhe = {
  codigo: string;
  severidade: number;
  criticidade: 'Baixo'|'Médio'|'Alto'|'Crítico';
  cd: string;
  dataEmissao: string;
};

const fmtDT = (iso:string)=> new Date(iso).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

export default function DetalheAlertaModal({
  open, onClose, data,
}: { open:boolean; onClose:()=>void; data: AlertaDetalhe | null; }) {
  const router = useRouter();
  if (!data) return null;

  const criarOrdem = () => {
    const qs = new URLSearchParams({
      tipo: 'Compra',
      codigo: data.codigo,
      origem: data.cd,
    }).toString();
    // Importante: redireciona para a página existente
    router.push(`/ordens/criar?${qs}`);
  };

  const footer = (
  <div className="flex gap-2">
    <button
      onClick={criarOrdem}
      className="inline-flex items-center justify-center px-4 py-2 rounded-lg
                 text-white font-semibold
                 bg-[#0F2C93] hover:bg-[#0d2390] active:bg-[#0b1f7c]
                 shadow-sm border border-[#0E2AA8]/10 focus:outline-none focus:ring-2 focus:ring-[#91A9FF]"
    >
      Criar Ordem de Compra
    </button>

    <button
      onClick={() => {
        const headers = ['Código','Severidade','Criticidade','CD','Emitido em'];
        const row = [data.codigo, `${data.severidade}%`, data.criticidade, data.cd, fmtDT(data.dataEmissao)];
        const sep=';';
        const csv=[headers.join(sep), row.join(sep)].join('\n');
        const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
        const url=URL.createObjectURL(blob); const a=document.createElement('a');
        a.href=url; a.download=`alerta_${data.codigo}.csv`; a.click(); URL.revokeObjectURL(url);
      }}
      className="inline-flex items-center justify-center px-4 py-2 rounded-lg
                 text-[#0F2C93] font-semibold
                 bg-white hover:bg-[#EEF3FF]
                 border border-[#9BB3FF] shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-[#91A9FF]"
    >
      Baixar CSV
    </button>
  </div>
);

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={`Alerta ${data.codigo}`}
      subtitle={`${data.criticidade} • ${fmtDT(data.dataEmissao)}`}
      footer={footer}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <Chip tone={data.criticidade==='Crítico'?'red':data.criticidade==='Alto'?'orange':data.criticidade==='Médio'?'amber':'emerald'}>
          Criticidade: {data.criticidade}
        </Chip>
        <Chip tone="violet">Severidade: {data.severidade}%</Chip>
        <Chip tone="sky">CD: {data.cd}</Chip>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info label="Código" value={data.codigo} />
        <Info label="Severidade" value={`${data.severidade}%`} />
        <Info label="Criticidade" value={data.criticidade} />
        <Info label="Centro de Distribuição" value={data.cd} />
        <Info label="Emitido em" value={fmtDT(data.dataEmissao)} />
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