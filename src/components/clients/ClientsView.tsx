import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Client } from '@/types'

interface ClientsViewProps {
  clients: Client[]
  onAddClient: () => void
  onEditClient: (client: Client) => void
  onDeleteClient: (clientId: string) => void
  onExportData: () => void
}

export function ClientsView({ 
  clients, 
  onAddClient, 
  onEditClient, 
  onDeleteClient, 
  onExportData 
}: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCompany, setFilterCompany] = useState('')

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompany = !filterCompany || 
                          (client.company?.toLowerCase().includes(filterCompany.toLowerCase()) ?? false)
    return matchesSearch && matchesCompany
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client database and information
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onExportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={onAddClient}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          placeholder="Filter by company..."
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <CardDescription>{client.email}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditClient(client)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteClient(client.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.phone && (
                  <div className="text-sm text-muted-foreground">
                    📞 {client.phone}
                  </div>
                )}
                {client.company && (
                  <Badge variant="secondary">{client.company}</Badge>
                )}
                <div className="text-xs text-muted-foreground">
                  Added {new Date(client.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No clients found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterCompany 
                  ? "Try adjusting your search filters" 
                  : "Get started by adding your first client"
                }
              </p>
              {!searchTerm && !filterCompany && (
                <Button onClick={onAddClient} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Client
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}