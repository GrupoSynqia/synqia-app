"use client"

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface ToastHandlerProps {
    error?: string
}

export function ToastHandler({ error }: ToastHandlerProps) {
    const toastShownRef = useRef<string | null>(null)

    useEffect(() => {
        if (error && error !== toastShownRef.current) {
            toastShownRef.current = error

            // Personalize as mensagens de acordo com o erro
            const errorMessages: Record<string, string> = {
                'Invalid login credentials': 'Email ou senha incorretos. Tente novamente.',
                'Email not confirmed': 'Por favor, confirme seu email antes de fazer login.',
                'User not found': 'Usuário não encontrado. Verifique se você está cadastrado.',
                'Invalid password': 'Senha incorreta. Tente novamente.',
            }

            const message = errorMessages[error] || error

            toast.error('Erro ao fazer login:', {
                description: message,
                duration: 5000,
            })
        }
    }, [error])

    return null
}