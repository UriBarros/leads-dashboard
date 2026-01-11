"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, MessageSquareCode as MessageSquareCheck, Clock, MessageSquareX, Phone, TrendingUp } from "lucide-react"
import { getClientes, type Cliente } from "@/lib/supabase"

// ... (manter a função calculateMetrics igual) ...
const calculateMetrics = (clientes: Cliente[]) => {
  const totalLeads = clientes.length
  const interestedLeads = clientes.filter((cliente) => cliente.interessado).length
  const leadsLast7Days = clientes.filter((cliente) => {
    const clienteDate = new Date(cliente.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return clienteDate >= sevenDaysAgo
  }).length
  const conversasTravadas = clientes.filter((cliente) => cliente.trava).length

  return { totalLeads, interestedLeads, leadsLast7Days, conversasTravadas }
}

export function DashboardMetrics() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)

  const loadClientes = async () => {
    setLoading(true)
    try {
      const data = await getClientes()
      if (data.length > 0) setClientes(data)
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClientes() }, [])
  const metrics = calculateMetrics(clientes)

  // Componente de Card Reutilizável para manter a consistência
  const MetricCard = ({ title, value, icon: Icon, description, colorClass }: any) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
           <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{loading ? "..." : value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Visão Geral</h2>
        <p className="text-sm text-muted-foreground">Métricas de desempenho do atendimento.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total de Leads" 
          value={metrics.totalLeads.toLocaleString()} 
          icon={Phone} 
          description="Base total de contatos"
          colorClass="text-zinc-600" // Cor neutra para total
        />
        
        <MetricCard 
          title="Interessados" 
          value={metrics.interestedLeads} 
          icon={MessageSquareCheck} 
          description="Leads qualificados"
          colorClass="text-emerald-600" // Verde mais elegante
        />

        <MetricCard 
          title="Novos (7 dias)" 
          value={metrics.leadsLast7Days} 
          icon={Clock} 
          description="Entrantes recentes"
          colorClass="text-blue-600"
        />

        <MetricCard 
          title="Pausados" 
          value={metrics.conversasTravadas} 
          icon={MessageSquareX} 
          description="Requer atenção manual"
          colorClass="text-amber-600" // Laranja/Amber ao invés de vermelho agressivo
        />
      </div>
    </div>
  )
}