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
      {/* Painel esquerdo: fundo azul com arte + logo */}
      <section
        className="hidden lg:flex relative items-center justify-center"
        style={{ backgroundColor: '#3D4CFF' }}
      >
        {/* Ilustração como background full (mantém proporção) */}
        <Image
          src="/Component 1 (2).png"
          alt="Arte BBTStock"
          fill
          priority
          className="object-cover object-center opacity-100"
        />
        {/* Overlay azul para garantir contraste e manter cores da arte */}
        <div className="absolute inset-0 bg-[#3D4CFF]/65" />
        {/* Logo no canto inferior esquerdo (como no mock) */}
        <div className="relative w-full max-w-5xl px-[5vw]">
          <div className="mt-[8vh]"></div>
          <div className="flex items-end h-[62vh]">
            <Image
              src="/logo.png"
              width={280}
              height={120}
              alt="BBTStock"
              priority
              className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>
      </section>

      {/* Painel direito (card de login) */}
      <section
        className="flex items-center justify-center px-4 sm:px-8 py-10"
        style={{ backgroundColor: '#0B0F1A' }} // borda externa mais escura como na imagem
      >
        <div className="w-full max-w-lg">
          {/* Em telas pequenas, mostrar header compacto com logo sobre fundo azul + arte */}
          <div className="lg:hidden relative overflow-hidden rounded-2xl mb-6">
            <div className="absolute inset-0">
              <Image
                src="/Component 1 (2).png"
                alt="Arte BBTStock"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-[#3D4CFF]/70" />
            </div>
            <div className="relative p-5 flex items-center justify-center">
              <Image src="/logo.png" width={160} height={60} alt="BBTStock" />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl border border-black/10 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)]"
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-black/10">
              <h2 className="text-[1.05rem] font-semibold text-[#0f172a]">
                Login
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-5">
              {/* Login/Usuário */}
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-sm font-medium text-[#111827]">
                  Login
                </label>
                <input
                  id="usuario"
                  type="text"
                  placeholder="Digite seu email"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 text-[#111827]
                             placeholder:text-[#9ca3af] outline-none
                             focus:border-[#3D4CFF] focus:ring-2 focus:ring-[#3D4CFF]/25 transition"
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
                  className="w-full h-11 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 text-[#111827]
                             placeholder:text-[#9ca3af] outline-none
                             focus:border-[#3D4CFF] focus:ring-2 focus:ring-[#3D4CFF]/25 transition"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#3D4CFF] text-white font-semibold
                           hover:bg-[#3340e3] transition disabled:opacity-60 disabled:cursor-not-allowed"
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

              {/* Botão Authenticator com ícone */}
              <button
                type="button"
                className="w-full h-11 rounded-lg border border-[#e5e7eb] bg-white hover:bg-black/[0.04]
                           text-[#1f2937] font-medium transition inline-flex items-center justify-center gap-2"
                onClick={() => alert('Integre aqui seu Microsoft Authenticator/SSO')}
              >
                <span className="inline-flex w-5 h-5 items-center justify-center rounded border border-[#d1d5db]">
                  {/* pequeno ícone/checkbox estilizado para lembrar a UI do print */}
                  <span className="w-2.5 h-2.5 bg-[#3D4CFF] rounded-sm" />
                </span>
                Microsoft Authenticator
              </button>

              {/* Recuperação de acesso */}
              <div className="text-right">
                <Link
                  href="/recuperar"
                  className="text-sm text-[#3D4CFF] hover:text-[#2b36c8] underline underline-offset-2"
                >
                  Recuperar acesso
                </Link>
              </div>
            </form>

            <div className="px-6 sm:px-10 pb-6 text-center">
              <p className="text-xs text-[#6b7280]">
                Esqueceu sua senha?{' '}
                <Link href="/recuperar" className="text-[#3D4CFF] hover:text-[#2b36c8] underline underline-offset-2">
                  Recuperar acesso
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}