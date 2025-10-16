'use client';

import Header from '@/app/components/Header';
import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronRight, Download, History, ListFilter, RefreshCcw } from 'lucide-react';

// Modais
import DetalheContratoModal, { ContratoDetalhe } from '@/app/modals/DetalheContratoModal';
import DetalheOrdemModal, { OrdemDetalhe } from '@/app/modals/DetalheOrdemModal';
import DetalheAlertaModal, { AlertaDetalhe } from '@/app/modals/DetalheAlertaModal';

/* Utils de estilo */
const filterInputCls =
  'h-12 rounded-xl bg-white px-4 text-[15px] text-[#0F1A2B] ' +
  'border border-[#C7D2FE] placeholder:text-[#6E7BA6] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]/60 focus:border-[#6B7CFF] shadow-sm w-full';
const panelCls =
  'rounded-2xl border border-[#C7D2FE] bg-white/60 shadow-[inset_0_0_0_9999px_rgba(99,102,241,0.06)] p-4 sm:p-6';
const cardInnerCls = 'rounded-2xl border border-[#DDE7FF] bg-white';
const tableHeadCls = 'bg-[#F8FAFF] text-[#475569] font-semibold';
const zebraOdd = 'bg-[#FBFCFF]';
const zebraEven = 'bg-white';

/* Tipos */
type Range = { from?: string; to?: string };
type Contrato = {
  id: string; numero: string; fornecedor: string; inicio: string; fim: string;
  valorTotal: number; status: 'Vigente' | 'Encerrado' | 'Suspenso';
};
type Ordem = {
  id: string; tipo: 'Compra' | 'Planejamento'; codigo: string; quantidade: number;
  valorUnit?: number; subtotal?: number; origem?: string; destino?: string; fornecedor?: string;
  dataCriacao: string; status: 'Rascunho' | 'Registrada' | 'Aprovada' | 'Concluída' | 'Cancelada';
};
type Criticidade = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
type AlertaHist = { id: string; codigo: string; severidade: number; criticidade: Criticidade; cd: string; dataEmissao: string; };

/* Helpers */
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const criticFromSev = (sev: number): Criticidade => (sev>=85?'Crítico':sev>=70?'Alto':sev>=40?'Médio':'Baixo');

/* Mocks (troque por fetch do seu backend) */
const CDs = ['CD São Paulo','CD Rio de Janeiro','CD Curitiba','CD Recife','CD Salvador','CD Brasília'];
function mockContratos(n=12): Contrato[] {
  const fornecedores = ['PrimeParts','BetaLog','SupplyMax','NordicRep','ACME Parts'];
  return Array.from({length:n}).map((_,i)=>{
    const inicio=new Date(2024, Math.floor(Math.random()*12), 1+Math.floor(Math.random()*27));
    const fim=new Date(inicio); fim.setMonth(inicio.getMonth()+ (6+Math.floor(Math.random()*12)));
    const sts: Contrato['status'][]=['Vigente','Encerrado','Suspenso'];
    return { id:`CT-${i}`, numero:`CT-${1000+i}`, fornecedor:fornecedores[i%fornecedores.length],
      inicio:inicio.toISOString(), fim:fim.toISOString(), valorTotal: 120000+Math.floor(Math.random()*520000),
      status: sts[Math.floor(Math.random()*sts.length)] };
  }).sort((a,b)=>b.inicio.localeCompare(a.inicio));
}
function mockOrdens(n=18): Ordem[] {
  const codigos=['ROXR-033849','AOLR-068182','WOSR-096625','AARO-020619','QOER-084064','VEIF-010806','HCKB-398523','YOLR-082236'];
  const fornecedores=['PrimeParts','BetaLog','SupplyMax','ACME Parts'];
  const sts:Ordem['status'][]=['Rascunho','Registrada','Aprovada','Concluída','Cancelada'];
  return Array.from({length:n}).map((_,i)=>{
    const tipo:Ordem['tipo']=Math.random()<0.55?'Compra':'Planejamento';
    const dt=new Date(Date.now()-Math.floor(Math.random()*1000*60*60*24*30));
    const o:Ordem={ id:`OR-${i}`, tipo, codigo:codigos[i%codigos.length], quantidade:1+Math.floor(Math.random()*150),
      dataCriacao:dt.toISOString(), status: sts[i%sts.length] };
    if(tipo==='Compra'){ o.fornecedor=fornecedores[i%fornecedores.length]; o.valorUnit=70+Math.floor(Math.random()*800); o.subtotal=o.valorUnit*o.quantidade; }
    else { o.origem=CDs[i%CDs.length]; o.destino=CDs[(i+2)%CDs.length]; }
    return o;
  }).sort((a,b)=>b.dataCriacao.localeCompare(a.dataCriacao));
}
function mockAlertas(n=20): AlertaHist[] {
  const codigos=['ROXR-033849','AOLR-068182','WOSR-096625','AARO-020619','QOER-084064','VEIF-010806','HCKB-398523','YOLR-082236'];
  return Array.from({length:n}).map((_,i)=>{
    const sev=Math.floor(Math.random()*101);
    const dt=new Date(Date.now()-Math.floor(Math.random()*1000*60*60*24*15));
    return { id:`AL-${i}`, codigo:codigos[i%codigos.length], severidade:sev, criticidade:criticFromSev(sev), cd:CDs[(i+1)%CDs.length], dataEmissao:dt.toISOString() };
  }).sort((a,b)=>b.dataEmissao.localeCompare(a.dataEmissao));
}

/* CSV */
function toCSV(headers: string[], rows: (string|number)[][]) {
  const sep=';'; const esc=(v:any)=>{ const s=String(v??''); return /[;"\n,]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; };
  return new Blob([[headers.join(sep), ...rows.map(r=>r.map(esc).join(sep))].join('\n')], { type:'text/csv;charset=utf-8;' });
}
function downloadBlob(blob: Blob, filename: string) { const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }

/* Página */
type Tab='contratos'|'ordens'|'alertas';

export default function HistoricosPage() {
  const [tab,setTab]=useState<Tab>('contratos');
  const [q,setQ]=useState(''); const [range,setRange]=useState<Range>({});
  const [status,setStatus]=useState<string>('Todos');
  const [tipoOrdem,setTipoOrdem]=useState<'Todos'|'Compra'|'Planejamento'>('Todos');

  const [contratos,setContratos]=useState<Contrato[]>([]);
  const [ordens,setOrdens]=useState<Ordem[]>([]);
  const [alertas,setAlertas]=useState<AlertaHist[]>([]);

  // Estados dos modais
  const [contratoOpen, setContratoOpen] = useState(false);
  const [ordemOpen, setOrdemOpen] = useState(false);
  const [alertaOpen, setAlertaOpen] = useState(false);

  const [contratoSel, setContratoSel] = useState<ContratoDetalhe | null>(null);
  const [ordemSel, setOrdemSel] = useState<OrdemDetalhe | null>(null);
  const [alertaSel, setAlertaSel] = useState<AlertaDetalhe | null>(null);

  useEffect(()=>{ setContratos(mockContratos()); setOrdens(mockOrdens()); setAlertas(mockAlertas()); },[]);

  const within=(iso:string)=>{ const t=new Date(iso).getTime(); const f=range.from?new Date(range.from).getTime():null; const to=range.to?new Date(range.to).getTime():null; return (f? t>=f:true) && (to? t<=to:true); };

  const contratosF=useMemo(()=>contratos.filter(c=>{
    const text=`${c.numero} ${c.fornecedor}`.toLowerCase();
    const mQ=q? text.includes(q.toLowerCase()):true;
    const mS=status==='Todos'? true : c.status===status;
    const mR=within(c.inicio)||within(c.fim);
    return mQ && mS && mR;
  }),[contratos,q,status,range]);

  const ordensF=useMemo(()=>ordens.filter(o=>{
    const text=`${o.id} ${o.tipo} ${o.codigo} ${o.fornecedor??''} ${o.origem??''} ${o.destino??''}`.toLowerCase();
    const mQ=q? text.includes(q.toLowerCase()):true;
    const mS=status==='Todos'? true : o.status===status;
    const mT=tipoOrdem==='Todos'? true : o.tipo===tipoOrdem;
    const mR=within(o.dataCriacao);
    return mQ && mS && mT && mR;
  }),[ordens,q,status,tipoOrdem,range]);

  const alertasF=useMemo(()=>alertas.filter(a=>{
    const text=`${a.codigo} ${a.cd}`.toLowerCase();
    const mQ=q? text.includes(q.toLowerCase()):true;
    const mS=status==='Todos'? true : a.criticidade===status; // aqui status = criticidade
    const mR=within(a.dataEmissao);
    return mQ && mS && mR;
  }),[alertas,q,status,range]);

  // Ações dos modais
  function abrirContrato(c: Contrato) {
    setContratoSel({
      numero: c.numero,
      fornecedor: c.fornecedor,
      inicio: c.inicio,
      fim: c.fim,
      valorTotal: c.valorTotal,
      status: c.status,
    });
    setContratoOpen(true);
  }
  function abrirOrdem(o: Ordem) {
    setOrdemSel({
      id: o.id,
      tipo: o.tipo,
      codigo: o.codigo,
      quantidade: o.quantidade,
      fornecedor: o.fornecedor,
      origem: o.origem,
      destino: o.destino,
      valorUnit: o.valorUnit,
      subtotal: o.subtotal,
      dataCriacao: o.dataCriacao,
      status: o.status,
    });
    setOrdemOpen(true);
  }
  function abrirAlerta(a: AlertaHist) {
    setAlertaSel({
      codigo: a.codigo,
      severidade: a.severidade,
      criticidade: a.criticidade,
      cd: a.cd,
      dataEmissao: a.dataEmissao,
    });
    setAlertaOpen(true);
  }

  function exportCSV(){
    if(tab==='contratos'){
      downloadBlob(toCSV(['Número','Fornecedor','Início','Fim','Valor Total','Status'],
        contratosF.map(c=>[c.numero,c.fornecedor,fmtDate(c.inicio),fmtDate(c.fim),money(c.valorTotal),c.status])
      ), 'historico_contratos.csv');
    } else if(tab==='ordens'){
      downloadBlob(toCSV(['ID','Tipo','Código','Qtd','Fornecedor','Origem','Destino','Valor Unit.','Subtotal','Data','Status'],
        ordensF.map(o=>[o.id,o.tipo,o.codigo,o.quantidade,o.fornecedor??'',o.origem??'',o.destino??'', o.valorUnit?money(o.valorUnit):'', o.subtotal?money(o.subtotal):'', fmtDateTime(o.dataCriacao), o.status])
      ), 'historico_ordens.csv');
    } else {
      downloadBlob(toCSV(['Código','Severidade','Criticidade','CD','Emitido em'],
        alertasF.map(a=>[a.codigo,`${a.severidade}%`,a.criticidade,a.cd,fmtDateTime(a.dataEmissao)])
      ), 'historico_alertas.csv');
    }
  }
  function reload(){ setContratos(mockContratos()); setOrdens(mockOrdens()); setAlertas(mockAlertas()); }

  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      <Header showTabs activeTab="historicos" />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <section className={panelCls}>
          <div className={cardInnerCls}>
            {/* Título e ações */}
            <div className="px-5 py-4 border-b border-[#EEF2FF] flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#1E2A78] flex items-center gap-2">
                <History size={20} className="text-[#0F2C93]" /> Históricos
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#9BB3FF] px-3 py-2
                             text-[#0F2C93] hover:bg-[#EEF3FF] bg-white shadow-sm"
                >
                  <Download size={16} /> Exportar CSV
                </button>
                <button
                  onClick={reload}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#9BB3FF] px-3 py-2
                             text-[#0F2C93] hover:bg-[#EEF3FF] bg-white shadow-sm"
                >
                  <RefreshCcw size={16} /> Atualizar
                </button>
              </div>
            </div>

            {/* Abas */}
            <div className="px-5 pt-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#E6ECFF] p-1 bg-[#F7FAFF]">
                {(['contratos','ordens','alertas'] as Tab[]).map(k=>{
                  const active = tab===k;
                  return (
                    <button
                      key={k}
                      onClick={()=>setTab(k)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                        active ? 'bg-white text-[#0F2C93] border border-[#9BB3FF] shadow-sm'
                               : 'text-[#3B4A7A] hover:text-[#0F2C93]'
                      }`}
                    >
                      {k==='contratos'?'Contratos':k==='ordens'?'Ordens':'Alertas'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtros */}
            <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
              <input
                className={`${filterInputCls} lg:col-span-2`}
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                placeholder={tab==='contratos'
                  ? 'Buscar por número ou fornecedor...'
                  : tab==='ordens'
                  ? 'Buscar por ID, código, fornecedor, origem/destino...'
                  : 'Buscar por código ou CD...'}
              />
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#0F2C93]" />
                <input type="date" value={range.from??''} onChange={(e)=>setRange(r=>({...r,from:e.target.value}))} className={filterInputCls}/>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#0F2C93]" />
                <input type="date" value={range.to??''} onChange={(e)=>setRange(r=>({...r,to:e.target.value}))} className={filterInputCls}/>
              </div>
              <div className="flex items-center gap-2">
                <ListFilter size={16} className="text-[#0F2C93]" />
                {tab==='contratos' && (
                  <select value={status} onChange={(e)=>setStatus(e.target.value)} className={filterInputCls}>
                    <option value="Todos">Todos os status</option>
                    <option value="Vigente">Vigente</option>
                    <option value="Encerrado">Encerrado</option>
                    <option value="Suspenso">Suspenso</option>
                  </select>
                )}
                {tab==='ordens' && (
                  <div className="flex w-full gap-2">
                    <select value={tipoOrdem} onChange={(e)=>setTipoOrdem(e.target.value as any)} className={filterInputCls}>
                      <option value="Todos">Todos os tipos</option>
                      <option value="Compra">Compra</option>
                      <option value="Planejamento">Planejamento</option>
                    </select>
                    <select value={status} onChange={(e)=>setStatus(e.target.value)} className={filterInputCls}>
                      <option value="Todos">Todos os status</option>
                      <option value="Rascunho">Rascunho</option>
                      <option value="Registrada">Registrada</option>
                      <option value="Aprovada">Aprovada</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                )}
                {tab==='alertas' && (
                  <select value={status} onChange={(e)=>setStatus(e.target.value)} className={filterInputCls}>
                    <option value="Todos">Todas as criticidades</option>
                    <option value="Crítico">Crítico</option>
                    <option value="Alto">Alto</option>
                    <option value="Médio">Médio</option>
                    <option value="Baixo">Baixo</option>
                  </select>
                )}
              </div>
            </div>

            {/* Tabela */}
            <div className="px-5 pb-5">
              {tab==='contratos' && <TabelaContratos rows={contratosF} onVer={abrirContrato} />}
              {tab==='ordens' && <TabelaOrdens rows={ordensF} onVer={abrirOrdem} />}
              {tab==='alertas' && <TabelaAlertas rows={alertasF} onVer={abrirAlerta} />}
            </div>
          </div>
        </section>
      </main>

      {/* Modais */}
      <DetalheContratoModal
        open={contratoOpen}
        onClose={() => setContratoOpen(false)}
        data={contratoSel}
      />
      <DetalheOrdemModal
        open={ordemOpen}
        onClose={() => setOrdemOpen(false)}
        data={ordemSel}
      />
      <DetalheAlertaModal
        open={alertaOpen}
        onClose={() => setAlertaOpen(false)}
        data={alertaSel}
      />
    </div>
  );
}

/* Badges com a paleta do site */
function Badge({ children, color }:{ children:React.ReactNode; color:'emerald'|'sky'|'amber'|'orange'|'red'|'slate'|'violet' }) {
  const map: Record<string,string> = {
    emerald:'bg-emerald-50 text-emerald-700 border-emerald-200',
    sky:'bg-sky-50 text-sky-700 border-sky-200',
    amber:'bg-amber-50 text-amber-700 border-amber-200',
    orange:'bg-orange-50 text-orange-700 border-orange-200',
    red:'bg-red-50 text-red-700 border-red-200',
    slate:'bg-slate-50 text-slate-700 border-slate-200',
    violet:'bg-violet-50 text-violet-700 border-violet-200',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${map[color]}`}>{children}</span>;
}

/* Tabelas */
function TabelaContratos({ rows, onVer }:{ rows:Contrato[]; onVer:(c:Contrato)=>void }) {
  return (
    <div className="overflow-auto rounded-xl border border-[#E6ECFF]">
      <table className="min-w-[960px] w-full text-sm">
        <thead className={tableHeadCls}>
          <tr>
            <th className="text-left px-3 py-2 w-[140px]">Número</th>
            <th className="text-left px-3 py-2">Fornecedor</th>
            <th className="text-left px-3 py-2 w-[120px]">Início</th>
            <th className="text-left px-3 py-2 w-[120px]">Fim</th>
            <th className="text-right px-3 py-2 w-[140px]">Valor Total</th>
            <th className="text-left px-3 py-2 w-[140px]">Status</th>
            <th className="px-3 py-2 w-[80px]"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c,i)=>(
            <tr key={c.id} className={i%2?zebraEven:zebraOdd}>
              <td className="px-3 py-2 text-[#0F1A2B]">{c.numero}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{c.fornecedor}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{fmtDate(c.inicio)}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{fmtDate(c.fim)}</td>
              <td className="px-3 py-2 text-right text-[#0F1A2B]">{money(c.valorTotal)}</td>
              <td className="px-3 py-2">
                {c.status==='Vigente' && <Badge color="emerald">Vigente</Badge>}
                {c.status==='Encerrado' && <Badge color="slate">Encerrado</Badge>}
                {c.status==='Suspenso' && <Badge color="amber">Suspenso</Badge>}
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  className="inline-flex items-center gap-1 rounded-lg border border-[#DDE7FF] px-3 py-2 text-[#0F2C93] hover:bg-[#F7FAFF]"
                  onClick={()=>onVer(c)}
                >
                  Ver <ChevronRight size={16}/>
                </button>
              </td>
            </tr>
          ))}
          {rows.length===0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">Nenhum contrato encontrado.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
function TabelaOrdens({ rows, onVer }:{ rows:Ordem[]; onVer:(o:Ordem)=>void }) {
  return (
    <div className="overflow-auto rounded-xl border border-[#E6ECFF]">
      <table className="min-w-[1100px] w-full text-sm">
        <thead className={tableHeadCls}>
          <tr>
            <th className="text-left px-3 py-2 w-[120px]">ID</th>
            <th className="text-left px-3 py-2 w-[110px]">Tipo</th>
            <th className="text-left px-3 py-2 w-[160px]">Código</th>
            <th className="text-right px-3 py-2 w-[110px]">Qtd</th>
            <th className="text-left px-3 py-2 w-[200px]">Fornecedor</th>
            <th className="text-left px-3 py-2 w-[220px]">Origem ➜ Destino</th>
            <th className="text-right px-3 py-2 w-[120px]">Valor Unit.</th>
            <th className="text-right px-3 py-2 w-[130px]">Subtotal</th>
            <th className="text-left px-3 py-2 w-[160px]">Data</th>
            <th className="text-left px-3 py-2 w-[140px]">Status</th>
            <th className="px-3 py-2 w-[80px]"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o,i)=>(
            <tr key={o.id} className={i%2?zebraEven:zebraOdd}>
              <td className="px-3 py-2 text-[#0F1A2B]">{o.id}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{o.tipo}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{o.codigo}</td>
              <td className="px-3 py-2 text-right text-[#0F1A2B]">{o.quantidade}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{o.tipo==='Compra'?(o.fornecedor??'-'):'-'}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{o.tipo==='Planejamento'?`${o.origem??'-'} ➜ ${o.destino??'-'}`:'-'}</td>
              <td className="px-3 py-2 text-right text-[#0F1A2B]">{o.valorUnit?money(o.valorUnit):'-'}</td>
              <td className="px-3 py-2 text-right text-[#0F1A2B]">{o.subtotal?money(o.subtotal):'-'}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{fmtDateTime(o.dataCriacao)}</td>
              <td className="px-3 py-2">
                {o.status==='Rascunho' && <Badge color="slate">Rascunho</Badge>}
                {o.status==='Registrada' && <Badge color="sky">Registrada</Badge>}
                {o.status==='Aprovada' && <Badge color="emerald">Aprovada</Badge>}
                {o.status==='Concluída' && <Badge color="violet">Concluída</Badge>}
                {o.status==='Cancelada' && <Badge color="red">Cancelada</Badge>}
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  className="inline-flex items-center gap-1 rounded-lg border border-[#DDE7FF] px-3 py-2 text-[#0F2C93] hover:bg-[#F7FAFF]"
                  onClick={()=>onVer(o)}
                >
                  Ver <ChevronRight size={16}/>
                </button>
              </td>
            </tr>
          ))}
          {rows.length===0 && <tr><td colSpan={11} className="px-3 py-8 text-center text-slate-500">Nenhuma ordem encontrada.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
function TabelaAlertas({ rows, onVer }:{ rows:AlertaHist[]; onVer:(a:AlertaHist)=>void }) {
  return (
    <div className="overflow-auto rounded-xl border border-[#E6ECFF]">
      <table className="min-w-[980px] w-full text-sm">
        <thead className={tableHeadCls}>
          <tr>
            <th className="text-left px-3 py-2 w-[160px]">Código</th>
            <th className="text-right px-3 py-2 w-[120px]">Severidade</th>
            <th className="text-left px-3 py-2 w-[120px]">Criticidade</th>
            <th className="text-left px-3 py-2 w-[220px]">CD</th>
            <th className="text-left px-3 py-2 w-[180px]">Emitido em</th>
            <th className="px-3 py-2 w-[80px]"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a,i)=>(
            <tr key={a.id} className={i%2?zebraEven:zebraOdd}>
              <td className="px-3 py-2 text-[#0F1A2B]">{a.codigo}</td>
              <td className="px-3 py-2 text-right text-[#0F1A2B]">{a.severidade}%</td>
              <td className="px-3 py-2">
                {a.criticidade==='Baixo' && <Badge color="emerald">Baixo</Badge>}
                {a.criticidade==='Médio' && <Badge color="amber">Médio</Badge>}
                {a.criticidade==='Alto' && <Badge color="orange">Alto</Badge>}
                {a.criticidade==='Crítico' && <Badge color="red">Crítico</Badge>}
              </td>
              <td className="px-3 py-2 text-[#0F1A2B]">{a.cd}</td>
              <td className="px-3 py-2 text-[#0F1A2B]">{fmtDateTime(a.dataEmissao)}</td>
              <td className="px-3 py-2 text-right">
                <button
                  className="inline-flex items-center gap-1 rounded-lg border border-[#DDE7FF] px-3 py-2 text-[#0F2C93] hover:bg-[#F7FAFF]"
                  onClick={()=>onVer(a)}
                >
                  Ver <ChevronRight size={16}/>
                </button>
              </td>
            </tr>
          ))}
          {rows.length===0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Nenhum alerta encontrado.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}