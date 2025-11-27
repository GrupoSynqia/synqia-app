"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateEnterprise } from "@/actions/enterprise/update-enterprise";
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
import { toast } from "sonner";
import Image from "next/image";

// Schema de validação para o formulário
const enterpriseFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cep: z
    .string()
    .min(8, "CEP deve ter 8 dígitos")
    .max(8, "CEP deve ter 8 dígitos"),
  address: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional().nullable(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z
    .string()
    .min(2, "Estado é obrigatório")
    .max(2, "Estado deve ter 2 caracteres"),
  instagram_url: z
    .string()
    .url("URL inválida")
    .optional()
    .nullable()
    .or(z.literal("")),
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  register: z.string().min(1, "Registro é obrigatório"),
});

type EnterpriseFormData = z.infer<typeof enterpriseFormSchema>;

type EnterpriseClientProps = {
  enterprise: {
    id: string;
    name: string;
    cep: string;
    address: string;
    number: string;
    complement: string | null;
    city: string;
    state: string;
    instagram_url: string | null;
    phoneNumber: string;
    register: string;
  };
};

export function EnterpriseClient({ enterprise }: EnterpriseClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<EnterpriseFormData>({
    resolver: zodResolver(enterpriseFormSchema),
    defaultValues: {
      name: enterprise.name,
      cep: enterprise.cep,
      address: enterprise.address,
      number: enterprise.number,
      complement: enterprise.complement || "",
      city: enterprise.city,
      state: enterprise.state,
      instagram_url: enterprise.instagram_url || "",
      phoneNumber: formatPhoneNumber(enterprise.phoneNumber),
      register: enterprise.register,
    },
  });

  async function onSubmit(data: EnterpriseFormData) {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await updateEnterprise({
        id: enterprise.id,
        ...data,
      });

      if (result.success) {
        setSuccessMessage("Empresa atualizada com sucesso!");
        // Resetar mensagem após 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || "Erro ao atualizar empresa");
      }
    } catch {
      setErrorMessage("Erro ao atualizar empresa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
      toast.success("Empresa atualizada com sucesso!");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-card text-card-foreground shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Configurações da Empresa
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Atualize as informações da empresa.
              </p>
            </div>
            <Image
              src={"/LogoVerticalWhite.png"}
              alt="Logo da empresa"
              width={100}
              height={100}
              className="w-24 h-24 object-contain rounded-md shrink-0"
            />
          </div>
        </div>

        {/* Formulário de Empresa */}
        <div className="mt-8 bg-card text-card-foreground shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium">Informações da Empresa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize as informações da empresa abaixo.
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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Nome da empresa"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Registro */}
                  <FormField
                    control={form.control}
                    name="register"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registro (CNPJ)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="00.000.000/0000-00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CEP */}
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="00000-000"
                            maxLength={8}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Endereço */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Rua, Avenida, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Número */}
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Complemento */}
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Apto, Sala, etc."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cidade */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Estado */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado (UF)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="SP"
                            maxLength={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Telefone */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(00) 00000-0000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Instagram URL */}
                  <FormField
                    control={form.control}
                    name="instagram_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Instagram</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://instagram.com/empresa"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar alterações"}
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
