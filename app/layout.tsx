import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

const geistSans = GeistSans.variable
const geistMono = GeistMono.variable

export const metadata: Metadata = {
  title: "Agencia Whatsapp",
  description: "Acompanhe automação dos leads",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Removi a classe "dark" para ativar o modo light padrão
    // Adicionei bg-gray-50/50 para um fundo muito sutil, menos cansativo que o branco puro
    <html lang="pt-BR" className={`${geistSans} ${geistMono} antialiased`}>
      <body className="bg-gray-50/50">{children}</body>
    </html>
  )
}