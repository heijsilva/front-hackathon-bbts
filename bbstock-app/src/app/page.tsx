'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: chame sua API de autenticação aqui
      await new Promise((res) => setTimeout(res, 700));
      router.push('/dashboard'); // navegação Next.js
    } catch (err) {
      console.error(err);
      alert('Falha ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 grid-cols-1">
      {/* Painel esquerdo: somente a imagem da logo (wordmark embutido na imagem) */}
      <section className="hidden lg:flex items-center bg-primary px-[6vw]">
        <div className="max-w-2xl">
          <Image
            src="/logo.png"
            width={260}
            height={120}
            alt="BBTStock"
            priority
          />

          <p className="mt-8 text-white/90 text-[1.125rem] leading-8 max-w-xl">
            Sistema inteligente de gestão de estoque e aquisições. Acesse sua
            conta para acompanhar KPIs, sugestões de compra e movimentações em
            tempo real.
          </p>
        </div>
      </section>

      {/* Painel direito (card de login) */}
      <section className="flex items-center justify-center px-4 sm:px-8 py-10 bg-[var(--color-background)]">
        <div className="w-full max-w-lg">
          {/* Logo menor em telas pequenas */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <Image
              src="/logo.png"
              width={160}
              height={60}
              alt="BBTStock"
              priority
            />
          </div>

          <div
            className="bg-white rounded-2xl border border-black/10 shadow-[0_20px_60px_-20px_rgba(26,35,126,0.25)]"
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-black/10">
              <h2 className="text-[1.25rem] font-semibold text-[#1f2937]">
                Acessar conta
              </h2>
              <p className="text-sm text-[#6b7280] mt-1">
                Entre com seu usuário e senha para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-5">
              {/* Usuário */}
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-sm font-medium text-[#111827]">
                  Usuário
                </label>
                <input
                  id="usuario"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#e5e7eb] bg-white px-3 text-[#111827]
                             placeholder:text-[#9ca3af] outline-none
                             focus:border-accent focus:ring-2 focus:ring-accent/30 transition"
                  autoComplete="username"
                  required
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium text-[#111827]">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#e5e7eb] bg-white px-3 text-[#111827]
                             placeholder:text-[#9ca3af] outline-none
                             focus:border-accent focus:ring-2 focus:ring-accent/30 transition"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-white font-semibold
                           hover:bg-[#16206d] transition disabled:opacity-60 disabled:cursor-not-allowed"
                aria-busy={loading}
                aria-live="polite"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              {/* Separador */}
              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-[#e5e7eb] flex-1" />
                <span className="text-xs text-[#9ca3af]">ou</span>
                <div className="h-px bg-[#e5e7eb] flex-1" />
              </div>

              {/* Botão Authenticator */}
              <button
                type="button"
                className="w-full h-11 rounded-xl border border-[#e5e7eb] bg-white hover:bg-black/[0.04]
                           text-primary font-medium transition"
                onClick={() => alert('Integre aqui seu Microsoft Authenticator/SSO')}
              >
                Microsoft Authenticator
              </button>

              {/* Recuperação de acesso */}
              <div className="text-right">
                <Link
                  href="/recuperar"
                  className="text-sm text-secondary hover:text-[#007a6f] underline underline-offset-2"
                >
                  Recuperar acesso
                </Link>
              </div>
            </form>

            <div className="px-6 sm:px-10 pb-6 text-center">
              <p className="text-xs text-[#6b7280]">
                Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}