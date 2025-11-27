This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Configuração do Banco de Dados (Supabase)

### Variáveis de Ambiente

Este projeto requer duas variáveis de ambiente para conexão com o Supabase:

1. **`DATABASE_URL`**: Use a connection string em **Transaction Mode** (porta 6543) para a aplicação Next.js (serverless/edge functions).

   - Formato: `postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres`
   - Esta é a conexão usada pela aplicação em runtime.

2. **`DRIZZLE_DATABASE_URL`** (opcional, mas recomendado): Use a connection string em **Direct Connection** (porta 5432) ou **Session Mode** para o Drizzle Kit.
   - Direct Connection: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Session Mode: `postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`
   - Se não for definida, o Drizzle Kit usará `DATABASE_URL` como fallback.

**Importante**: O Drizzle Kit precisa de uma conexão que suporte funcionalidades completas do Postgres. Transaction Mode não é recomendado para ferramentas CLI. Use Direct Connection ou Session Mode para o Drizzle Kit.

Você pode encontrar essas connection strings no dashboard do Supabase em **Settings > Database > Connection string**.

### Comandos do Banco de Dados

```bash
# Fazer push do schema para o banco
npm run db:push

# Abrir Drizzle Studio
npm run db:studio
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
