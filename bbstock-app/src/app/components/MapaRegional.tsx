'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L, {
  LatLngExpression,
  Map as LeafletMap,
  TileLayer as LeafletTileLayer,
  Marker as LeafletMarker,
  DivIcon,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';

import iconUrlObj from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrlObj from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrlObj from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl: iconRetinaUrlObj.src,
  iconUrl: iconUrlObj.src,
  shadowUrl: shadowUrlObj.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
(L.Marker as any).prototype.options.icon = DefaultIcon;

/* Envelope amplo do Brasil (para acelerar amostragem) */
const BR_BBOX = {
  latMin: -34.0,
  latMax: 6.0,
  lonMin: -74.5,
  lonMax: -32.0,
};

/* Polígono simplificado do Brasil (lat, lon) – precisão suficiente para demo
   Fonte: simplificação manual baseada em Natural Earth (muito reduzido) */
const BR_POLY: [number, number][][] = [
  [
    [-33.752, -53.372], // RS-URU
    [-30.216, -57.625],
    [-26.623, -58.618],
    [-22.090, -62.685],
    [-19.356, -65.402],
    [-13.427, -68.673],
    [-9.760, -70.548],
    [-7.535, -73.987],
    [-2.134, -72.880],
    [2.200, -69.945],
    [3.770, -60.020],
    [1.230, -51.660],
    [4.160, -51.640],
    [4.350, -48.500],
    [2.820, -44.900],
    [0.000, -45.000],
    [-1.000, -41.000],
    [-2.800, -39.000],
    [-5.500, -36.000],
    [-8.000, -34.000],
    [-12.500, -38.000],
    [-16.000, -39.500],
    [-19.000, -40.500],
    [-21.500, -41.000],
    [-23.700, -41.400],
    [-25.500, -48.000],
    [-28.500, -48.650],
    [-33.000, -52.000],
    [-33.752, -53.372], // fecha
  ],
];

/* Ponto no polígono (ray casting) – recebe [lat, lon] e Polygon[[lat,lon],...] */
function pointInPolygon(point: [number, number], polygon: [number, number][][]): boolean {
  const [lat, lon] = point;
  let inside = false;

  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];

      const intersect =
        yi > lon !== yj > lon &&
        lat < ((xj - xi) * (lon - yi)) / (yj - yi + 1e-12) + xi;
      if (intersect) inside = !inside;
    }
  }
  return inside;
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const sample = <T,>(arr: T[]) => arr[randInt(0, arr.length - 1)];

/* Amostra coordenadas dentro do polígono do Brasil */
function randomCoordInBrazilStrict(maxTries = 500): [number, number] {
  for (let k = 0; k < maxTries; k++) {
    const lat = rand(BR_BBOX.latMin, BR_BBOX.latMax);
    const lon = rand(BR_BBOX.lonMin, BR_BBOX.lonMax);
    const p: [number, number] = [lat, lon];
    if (pointInPolygon(p, BR_POLY)) {
      // pequeno jitter para não colar na costa
      const jLat = rand(-0.05, 0.05);
      const jLon = rand(-0.05, 0.05);
      return [lat + jLat, lon + jLon];
    }
  }
  // fallback raro: centro do Brasil
  return [-14.2 + rand(-0.5, 0.5), -51.9 + rand(-0.5, 0.5)];
}

/* Força qualquer coord a cair dentro do Brasil: se não estiver, reamostra */
function forceIntoBrazil(pos: [number, number]): [number, number] {
  if (pointInPolygon(pos, BR_POLY)) return pos;
  return randomCoordInBrazilStrict();
}

type Ponto = {
  id: string;
  tipo: 'coleta' | 'fornecedor';
  nome: string;
  produtoChave: string;
  fornecedor?: string;
  pos: [number, number];
  estoque: number;
  tendencia: 'Crescimento' | 'Redução';
};

const ICONS = {
  coleta: L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:#16a34a;border:3px solid #86efac;width:18px;height:18px;border-radius:9999px;box-shadow:0_0_0_4px rgba(22,163,74,0.15)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }),
  fornecedor: L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:#1d4ed8;border:3px solid #93c5fd;width:18px;height:18px;border-radius:9999px;box-shadow:0_0_0_4px rgba(29,78,216,0.15)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }),
} satisfies Record<'coleta' | 'fornecedor', DivIcon>;

export default function MapaRegional() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<LeafletTileLayer | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  const produtos = [
    'Roteador X1',
    'Switch Pro 24',
    'Módulo SFP+',
    'Bateria 12V',
    'Cabo CAT6',
    'ONT Z-2000',
    'Conector RJ45',
    'ONU XPTO',
  ];
  const fornecedoresList = ['TechNord', 'AlphaTel', 'BrasilNet', 'FTTx Supply', 'Giganet', 'OptiWare', 'MangueLabs'];

  const [pontosBase] = useState<Ponto[]>(() => {
    const arr: Ponto[] = [];
    for (let i = 0; i < 16; i++) {
      arr.push({
        id: `C${i}`,
        tipo: 'coleta',
        nome: `Centro de Coleta ${i + 1}`,
        produtoChave: sample(produtos),
        pos: randomCoordInBrazilStrict(),
        estoque: randInt(50, 900),
        tendencia: Math.random() > 0.5 ? 'Crescimento' : 'Redução',
      });
    }
    for (let i = 0; i < 16; i++) {
      arr.push({
        id: `F${i}`,
        tipo: 'fornecedor',
        nome: `Fornecedor ${i + 1}`,
        fornecedor: sample(fornecedoresList),
        produtoChave: sample(produtos),
        pos: randomCoordInBrazilStrict(),
        estoque: randInt(100, 1200),
        tendencia: Math.random() > 0.5 ? 'Crescimento' : 'Redução',
      });
    }
    // Segurança extra: garante todos os pontos dentro do BR
    return arr.map((p) => ({ ...p, pos: forceIntoBrazil(p.pos) }));
  });

  const [qRegiao, setQRegiao] = useState('Recife, PE');
  const [qProduto, setQProduto] = useState('');
  const [fSomenteFornecedores, setFSomenteFornecedores] = useState(false);
  const [fSomenteColetas, setFSomenteColetas] = useState(false);
  const [fFornecedorSelecionado, setFFornecedorSelecionado] = useState<string>('');

  const brasilCentro: LatLngExpression = useMemo(() => [-14.2, -51.9], []);
  const [flyToCenter, setFlyToCenter] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    containerRef.current.style.width = '100%';
    containerRef.current.style.height = '100%';

    const map = L.map(containerRef.current, {
      center: brasilCentro as [number, number],
      zoom: 4,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;

    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 50);
    window.requestAnimationFrame(() => map.invalidateSize());

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, [brasilCentro]);

  const pontosFiltrados = useMemo(() => {
    return pontosBase
      .map((p) => ({ ...p, pos: forceIntoBrazil(p.pos) })) // força novamente (para dados que vierem de fora)
      .filter((p) => {
        if (fSomenteFornecedores && p.tipo !== 'fornecedor') return false;
        if (fSomenteColetas && p.tipo !== 'coleta') return false;
        if (qProduto && !p.produtoChave.toLowerCase().includes(qProduto.toLowerCase())) return false;
        if (fFornecedorSelecionado && p.fornecedor !== fFornecedorSelecionado) return false;
        return true;
      });
  }, [pontosBase, fSomenteFornecedores, fSomenteColetas, qProduto, fFornecedorSelecionado]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pontosFiltrados.forEach((p) => {
      const m = L.marker(p.pos, { icon: p.tipo === 'coleta' ? ICONS.coleta : ICONS.fornecedor })
        .addTo(mapRef.current as LeafletMap)
        .bindPopup(
          `
          <div style="font-size:13px;line-height:1.2">
            <div style="font-weight:600">${p.nome}</div>
            <div style="color:#64748b">Tipo: ${p.tipo === 'coleta' ? 'Centro de Coleta' : 'Fornecedor'}</div>
            ${p.fornecedor ? `<div>Fornecedor: ${p.fornecedor}</div>` : ''}
            <div>Produto-chave: ${p.produtoChave}</div>
            <div>Estoque: ${p.estoque} un.</div>
            <div>Tendência: <span style="color:${p.tendencia === 'Crescimento' ? '#16a34a' : '#ef4444'}">${p.tendencia}</span></div>
          </div>
        `
        );
      markersRef.current.push(m);
    });

    mapRef.current.invalidateSize();
  }, [pontosFiltrados]);

  useEffect(() => {
    if (flyToCenter && mapRef.current) {
      mapRef.current.flyTo(flyToCenter as [number, number], 6, { duration: 1.1 });
    }
  }, [flyToCenter]);

  async function buscarRegiao() {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'json');
      url.searchParams.set('q', qRegiao);
      url.searchParams.set('countrycodes', 'br');
      url.searchParams.set('limit', '1');

      const resp = await fetch(url.toString(), {
        headers: { 'User-Agent': 'BBStock/1.0 (hackathon)' },
      });
      const data = await resp.json();
      if (data?.length) {
        const { lat, lon } = data[0];
        const pos: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setFlyToCenter(forceIntoBrazil(pos));
      } else {
        alert('Não encontrado. Tente “Cidade, UF”.');
      }
    } catch (e) {
      console.error(e);
      alert('Falha na geocodificação. Tente novamente.');
    }
  }

  const labelCls = 'block text-sm text-[#1E2A78] mt-4 mb-1';
  const inputBase =
    'w-full h-11 rounded-xl bg-white px-4 text-[15px] focus:outline-none focus:ring-2';
  const inputBorder =
    'border border-[#C7D2FE] focus:ring-[#AFC6FF]/60 focus:border-[#6B7CFF] placeholder:text-[#9AA6D1] text-[#0F172A]';

  return (
    <section className="rounded-2xl border border-[#C7D2FE] bg-white/60 shadow-[inset_0_0_0_9999px_rgba(99,102,241,0.06)] p-4 sm:p-6">
      <div className="rounded-2xl border border-[#DDE7FF] bg-white relative">
        <div className="absolute left-6 top-6 z-[500]">
          <div className="w-[320px] max-w-[88vw] rounded-2xl border border-[#DDE7FF] bg-white/95 backdrop-blur p-4 shadow-[0_12px_30px_-12px_rgba(26,35,126,0.18)]">
            <div className="flex items-center gap-2 text-[#213B9A]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#213B9A" strokeWidth="2" aria-hidden>
                <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3 className="text-[18px] font-semibold">Distribuição de estoque por região</h3>
            </div>

            <label className={`${labelCls} mt-3`}>Buscar por região</label>
            <div className="relative">
              <input
                aria-label="Buscar por região"
                value={qRegiao}
                onChange={(e) => setQRegiao(e.target.value)}
                placeholder="Ex.: Recife, PE"
                className={`${inputBase} ${inputBorder} pr-11`}
              />
              <button
                onClick={buscarRegiao}
                className="absolute right-1 top-1 h-9 w-9 rounded-xl grid place-items-center text-[#1E2A78] hover:bg-[#F1F5FF] focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]/60"
                aria-label="Buscar região"
                title="Buscar"
              >
                <Search size={18} />
              </button>
            </div>

            <label className={labelCls}>Buscar por produto</label>
            <input
              aria-label="Buscar por produto"
              value={qProduto}
              onChange={(e) => setQProduto(e.target.value)}
              placeholder="Ex.: Cabo, SFP+, ONT..."
              className={`${inputBase} ${inputBorder}`}
            />

            <label className={labelCls}>Filtrar fornecedor</label>
            <select
              aria-label="Filtrar fornecedor"
              value={fFornecedorSelecionado}
              onChange={(e) => setFFornecedorSelecionado(e.target.value)}
              className={`${inputBase} ${inputBorder}`}
            >
              <option value="">Todos</option>
              {fornecedoresList.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-[#1E2A78]">
                <input
                  type="checkbox"
                  checked={fSomenteColetas}
                  onChange={(e) => setFSomenteColetas(e.target.checked)}
                />
                Somente Coletas
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[#1E2A78]">
                <input
                  type="checkbox"
                  checked={fSomenteFornecedores}
                  onChange={(e) => setFSomenteFornecedores(e.target.checked)}
                />
                Somente Fornecedores
              </label>
            </div>

            <div className="mt-3 text-xs text-[#334155]">
              Mostrando {pontosFiltrados.length} de {pontosBase.length} pontos
            </div>
          </div>
        </div>

        <div className="h-[640px] rounded-2xl overflow-hidden relative">
          <div ref={containerRef} id="bbstock-map" className="w-full h-full" />
          <div className="absolute right-6 bottom-6 z-[500] rounded-xl border border-[#DDE7FF] bg-white/95 backdrop-blur px-4 py-3 shadow">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#16a34a]" />
                <span>Crescimento</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#1d4ed8]" />
                <span>Fornecedor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}