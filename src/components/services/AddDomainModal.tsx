import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Domain, Client } from '@/types'

interface AddDomainModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (domain: Omit<Domain, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  clients: Client[]
  editingDomain?: Domain | null
}

export function AddDomainModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  clients,
  editingDomain 
}: AddDomainModalProps) {
  const [formData, setFormData] = useState({
    client_id: editingDomain?.client_id || '',
    domain_name: editingDomain?.domain_name || '',
    registrar: editingDomain?.registrar || '',
    expiration_date: editingDomain?.expiration_date || '',
    dns_provider: editingDomain?.dns_provider || '',
    status: editingDomain?.status || 'active' as const,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client_id || !formData.domain_name.trim() || !formData.expiration_date) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({ 
        client_id: '', 
        domain_name: '', 
        registrar: '', 
        expiration_date: '', 
        dns_provider: '', 
        status: 'active' 
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting domain:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingDomain ? 'Edit Domain' : 'Add New Domain'}
          </DialogTitle>
          <DialogDescription>
            {editingDomain 
              ? 'Update the domain information below.'
              : 'Enter the domain details to add it to a client.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domainName">Domain Name *</Label>
              <Input
                id="domainName"
                value={formData.domain_name}
                onChange={(e) => handleChange('domain_name', e.target.value)}
                placeholder="example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="registrar">Registrar</Label>
              <Input
                id="registrar"
                value={formData.registrar}
                onChange={(e) => handleChange('registrar', e.target.value)}
                placeholder="GoDaddy, Namecheap, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expirationDate">Expiration Date *</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => handleChange('expiration_date', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dnsProvider">DNS Provider</Label>
              <Input
                id="dnsProvider"
                value={formData.dns_provider}
                onChange={(e) => handleChange('dns_provider', e.target.value)}
                placeholder="Cloudflare, Google DNS, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingDomain ? 'Update Domain' : 'Add Domain'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}