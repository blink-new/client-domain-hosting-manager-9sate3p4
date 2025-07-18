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
import { Hosting, Client } from '@/types'

interface AddHostingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (hosting: Omit<Hosting, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  clients: Client[]
  editingHosting?: Hosting | null
}

export function AddHostingModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  clients,
  editingHosting 
}: AddHostingModalProps) {
  const [formData, setFormData] = useState({
    client_id: editingHosting?.client_id || '',
    service_name: editingHosting?.service_name || '',
    provider: editingHosting?.provider || '',
    plan_type: editingHosting?.plan_type || '',
    expiration_date: editingHosting?.expiration_date || '',
    status: editingHosting?.status || 'active' as const,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client_id || !formData.service_name.trim() || !formData.expiration_date) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({ 
        client_id: '', 
        service_name: '', 
        provider: '', 
        plan_type: '', 
        expiration_date: '', 
        status: 'active' 
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting hosting:', error)
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
            {editingHosting ? 'Edit Hosting Service' : 'Add New Hosting Service'}
          </DialogTitle>
          <DialogDescription>
            {editingHosting 
              ? 'Update the hosting service information below.'
              : 'Enter the hosting service details to add it to a client.'
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
              <Label htmlFor="serviceName">Service Name *</Label>
              <Input
                id="serviceName"
                value={formData.service_name}
                onChange={(e) => handleChange('service_name', e.target.value)}
                placeholder="Business Hosting, WordPress Hosting, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
                placeholder="DigitalOcean, AWS, WP Engine, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="planType">Plan Type</Label>
              <Input
                id="planType"
                value={formData.plan_type}
                onChange={(e) => handleChange('plan_type', e.target.value)}
                placeholder="Droplet - 2GB, Professional, etc."
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
              {isSubmitting ? 'Saving...' : editingHosting ? 'Update Hosting' : 'Add Hosting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}