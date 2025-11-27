"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile } from "@/actions/profile/update-profile";
import { deleteProfile } from "@/actions/profile/delete-profile";
import { signOut } from "@/actions/authentication/sign-out";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPhoneNumber } from "@/helpers/phone";

// Schema de validação para o formulário
const profileFormSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  university: z.string().optional().nullable(),
  period: z.string().optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

type SettingsClientProps = {
  profile: {
    id: string;
    email: string;
    name: string;
    phone: string;
    birth_date: string; // formato YYYY-MM-DD
    city: string | null;
    state: string | null;
    university: string | null;
    period: string | null;
  };
  userEmail: string;
};

export function SettingsClient({ profile, userEmail }: SettingsClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: profile.email,
      name: profile.name,
      phone: formatPhoneNumber(profile.phone),
      birth_date: profile.birth_date,
      city: profile.city || "",
      state: profile.state || "",
      university: profile.university || "",
      period: profile.period || "",
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await updateProfile(data);

      if (result.success) {
        setSuccessMessage("Perfil atualizado com sucesso!");
        // Resetar mensagem após 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || "Erro ao atualizar perfil");
      }
    } catch {
      setErrorMessage("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const result = await deleteProfile();

      if (!result.success) {
        setErrorMessage(result.error || "Erro ao excluir conta");
        setIsDeleting(false);
      }
      // Se sucesso, a action já redireciona, então não precisamos fazer nada aqui
    } catch {
      setErrorMessage("Erro ao excluir conta. Tente novamente.");
      setIsDeleting(false);
    }
  }

  const isConfirmationValid = confirmationText === profile.name;

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-card text-card-foreground shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Configurações
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Bem-vindo, <span className="font-medium">{userEmail}</span>
                </p>
              </div>
              <form action={signOut} className="mt-4 sm:ml-6 sm:mt-0">
                <Button type="submit" variant="destructive">
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Formulário de Perfil */}
        <div className="mt-8 bg-card text-card-foreground shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium">Informações do Perfil</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize suas informações pessoais abaixo.
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
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            disabled
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="name"
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

                  {/* Telefone */}
                  <FormField
                    control={form.control}
                    name="phone"
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

                  {/* Data de Nascimento */}
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          <Input
                            type="text"
                            placeholder="Sua cidade"
                            {...field}
                            value={field.value || ""}
                          />
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
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Seu estado"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Universidade */}
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Universidade</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Sua universidade"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Período */}
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Seu período"
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

        {/* Seção de Exclusão de Conta */}
        <div className="mt-8 bg-card text-card-foreground shadow sm:rounded-lg border border-destructive/20">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-destructive">
              Zona Perigosa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Excluir sua conta é uma ação permanente e irreversível. Todos os
              seus dados serão removidos permanentemente.
            </p>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-4"
                  onClick={() => {
                    setConfirmationText("");
                    setErrorMessage(null);
                  }}
                >
                  Excluir Conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir Conta</DialogTitle>
                  <DialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente sua conta e todos os seus dados.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">
                      Atenção: Esta ação é irreversível!
                    </p>
                    <p className="text-sm text-destructive/90 mt-1">
                      Todos os seus dados, correções, transações e assinaturas
                      serão permanentemente excluídos.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="confirmation-input"
                      className="text-sm font-medium"
                    >
                      Para confirmar, digite seu nome completo exatamente como
                      está no cadastro:
                    </label>
                    <Input
                      id="confirmation-input"
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={profile.name}
                      className="mt-2"
                      disabled={isDeleting}
                    />
                    {confirmationText && !isConfirmationValid && (
                      <p className="text-sm text-destructive mt-2">
                        O nome digitado não corresponde ao nome do cadastro.
                      </p>
                    )}
                  </div>
                  {errorMessage && (
                    <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                      <p className="text-sm text-destructive">{errorMessage}</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setConfirmationText("");
                      setErrorMessage(null);
                    }}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={!isConfirmationValid || isDeleting}
                  >
                    {isDeleting
                      ? "Excluindo..."
                      : "Excluir Conta Permanentemente"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
