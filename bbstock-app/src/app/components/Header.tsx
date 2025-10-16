'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import { useState } from 'react';

type HeaderProps = {
  showTabs?: boolean;
  activeTab?:
    | 'visao'
    | 'alertas'
    | 'mapa'
    | 'sugestoes'
    | 'movs'
    | 'criarordem'; // nova aba
  onSearch?: (q: string) => void;
};

export default function Header({ showTabs = true, activeTab = 'visao', onSearch }: HeaderProps) {
  const [q, setQ] = useState('');

  const tabs = [
    { key: 'visao', label: 'Visão Geral', href: '/dashboard' },
    { key: 'alertas', label: 'Alertas Urgentes', href: '/alertas' },
    { key: 'mapa', label: 'Mapa de Estoque Regional', href: '/mapa' },
    { key: 'sugestoes', label: 'Sugestões Inteligentes', href: '/sugestoes' },
    { key: 'movs', label: 'Registro de Movimentação', href: '/movimentacoes' },
    { key: 'criarordem', label: 'Criar Ordem', href: '/criar-ordem' }, // nova aba
  ] as const;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(q);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-b border-[#E6ECFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="BBTStock" width={120} height={36} priority />
        </Link>

        {/* Busca */}
        <form onSubmit={handleSubmit} className="flex-1 hidden md:block">
          <div className="relative w-full max-w-2xl mx-auto">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos, contratos, fornecedores..."
              className="w-full h-11 rounded-full border border-[#E6ECFF] bg-white pl-5 pr-12 text-[15px] text-[#111827] placeholder:text-[#A0A9C0] focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]/40"
              aria-label="Buscar"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-1 top-1 h-9 w-9 rounded-full grid place-items-center text-primary hover:bg-[#F1F5FF]"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Ações */}
        <div className="ml-auto flex items-center gap-3">
          <button
            aria-label="Notificações"
            className="relative h-10 w-10 grid place-items-center rounded-full border border-[#AFC6FF] text-primary hover:bg-[#F1F5FF]"
          >
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#FF3B3B] text-white text-[10px] leading-4 font-semibold grid place-items-center">
              3
            </span>
          </button>

          {/* Avatar simples com iniciais */}
          <button
            className="h-10 px-3 rounded-full border-2 border-primary/70 text-primary font-semibold"
            aria-label="Abrir menu do usuário"
            title="João Silva"
          >
            JS
          </button>
        </div>
      </div>

      {/* Tabs */}
      {showTabs && (
        <nav className="border-t border-[#E6ECFF]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ul className="flex gap-6 overflow-x-auto py-3 text-[15px]">
              {tabs.map((t) => {
                const isActive = t.key === activeTab;
                return (
                  <li key={t.key}>
                    <Link
                      href={t.href}
                      className={
                        isActive
                          ? 'text-primary font-semibold border-b-2 border-primary pb-2'
                          : 'text-[#39456B] hover:text-primary pb-2'
                      }
                    >
                      {t.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}