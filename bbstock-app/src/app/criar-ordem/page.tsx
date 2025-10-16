'use client';

import Header from '@/app/components/Header';
import UploadCSV from '@/app/components/UploadCSV';
import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

type ItemIndex = {
  codigo: string;
  classe: 'A' | 'B' | 'C' | string;
  valor?: number;
  descricao?: string;
};

const mockDatasetIndex: ItemIndex[] = [
  { codigo: 'ROXR-033849', classe: 'C', valor: 120, descricao: 'Peça ROXR-033849' },
  { codigo: 'AOLR-068182', classe: 'C', valor: 145, descricao: 'Peça AOLR-068182' },
  { codigo: 'WOSR-096625', classe: 'C', valor: 210, descricao: 'Peça WOSR-096625' },
  { codigo: 'AARO-020619', classe: 'C', valor: 95, descricao: 'Peça AARO-020619' },
  { codigo: 'QOER-084064', classe: 'C', valor: 132, descricao: 'Peça QOER-084064' },
  { codigo: 'VEIF-010806', classe: 'C', valor: 160, descricao: 'Peça VEIF-010806' },
];

type TipoOrdem = 'compra' | 'planejamento';

type LinhaCompra = {
  tipo: 'compra';
  codigo: string;
  classe?: string;
  descricao?: string;
  quantidade: number;
  fornecedor?: string;
  local?: string; // depósito
  prazoLogisticoDias?: number;
  valorUnit?: number;
};

type LinhaPlanej = {
  tipo: 'planejamento';
  codigo: string;
  classe?: string;
  quantidade: number;
  origem?: string; // centro de origem
  destino?: string; // centro de destino
  prazoLogisticoDias?: number;
  agendarRecebimento: boolean;
  dataReceb?: string; // yyyy-mm-dd
  horaReceb?: string; // HH:mm
  priorizarRotaMaisRapida: boolean;
};

type Linha = LinhaCompra | LinhaPlanej;

const centrosMock = [
  'CD São Paulo',
  'CD Rio de Janeiro',
  'CD Recife',
  'CD Brasília',
  'CD Curitiba',
  'CD Porto Alegre',
  'CD Salvador',
];

export default function CriarOrdemPage() {
  const [tipo, setTipo] = useState<TipoOrdem>('compra');
  const [dataOrdem, setDataOrdem] = useState<string>('');
  const [dataNecessidade, setDataNecessidade] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [linhas, setLinhas] = useState<Linha[]>([
    {
      tipo: 'compra',
      codigo: '',
      quantidade: 1,
      fornecedor: '',
      local: '',
      prazoLogisticoDias: 7,
    } as LinhaCompra,
  ]);

  const indexByCodigo = useMemo(() => {
    const m = new Map<string, ItemIndex>();
    for (const it of mockDatasetIndex) m.set(it.codigo, it);
    return m;
  }, []);

  // total somente para compra (valor unit * qtd). Em planejamento não há valor.
  const total = useMemo(
    () =>
      linhas.reduce((acc, l) => {
        if (l.tipo === 'compra') {
          return acc + (l.valorUnit ? l.valorUnit : 0) * (Number(l.quantidade) || 0);
        }
        return acc;
      }, 0),
    [linhas]
  );

  function toCompraBase(): LinhaCompra {
    return {
      tipo: 'compra',
      codigo: '',
      quantidade: 1,
      fornecedor: '',
      local: '',
      prazoLogisticoDias: 7,
      valorUnit: undefined,
    };
  }
  function toPlanejBase(): LinhaPlanej {
    return {
      tipo: 'planejamento',
      codigo: '',
      quantidade: 1,
      origem: '',
      destino: '',
      prazoLogisticoDias: 5,
      agendarRecebimento: false,
      dataReceb: '',
      horaReceb: '',
      priorizarRotaMaisRapida: false,
    };
  }

  function addLinha() {
    setLinhas((prev) => [...prev, tipo === 'compra' ? toCompraBase() : toPlanejBase()]);
  }

  function removeLinha(idx: number) {
    setLinhas((prev) => prev.filter((_, i) => i !== idx));
  }

  function atualizarLinha(idx: number, patch: Partial<Linha>) {
    setLinhas((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch } as Linha;
      return copy;
    });
  }

  function handleCodigoChange(idx: number, codigo: string) {
    const base = indexByCodigo.get(codigo);
    const current = linhas[idx];
    if (current.tipo === 'compra') {
      atualizarLinha(idx, {
        codigo,
        classe: base?.classe,
        // @ts-ignore
        descricao: base?.descricao,
        // @ts-ignore
        valorUnit: base?.valor,
      });
    } else {
      atualizarLinha(idx, {
        codigo,
        classe: base?.classe,
      });
    }
  }

  // Troca o layout e converte linhas existentes preservando campos possíveis
  function trocarTipo(novo: TipoOrdem) {
    setTipo(novo);
    setLinhas((prev) =>
      prev.map((l) => {
        const base = indexByCodigo.get(l.codigo || '');
        if (novo === 'compra') {
          const converted: LinhaCompra = {
            tipo: 'compra',
            codigo: l.codigo || '',
            classe: l.classe ?? base?.classe,
            descricao: 'descricao' in l ? (l as any).descricao : base?.descricao,
            quantidade: l.quantidade || 1,
            fornecedor: '',
            local: l.tipo === 'compra' ? l.local : '',
            prazoLogisticoDias: l.prazoLogisticoDias ?? 7,
            valorUnit: 'valorUnit' in l ? (l as any).valorUnit ?? base?.valor : base?.valor,
          };
          return converted;
        } else {
          const converted: LinhaPlanej = {
            tipo: 'planejamento',
            codigo: l.codigo || '',
            classe: l.classe ?? base?.classe,
            quantidade: l.quantidade || 1,
            origem: '',
            destino: '',
            prazoLogisticoDias: l.prazoLogisticoDias ?? 5,
            agendarRecebimento: false,
            dataReceb: '',
            horaReceb: '',
            priorizarRotaMaisRapida: false,
          };
          return converted;
        }
      })
    );
  }

  function importarCsv(rows: Record<string, string>[]) {
    // compra + planejamento com nomes flexíveis
    const mapped: Linha[] = rows
      .map((r) => {
        const codigo =
          r.codigo ||
          r.Codigo ||
          r.codigo_produto ||
          r['codigo_produto'] ||
          r['codigo'] ||
          r['codigo do item'] ||
          '';
        if (!codigo) return null;

        const classe = r.classe || r.abc || r.ABC || '';
        const quantidade = Number(r.quantidade || r.qtd || r.QTD || r.qtde || 1);

        if (tipo === 'compra') {
          const fornecedor = r.fornecedor || r.Fornecedor || '';
          const local = r.local || r.Local || '';
          const prazo = Number(r.prazoLogisticoDias || r.prazo || r.leadtime || 7);
          const valorUnit = Number(r.valorUnit || r.valor_unit || r.preco || r.precoUnit || r['valor']);
          const base = indexByCodigo.get(codigo);
          const descricao = base?.descricao;
          return {
            tipo: 'compra',
            codigo,
            classe: classe || base?.classe,
            quantidade: Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
            fornecedor,
            local,
            prazoLogisticoDias: Number.isFinite(prazo) ? prazo : 7,
            valorUnit: Number.isFinite(valorUnit) && valorUnit > 0 ? valorUnit : base?.valor,
            descricao,
          } as LinhaCompra;
        } else {
          const origem = r.origem || r.centro_origem || r['origem'] || '';
          const destino = r.destino || r.centro_destino || r['destino'] || '';
          const prazo = Number(r.prazoLogisticoDias || r.prazo || r.leadtime || 5);
          const agendarRecebimento =
            String(r.agendarRecebimento || r.agendar || '').toLowerCase() === 'true';
          const priorizarRota =
            String(r.priorizarRota || r.priorizarRotaMaisRapida || r.priorizar || '').toLowerCase() ===
            'true';
          const dataReceb = r.dataReceb || r.data_receb || '';
          const horaReceb = r.horaReceb || r.hora_receb || '';
          return {
            tipo: 'planejamento',
            codigo,
            classe,
            quantidade: Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
            origem,
            destino,
            prazoLogisticoDias: Number.isFinite(prazo) ? prazo : 5,
            agendarRecebimento,
            dataReceb,
            horaReceb,
            priorizarRotaMaisRapida: priorizarRota,
          } as LinhaPlanej;
        }
      })
      .filter(Boolean) as Linha[];

    if (!mapped.length) {
      alert('CSV importado, mas não encontramos a coluna de código.');
      return;
    }
    setLinhas(mapped);
  }

  async function salvarRascunho() {
    console.log('Rascunho salvo', { tipo, dataOrdem, dataNecessidade, linhas, observacoes, total });
    alert('Rascunho salvo!');
  }

  async function registrarOrdem() {
    console.log('Registrar', { tipo, dataOrdem, dataNecessidade, linhas, observacoes, total });
    await new Promise((r) => setTimeout(r, 600));
    alert(`Ordem de ${tipo === 'compra' ? 'Compra' : 'Planejamento'} registrada com sucesso!`);
  }

  const label = 'block text-sm text-[#1E2A78] mt-4 mb-1';
  const input =
    'w-full h-11 rounded-xl bg-white px-4 text-[15px] focus:outline-none focus:ring-2 border border-[#C7D2FE] focus:ring-[#AFC6FF]/60 focus:border-[#6B7CFF] placeholder:text-[#9AA6D1] text-[#0F172A]';

  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      <Header showTabs activeTab="criarordem" />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <section className="rounded-2xl border border-[#C7D2FE] bg-white/60 shadow-[inset_0_0_0_9999px_rgba(99,102,241,0.06)] p-4 sm:p-6">
          <div className="rounded-2xl border border-[#DDE7FF] bg-white">
            <div className="px-5 py-4 border-b border-[#EEF2FF] flex items-center justify-between">
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1E2A78]">Criar Ordem</h2>
              <Link href="/movimentacoes" className="text-emerald-700 hover:underline">
                Ver Registro de Movimentação
              </Link>
            </div>

            <div className="px-5 py-4">
              {/* Toggle tipo */}
              <div className="flex gap-2">
                <button
                  onClick={() => trocarTipo('compra')}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    tipo === 'compra'
                      ? 'bg-[#0F2C93] text-white border-[#0F2C93]'
                      : 'bg-white text-[#0F2C93] border-[#DDE7FF]'
                  }`}
                >
                  Ordem de Compra
                </button>
                <button
                  onClick={() => trocarTipo('planejamento')}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    tipo === 'planejamento'
                      ? 'bg-[#0F2C93] text-white border-[#0F2C93]'
                      : 'bg-white text-[#0F2C93] border-[#DDE7FF]'
                  }`}
                >
                  Ordem de Planejamento
                </button>

                <div className="ml-auto">
                  <UploadCSV label="Importar CSV" onRows={importarCsv} />
                </div>
              </div>

              {/* Info gerais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={label}>Data da Ordem</label>
                  <input type="date" value={dataOrdem} onChange={(e) => setDataOrdem(e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>Data de Necessidade</label>
                  <input
                    type="date"
                    value={dataNecessidade}
                    onChange={(e) => setDataNecessidade(e.target.value)}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>Observações</label>
                  <input
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Notas gerais sobre a ordem..."
                    className={input}
                  />
                </div>
              </div>

              {/* Título da grade */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-[#1E2A78] font-semibold">Itens da Ordem</div>
                <button
                  onClick={addLinha}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DDE7FF] px-3 py-2 text-[#0F2C93] hover:bg-[#F7FAFF]"
                >
                  <Plus size={16} />
                  Adicionar Item
                </button>
              </div>

              {/* Grade */}
              {tipo === 'compra' ? (
                <GradeCompra
                  linhas={linhas as LinhaCompra[]}
                  onRemove={removeLinha}
                  onUpdate={atualizarLinha}
                  onCodigoChange={handleCodigoChange}
                  inputCls={input}
                  labelCls={label}
                  indexByCodigo={indexByCodigo}
                />
              ) : (
                <GradePlanejamento
                  linhas={linhas as LinhaPlanej[]}
                  onRemove={removeLinha}
                  onUpdate={atualizarLinha}
                  onCodigoChange={handleCodigoChange}
                  inputCls={input}
                  centros={centrosMock}
                  indexByCodigo={indexByCodigo}
                />
              )}

              {/* Resumo */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-[#E6ECFF] p-3">
                  <div className="text-xs text-[#6b7280]">Tipo de Ordem</div>
                  <div className="text-lg font-semibold text-[#1E2A78]">
                    {tipo === 'compra' ? 'Ordem de Compra' : 'Ordem de Planejamento'}
                  </div>
                </div>
                <div className="rounded-xl border border-[#E6ECFF] p-3">
                  <div className="text-xs text-[#6b7280]">Itens</div>
                  <div className="text-lg font-semibold text-[#1E2A78]">{linhas.length}</div>
                </div>
                <div className="rounded-xl border border-[#E6ECFF] p-3">
                  <div className="text-xs text-[#6b7280]">
                    {tipo === 'compra' ? 'Total Estimado' : 'Prazo Médio (dias)'}
                  </div>
                  <div className="text-lg font-semibold text-[#1E2A78]">
                    {tipo === 'compra'
                      ? total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : Math.round(
                          (linhas as LinhaPlanej[]).reduce((a, l) => a + (l.prazoLogisticoDias || 0), 0) /
                            Math.max((linhas as LinhaPlanej[]).length, 1)
                        ) || 0}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={salvarRascunho}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DDE7FF] px-4 py-2 text-[#0F2C93] hover:bg-white"
                >
                  Salvar Rascunho
                </button>
                <button
                  onClick={registrarOrdem}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-white font-semibold bg-[#0F2C93] hover:bg-[#0c257b]"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* Grade de Compra */
function GradeCompra({
  linhas,
  onRemove,
  onUpdate,
  onCodigoChange,
  inputCls,
  labelCls,
  indexByCodigo,
}: {
  linhas: LinhaCompra[];
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, patch: Partial<LinhaCompra>) => void;
  onCodigoChange: (idx: number, codigo: string) => void;
  inputCls: string;
  labelCls: string;
  indexByCodigo: Map<string, ItemIndex>;
}) {
  return (
    <div className="overflow-auto mt-3 rounded-xl border border-[#E6ECFF]">
      <table className="min-w-[1000px] w-full text-sm">
        <thead className="bg-[#F8FAFF] text-[#475569]">
          <tr>
            <th className="text-left px-3 py-2 w-[170px]">Código</th>
            <th className="text-left px-3 py-2 w-[110px]">Classe</th>
            <th className="text-left px-3 py-2">Descrição</th>
            <th className="text-left px-3 py-2 w-[110px]">Quantidade</th>
            <th className="text-left px-3 py-2 w-[180px]">Fornecedor</th>
            <th className="text-left px-3 py-2 w-[160px]">Local</th>
            <th className="text-left px-3 py-2 w-[140px]">Prazo Logíst. (dias)</th>
            <th className="text-left px-3 py-2 w-[140px]">Valor Unit.</th>
            <th className="text-right px-3 py-2 w-[140px]">Subtotal</th>
            <th className="px-3 py-2 w-[60px]"></th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, idx) => {
            const subtotal = (Number(l.quantidade) || 0) * (Number(l.valorUnit) || 0);
            const sugestoes = [...indexByCodigo.keys()]
              .filter((c) => l.codigo && c.toLowerCase().includes(l.codigo.toLowerCase()))
              .slice(0, 5);

            return (
              <tr key={idx} className={idx % 2 ? 'bg-white' : 'bg-[#FBFCFF]'}>
                <td className="px-3 py-2 align-top">
                  <input
                    className={`${inputCls} h-10`}
                    placeholder="Ex.: ROXR-033849"
                    value={l.codigo}
                    onChange={(e) => onCodigoChange(idx, e.target.value)}
                    list={`codigos-compra-${idx}`}
                  />
                  <datalist id={`codigos-compra-${idx}`}>
                    {sugestoes.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    className={`${inputCls} h-10`}
                    placeholder="A/B/C"
                    value={l.classe ?? ''}
                    onChange={(e) => onUpdate(idx, { classe: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    className={`${inputCls} h-10`}
                    placeholder="Descrição"
                    value={l.descricao ?? ''}
                    onChange={(e) => onUpdate(idx, { descricao: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="number"
                    min={1}
                    className={`${inputCls} h-10`}
                    value={l.quantidade}
                    onChange={(e) => onUpdate(idx, { quantidade: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    className={`${inputCls} h-10`}
                    placeholder="Fornecedor"
                    value={l.fornecedor ?? ''}
                    onChange={(e) => onUpdate(idx, { fornecedor: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    className={`${inputCls} h-10`}
                    placeholder="Local/Depósito"
                    value={l.local ?? ''}
                    onChange={(e) => onUpdate(idx, { local: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="number"
                    min={0}
                    className={`${inputCls} h-10`}
                    value={l.prazoLogisticoDias ?? 0}
                    onChange={(e) => onUpdate(idx, { prazoLogisticoDias: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${inputCls} h-10`}
                    value={l.valorUnit ?? ''}
                    onChange={(e) => onUpdate(idx, { valorUnit: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2 text-right align-top">
                  {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-3 py-2 align-top">
                  <button
                    onClick={() => onRemove(idx)}
                    className="h-10 w-10 grid place-items-center rounded-lg border border-[#FAD1D7] text-[#e11d48] hover:bg-[#FFF1F2]"
                    aria-label="Remover linha"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-6 text-center text-[#64748b]">
                Nenhum item. Importe um CSV ou adicione manualmente.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* Grade de Planejamento */
function GradePlanejamento({
  linhas,
  onRemove,
  onUpdate,
  onCodigoChange,
  inputCls,
  centros,
  indexByCodigo,
}: {
  linhas: LinhaPlanej[];
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, patch: Partial<LinhaPlanej>) => void;
  onCodigoChange: (idx: number, codigo: string) => void;
  inputCls: string;
  centros: string[];
  indexByCodigo: Map<string, ItemIndex>;
}) {
  return (
    <div className="overflow-auto mt-3 rounded-xl border border-[#E6ECFF]">
      <table className="min-w-[1150px] w-full text-sm">
        <thead className="bg-[#F8FAFF] text-[#475569]">
          <tr>
            <th className="text-left px-3 py-2 w-[170px]">Código</th>
            <th className="text-left px-3 py-2 w-[100px]">Classe</th>
            <th className="text-left px-3 py-2 w-[110px]">Quantidade</th>
            <th className="text-left px-3 py-2 w-[200px]">Origem (Centro)</th>
            <th className="text-left px-3 py-2 w-[200px]">Destino (Centro)</th>
            <th className="text-left px-3 py-2 w-[130px]">Prazo (dias)</th>
            <th className="text-left px-3 py-2 w-[220px]">Agendar Recebimento</th>
            <th className="text-left px-3 py-2 w-[160px]">Data</th>
            <th className="text-left px-3 py-2 w-[120px]">Hora</th>
            <th className="text-left px-3 py-2 w-[160px]">Rota mais rápida</th>
            <th className="px-3 py-2 w-[60px]"></th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, idx) => {
            const sugestoes = [...indexByCodigo.keys()]
              .filter((c) => l.codigo && c.toLowerCase().includes(l.codigo.toLowerCase()))
              .slice(0, 5);

            return (
              <tr key={idx} className={idx % 2 ? 'bg-white' : 'bg-[#FBFCFF]'}>
                <td className="px-3 py-2 align-top">
                  <input
                    className={`${inputCls} h-10`}
                    placeholder="Ex.: ROXR-033849"
                    value={l.codigo}
                    onChange={(e) => onCodigoChange(idx, e.target.value)}
                    list={`codigos-plan-${idx}`}
                  />
                  <datalist id={`codigos-plan-${idx}`}>
                    {sugestoes.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    className={`${inputCls} h-10`}
                    placeholder="A/B/C"
                    value={l.classe ?? ''}
                    onChange={(e) => onUpdate(idx, { classe: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="number"
                    min={1}
                    className={`${inputCls} h-10`}
                    value={l.quantidade}
                    onChange={(e) => onUpdate(idx, { quantidade: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <select
                    className={`${inputCls} h-10`}
                    value={l.origem ?? ''}
                    onChange={(e) => onUpdate(idx, { origem: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {centros.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 align-top">
                  <select
                    className={`${inputCls} h-10`}
                    value={l.destino ?? ''}
                    onChange={(e) => onUpdate(idx, { destino: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {centros.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="number"
                    min={0}
                    className={`${inputCls} h-10`}
                    value={l.prazoLogisticoDias ?? 0}
                    onChange={(e) => onUpdate(idx, { prazoLogisticoDias: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={l.agendarRecebimento}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onUpdate(idx, {
                          agendarRecebimento: checked,
                          ...(checked ? {} : { dataReceb: '', horaReceb: '' }),
                        });
                      }}
                    />
                    <span>Agendar</span>
                  </label>
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="date"
                    disabled={!l.agendarRecebimento}
                    className={`${inputCls} h-10 ${!l.agendarRecebimento ? 'opacity-60' : ''}`}
                    value={l.dataReceb ?? ''}
                    onChange={(e) => onUpdate(idx, { dataReceb: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="time"
                    disabled={!l.agendarRecebimento}
                    className={`${inputCls} h-10 ${!l.agendarRecebimento ? 'opacity-60' : ''}`}
                    value={l.horaReceb ?? ''}
                    onChange={(e) => onUpdate(idx, { horaReceb: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={l.priorizarRotaMaisRapida}
                      onChange={(e) => onUpdate(idx, { priorizarRotaMaisRapida: e.target.checked })}
                    />
                    <span>Priorizar</span>
                  </label>
                </td>
                <td className="px-3 py-2 align-top">
                  <button
                    onClick={() => onRemove(idx)}
                    className="h-10 w-10 grid place-items-center rounded-lg border border-[#FAD1D7] text-[#e11d48] hover:bg-[#FFF1F2]"
                    aria-label="Remover linha"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={11} className="px-3 py-6 text-center text-[#64748b]">
                Nenhum item. Importe um CSV ou adicione manualmente.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}