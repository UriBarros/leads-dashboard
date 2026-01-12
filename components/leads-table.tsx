"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChevronLeft, ChevronRight, Lock, Unlock, Filter, MessageCircle } from "lucide-react"
import { getClientes, updateClienteStatus, type Cliente } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const ITEMS_PER_PAGE = 15

export function LeadsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showFollowUpFilter, setShowFollowUpFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadClientes = async () => {
      setLoading(true)
      try {
        const data = await getClientes()
        if (data.length > 0) setClientes(data)
      } catch (error) { console.error(error) } 
      finally { setLoading(false) }
  }
  useEffect(() => { loadClientes() }, [])

  const filteredClientes = showFollowUpFilter ? clientes.filter((cliente) => cliente.follow_up >= 1) : clientes
  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentClientes = filteredClientes.slice(startIndex, endIndex)

  const handleToggleConversation = async (clienteId: number, clienteName: string | null) => {
    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) return
    const newTravaStatus = !cliente.trava
    const success = await updateClienteStatus(clienteId, newTravaStatus)
    if (success) {
      setClientes((prev) => prev.map((c) => (c.id === clienteId ? { ...c, trava: newTravaStatus } : c)))
      toast({ title: "Status atualizado", description: `Conversa ${newTravaStatus ? "pausada" : "retomada"}.` })
    }
  }

  const toggleFollowUpFilter = () => { setShowFollowUpFilter(!showFollowUpFilter); setCurrentPage(1) }
  const clearFilter = () => { setShowFollowUpFilter(false); setCurrentPage(1) }

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Leads Recentes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Gerencie seus contatos e status de automação.</p>
            </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showFollowUpFilter ? "secondary" : "outline"}
              size="sm"
              onClick={showFollowUpFilter ? clearFilter : toggleFollowUpFilter}
              className="text-xs font-medium"
            >
              <Filter className="h-3.5 w-3.5 mr-2" />
              {showFollowUpFilter ? "Limpar Filtros" : "Filtrar por Follow-up"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
             <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <TableHead className="w-[200px] font-medium text-xs uppercase tracking-wider text-gray-500">Nome</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-gray-500">Contato</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-gray-500">Status</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-gray-500">Interesse</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-gray-500">Produto</TableHead>
                    {/* NOVA COLUNA ADICIONADA AQUI: */}
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-gray-500">Follow Up</TableHead>
                    <TableHead className="text-right font-medium text-xs uppercase tracking-wider text-gray-500">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentClientes.map((cliente) => (
                    <TableRow key={cliente.id} className="border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <TableCell className="font-medium text-gray-900">{cliente.nome || "—"}</TableCell>
                      <TableCell className="text-gray-600 font-mono text-xs">
                         {cliente.telefone || "—"}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            !cliente.trava 
                            ? "bg-green-50 text-green-700 border border-green-100" 
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${!cliente.trava ? "bg-green-500" : "bg-amber-500"}`}></span>
                            {!cliente.trava ? "Ativo" : "Pausado"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cliente.interessado ? "default" : "secondary"} className={`font-normal ${cliente.interessado ? "bg-primary/90 hover:bg-primary" : "text-gray-500 bg-gray-100 hover:bg-gray-200"}`}>
                          {cliente.interessado ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm max-w-[150px] truncate">
                          {cliente.produto_interesse || "—"}
                      </TableCell>
                      
                      {/* NOVA CÉLULA ADICIONADA AQUI: */}
                      <TableCell className="text-gray-600 text-sm">
                          {cliente.follow_up || 0}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50"
                            onClick={() => {
                              const phoneNumber = cliente.telefone?.replace(/\D/g, "")
                              if (phoneNumber) window.open(`https://wa.me/55${phoneNumber}`, "_blank")
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                {cliente.trava ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-none shadow-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Alterar status da automação?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso irá {cliente.trava ? "reativar" : "pausar"} o bot para {cliente.nome}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-none shadow-none hover:bg-gray-100">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleToggleConversation(cliente.id, cliente.nome)} className="bg-primary hover:bg-primary/90">
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
              <div className="text-xs text-muted-foreground">
                 {startIndex + 1}-{Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}