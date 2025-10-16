'use client';

import Header from '@/app/components/Header';
import SugestoesList from '@/app/components/SugestoesList';

export default function SugestoesPage() {
  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      <Header showTabs activeTab="sugestoes" />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <section className="rounded-2xl border border-[#C7D2FE] bg-white/60 shadow-[inset_0_0_0_9999px_rgba(99,102,241,0.06)] p-4 sm:p-6">
          <div className="rounded-2xl border border-[#DDE7FF] bg-white p-5 sm:p-6">
            <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#1E2A78]">
              Recomendações baseadas em análise preditiva
            </h2>
            <div className="mt-4">
              <SugestoesList />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}