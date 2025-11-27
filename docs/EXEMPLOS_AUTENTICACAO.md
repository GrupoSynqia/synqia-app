# Exemplos de Uso de Autenticação

Este documento fornece exemplos práticos de como usar autenticação em diferentes partes da aplicação.

## 📦 Importações

```typescript
// Para Server Components e Server Actions
import { createClient } from "@/lib/supabase/server";

// Para Client Components
import { createClient } from "@/lib/supabase/client";

// Para Middleware (já configurado)
import { updateSession } from "@/lib/supabase/middleware";
```

## 1. Server Components

### Obter Usuário Atual

```tsx
// app/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div>
      <h1>Perfil</h1>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}
```

### Consultar Dados com RLS

```tsx
// app/posts/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function PostsPage() {
  const supabase = await createClient();

  // Row Level Security (RLS) aplicado automaticamente
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Erro ao carregar posts</div>;
  }

  return (
    <div>
      <h1>Meus Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

## 2. Server Actions

### Criar Post

```tsx
// app/posts/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const { error } = await supabase.from("posts").insert({
    title,
    content,
    user_id: user.id,
  });

  if (error) {
    redirect(`/posts/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/posts");
  redirect("/posts");
}
```

### Atualizar Perfil

```tsx
// app/profile/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const full_name = formData.get("full_name") as string;
  const avatar_url = formData.get("avatar_url") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, avatar_url })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
```

## 3. Client Components

### Hook de Autenticação

```tsx
// app/components/UserAvatar.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function UserAvatar() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Obter usuário inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!user) {
    return <div>Não autenticado</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src={user.user_metadata.avatar_url || "/default-avatar.png"}
        alt={user.email}
        className="h-8 w-8 rounded-full"
      />
      <span>{user.email}</span>
    </div>
  );
}
```

### Formulário Interativo

```tsx
// app/posts/new/PostForm.tsx
"use client";

import { createPost } from "../actions";
import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-white"
    >
      {pending ? "Criando..." : "Criar Post"}
    </button>
  );
}

export function PostForm() {
  return (
    <form action={createPost} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium">
          Conteúdo
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
```

### Realtime Subscription

```tsx
// app/components/LivePosts.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function LivePosts({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPosts((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setPosts((prev) =>
              prev.filter((post) => post.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === payload.new.id ? payload.new : post
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

## 4. Middleware Personalizado

### Adicionar Lógica Personalizada

```typescript
// src/lib/supabase/middleware.ts (adicionar ao existente)
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Lógica personalizada: verificar role do usuário
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Redirecionar admin para painel admin
    if (
      profile?.role === "admin" &&
      request.nextUrl.pathname === "/dashboard"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  const url = request.nextUrl.clone();
  const isAuthRoute = url.pathname.startsWith("/auth/");
  const isProtectedRoute = url.pathname.startsWith("/dashboard");
  const isAdminRoute = url.pathname.startsWith("/admin");

  // Proteger rotas de admin
  if (isAdminRoute && (!user || profile?.role !== "admin")) {
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute && !user) {
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

## 5. API Routes (Route Handlers)

### GET com Autenticação

```typescript
// app/api/profile/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}
```

### POST com Validação

```typescript
// app/api/posts/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();

  const result = postSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: result.error.issues },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("posts").insert({
    ...result.data,
    user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
```

## 🎯 Resumo

- **Server Components**: Use para renderização inicial e dados estáticos
- **Server Actions**: Use para mutações de dados (criar, atualizar, deletar)
- **Client Components**: Use para interatividade e atualizações em tempo real
- **Middleware**: Use para proteção de rotas e lógica global
- **Route Handlers**: Use para APIs públicas ou webhooks

## 🔒 Boas Práticas

1. **Sempre validar autenticação no servidor** - Client Components podem ser manipulados
2. **Use RLS (Row Level Security)** - Adicione uma camada extra de segurança no banco
3. **Revalidate após mutações** - Use `revalidatePath()` para atualizar cache
4. **Trate erros apropriadamente** - Redirecione ou mostre mensagens claras
5. **Use TypeScript** - Defina tipos para User, Session e dados do banco
