# BBtStock — Tela de Login (Next.js + Tailwind)

## Visão geral
Este repositório documenta a tela de Login do BBtStock construída com Next.js (App Router), React, TypeScript e Tailwind CSS. A interface segue o layout fornecido:
- Coluna esquerda em full screen com a arte “Component 1 (2).png” cobrindo 100% da área, sem distorção, usando Next/Image com fill e object-cover.
- Coluna direita com cartão de autenticação: campos Login e Senha, botão Entrar, divisor “ou”, botão Microsoft Authenticator e link Recuperar acesso.
- Comportamento responsivo: no mobile a arte vira um banner no topo do formulário, preservando legibilidade.

## Funcionalidades
- Layout responsivo em grid com 2 colunas (desktop) e 1 coluna (mobile).
- Imagem full-bleed em desktop, sem cortes, com ancoragem à esquerda (object-left).
- Formulário de login com:
  - Campos com label e autocomplete configurados.
  - Estado de loading no botão “Entrar”.
  - Acessibilidade: foco com alto contraste, aria-busy durante envio.
- Botão “Microsoft Authenticator” pronto para integrar SSO/IdP.
- Link “Recuperar acesso”.
- Navegação para “/dashboard” após login simulado (substituir por autenticação real).

## Estrutura recomendada
- src/app/login/page.tsx
  - Componente da tela de login (App Router).
- public/Component 1 (2).png
  - Arte usada como fundo da coluna esquerda e como banner no mobile.
- public/logo.png
  - Logomarca exibida no rodapé esquerdo do painel da arte (desktop).

Se preferir evitar espaços no nome da imagem, renomeie para public/login-art.png e atualize o caminho no código.

## Requisitos
- Node.js 18+
- Gerenciador de pacotes (npm, yarn ou pnpm)
- Next.js 13.4+ (App Router)
- TypeScript 5+
- Tailwind CSS 3.4+
- PostCSS e Autoprefixer

As versões mínimas estão listadas em requirements.txt.

## Como executar

1) Criar um projeto (se ainda não tiver)
- npm: npx create-next-app@latest bbtstock
- yarn: yarn create next-app bbtstock
- pnpm: pnpm create next-app bbtstock
Selecione TypeScript e App Router.

2) Instalar Tailwind (se seu projeto ainda não tiver)
- npm: npm install -D tailwindcss postcss autoprefixer
- yarn: yarn add -D tailwindcss postcss autoprefixer
- pnpm: pnpm add -D tailwindcss postcss autoprefixer
- Inicialize: npx tailwindcss init -p

3) Configurar Tailwind

tailwind.config.js:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

globals.css (ou src/app/globals.css):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4) Adicionar os assets
- Coloque a arte em public/Component 1 (2).png
- Coloque a logo em public/logo.png

5) Criar a página de login
Crie src/app/login/page.tsx com o código entregue na conversa. Pontos-chave:
- Coluna esquerda: section relativa com h-screen e Next/Image com fill + object-cover + object-left.
- Coluna direita: formulário com labels, placeholders, foco, loading, e navegação pós-login.

6) Executar
- npm: npm run dev
- yarn: yarn dev
- pnpm: pnpm dev
Abra http://localhost:3000/login

## Integração de autenticação
No handleSubmit:
- Substitua o setTimeout por chamada ao seu backend/IdP (OAuth/OIDC/SAML/API própria).
- Em sucesso, redirecione (router.push('/dashboard') ou rota desejada).
- Em erro, exiba mensagens inline e estilos de erro (borda vermelha, texto auxiliar).

## Personalizações
- Foco da arte: altere object-left para object-center ou object-[position:left_top] para reposicionar.
- Cores:
  - Primária do botão: #3D4CFF
  - Fundo da coluna direita: #0B0F1A
- Altura do banner mobile: ajuste o paddingTop no wrapper do banner.

## Solução de problemas
- Imagem não cobre: confirme que o arquivo está em public/ e que o src está correto; use fill + object-cover; garanta h-screen na coluna.
- Letterbox em telas ultrawide: mantenha object-left; adicione bg-[#3D4CFF] na section como fallback.
- 404 em /login: verifique a existência de src/app/login/page.tsx (App Router).
- Tailwind sem efeito: confira os paths em content do tailwind.config.js e os imports @tailwind no CSS global.

## Scripts recomendados (package.json)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Licenças
Use a arte e a logomarca conforme os direitos do projeto. Confirme permissões antes de distribuir.

## Contato
Em caso de dúvidas técnicas, revise “Solução de problemas” e verifique paths, versões e configuração do Tailwind. A integração de autenticação depende do seu provedor de identidade e backend.
