import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Globe, Server, Calendar, AlertTriangle } from 'lucide-react'
import { Domain, Hosting, Client } from '@/types'
import { differenceInDays, format } from 'date-fns'

interface ServicesViewProps {
  domains: Domain[]
  hosting: Hosting[]
  clients: Client[]
  onAddDomain: () => void
  onAddHosting: () => void
}

export function ServicesView({ 
  domains, 
  hosting, 
  clients, 
  onAddDomain, 
  onAddHosting 
}: ServicesViewProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const getClientName = (client_id: string) => {
    const client = clients.find(c => c.id === client_id)
    return client?.name || 'Unknown Client'
  }

  const getExpirationStatus = (expirationDate: string) => {
    const daysUntilExpiration = differenceInDays(new Date(expirationDate), new Date())
    
    if (daysUntilExpiration < 0) {
      return { status: 'expired', color: 'destructive', text: 'Expired' }
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring', color: 'warning', text: `${daysUntilExpiration} days left` }
    } else {
      return { status: 'active', color: 'secondary', text: 'Active' }
    }
  }

  const filteredDomains = domains.filter(domain =>
    domain.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(domain.client_id).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredHosting = hosting.filter(host =>
    host.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(host.client_id).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domains & Hosting</h1>
          <p className="text-muted-foreground">
            Manage domain registrations and hosting services
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search domains and hosting services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="domains" className="space-y-4">
        <TabsList>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Domains ({domains.length})
          </TabsTrigger>
          <TabsTrigger value="hosting" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Hosting ({hosting.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={onAddDomain}>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDomains.map((domain) => {
              const expiration = getExpirationStatus(domain.expiration_date)
              return (
                <Card key={domain.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {domain.domain_name}
                        </CardTitle>
                        <CardDescription>
                          {getClientName(domain.client_id)}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={expiration.color as any}
                        className={expiration.status === 'expiring' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}
                      >
                        {expiration.status === 'expiring' && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {expiration.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {domain.registrar && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Registrar:</span> {domain.registrar}
                      </div>
                    )}
                    {domain.dns_provider && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">DNS:</span> {domain.dns_provider}
                      </div>
                    )}
                    <div className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Expires:</span>
                      {format(new Date(domain.expiration_date), 'MMM dd, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredDomains.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No domains found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? "Try adjusting your search term" 
                      : "Get started by adding your first domain"
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={onAddDomain} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Domain
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hosting" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={onAddHosting}>
              <Plus className="mr-2 h-4 w-4" />
              Add Hosting
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHosting.map((host) => {
              const expiration = getExpirationStatus(host.expiration_date)
              return (
                <Card key={host.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          {host.service_name}
                        </CardTitle>
                        <CardDescription>
                          {getClientName(host.client_id)}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={expiration.color as any}
                        className={expiration.status === 'expiring' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}
                      >
                        {expiration.status === 'expiring' && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {expiration.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {host.provider && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Provider:</span> {host.provider}
                      </div>
                    )}
                    {host.plan_type && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Plan:</span> {host.plan_type}
                      </div>
                    )}
                    <div className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Expires:</span>
                      {format(new Date(host.expiration_date), 'MMM dd, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredHosting.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No hosting services found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? "Try adjusting your search term" 
                      : "Get started by adding your first hosting service"
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={onAddHosting} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Hosting
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}