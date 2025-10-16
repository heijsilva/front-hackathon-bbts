// src/app/mapa/page.tsx
'use client';
import Header from '@/app/components/Header';
import dynamic from 'next/dynamic';
const MapaRegional = dynamic(() => import('@/app/components/MapaRegional'), { ssr: false });

export default function MapaPage() {
  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      <Header showTabs activeTab="mapa" />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <MapaRegional />
      </main>
    </div>
  );
}