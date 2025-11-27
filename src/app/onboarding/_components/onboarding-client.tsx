"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { completeOnboarding } from "@/actions/onboarding/complete-onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatPhoneNumber } from "@/helpers/phone";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Schema de validação para o formulário
const onboardingFormSchema = z.object({
  // Dados do perfil
  profileName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  profilePhone: z.string().min(1, "Telefone é obrigatório"),
});

type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

type OnboardingClientProps = {
  userEmail: string;
};

export function OnboardingClient({ userEmail }: OnboardingClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      profileName: "",
      profilePhone: "",
    },
  });

  async function onSubmit(data: OnboardingFormData) {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await completeOnboarding({
        profileName: data.profileName,
        profilePhone: data.profilePhone,
      });

      if (result.success) {
        setSuccessMessage("Perfil criado com sucesso! Redirecionando...");
        // Redirecionar para o dashboard após 1 segundo
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setErrorMessage(result.error || "Erro ao completar onboarding");
      }
    } catch {
      setErrorMessage("Erro ao completar onboarding. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary border-secondary px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-card text-card-foreground shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/LogoVerticalWhite.png"
                alt="Logo"
                width={200}
                height={200}
                className="mb-4"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Complete seu cadastro
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Bem-vindo, <span className="font-medium">{userEmail}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Preencha os dados abaixo para finalizar sua conta.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Onboarding */}
        <div className="mt-8 bg-card text-card-foreground shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium">Informações Pessoais</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha suas informações pessoais.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6 space-y-6"
              >
                {/* Mensagens de sucesso/erro */}
                {successMessage && (
                  <div className="rounded-md bg-primary/10 p-4 border border-primary/20">
                    <p className="text-sm text-primary">{successMessage}</p>
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  </div>
                )}

                {/* Seção de Perfil */}
                <div className="space-y-6">
                  <h3 className="text-md font-semibold border-b pb-2">
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Nome do Perfil */}
                    <FormField
                      control={form.control}
                      name="profileName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Seu nome completo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Telefone do Perfil */}
                    <FormField
                      control={form.control}
                      name="profilePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(00) 00000-0000"
                              {...field}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(
                                  e.target.value
                                );
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Finalizar cadastro"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
