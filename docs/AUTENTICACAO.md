# Implementação de Autenticação com Cookies HTTP-Only

Este projeto implementa autenticação segura com Supabase usando **cookies HTTP-Only**, oferecendo proteção contra ataques XSS (Cross-Site Scripting).

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   ├── auth/
│   │   ├── sign-in/
│   │   │   ├── page.tsx          # Página de login
│   │   │   └── actions.ts        # Server Action de login
│   │   ├── sign-up/
│   │   │   ├── page.tsx          # Página de cadastro
│   │   │   └── actions.ts        # Server Action de cadastro
│   │   └── actions.ts            # Server Action de logout
│   └── (app)/
│       └── dashboard/
│           └── page.tsx          # Dashboard protegido
├── lib/
│   └── supabase/
│       ├── server.ts             # Cliente Supabase para Server Components/Actions
│       ├── client.ts             # Cliente Supabase para Client Components
│       └── middleware.ts         # Cliente Supabase para Middleware
└── middleware.ts                 # Middleware do Next.js para proteção de rotas
```

## 🔐 Por que Cookies HTTP-Only?

| Abordagem             | Vantagens                                                                                    | Desvantagens                                          |
| --------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Cookies HTTP-Only** | ✅ Imune a XSS<br>✅ Funciona com Middleware<br>✅ Gerenciado automaticamente pelo navegador | ❌ Requer configuração server-side                    |
| **localStorage**      | ✅ Fácil de usar no cliente                                                                  | ❌ Vulnerável a XSS<br>❌ Não funciona com Middleware |

## 🚀 Como Funciona

### 1. Login/Cadastro (Server Actions)

As páginas de autenticação usam **Server Actions** que:

1. Recebem os dados do formulário
2. Autenticam com Supabase
3. Supabase automaticamente define cookies HTTP-Only
4. Redirecionam para o dashboard ou mostram erro

```typescript
// src/app/auth/sign-in/actions.ts
export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
```

### 2. Middleware (Proteção de Rotas)

O middleware intercepta todas as requisições e:

1. Lê os cookies HTTP-Only automaticamente
2. Valida a sessão do usuário
3. Redireciona usuários não autenticados para login
4. Redireciona usuários autenticados do login para dashboard

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

### 3. Server Components (Leitura de Sessão)

Server Components podem ler a sessão diretamente:

```typescript
// src/app/(app)/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return <div>Bem-vindo, {user.email}</div>;
}
```

### 4. Client Components (Interatividade)

Para Client Components que precisam de interatividade:

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function UserProfile() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return <div>{user?.email}</div>;
}
```

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Configurar o Supabase

No painel do Supabase:

1. Vá em Authentication > URL Configuration
2. Adicione suas URLs permitidas:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

## 📝 Uso

### Login

Usuários acessam `/auth/sign-in` e fazem login. Após autenticação bem-sucedida:

- Cookie HTTP-Only é definido automaticamente
- Usuário é redirecionado para `/dashboard`
- Middleware protege rotas automaticamente

### Logout

No dashboard, um formulário chama a Server Action de logout:

```tsx
<form action={signOut}>
  <button type="submit">Sair</button>
</form>
```

### Proteção de Rotas

O middleware protege automaticamente:

- `/dashboard/*` - Requer autenticação
- `/auth/sign-in` e `/auth/sign-up` - Redireciona se autenticado

## 🛡️ Segurança

### Cookies HTTP-Only

Os tokens de acesso são armazenados em cookies com:

- `HttpOnly`: JavaScript não pode acessar
- `Secure`: Apenas HTTPS (produção)
- `SameSite`: Proteção contra CSRF

### Validação Server-Side

Toda validação de autenticação acontece no servidor:

- Middleware valida antes de cada requisição
- Server Components validam antes de renderizar
- Server Actions validam antes de executar

## 🎨 UI/UX

As páginas de autenticação incluem:

- Design moderno e responsivo com Tailwind CSS
- Tratamento de erros via URL params
- Links de navegação entre login e cadastro
- Validação de formulários HTML5
- Estados de foco acessíveis

## 📚 Referências

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
