"use client";

import { resendVerificationEmail } from "@/actions/authentication/resend-verification";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export function ResendButton({ email }: { email: string }) {
  const handleResend = async () => {
    const formData = new FormData();
    formData.set("email", email);
    await resendVerificationEmail(formData);
    toast.success("E-mail de confirmação reenviado com sucesso");
    redirect("/");
  };

  return (
    <button
      onClick={handleResend}
      className="font-medium text-primary hover:text-primary/80 cursor-pointer"
    >
      Reenviar e-mail de confirmação
    </button>
  );
}
