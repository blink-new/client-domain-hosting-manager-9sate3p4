import { useState, useEffect, useCallback } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { ClientsView } from '@/components/clients/ClientsView'
import { ServicesView } from '@/components/services/ServicesView'
import { UserManagementView } from '@/components/users/UserManagementView'
import { AuthForm } from '@/components/auth/AuthForm'
import { AddClientModal } from '@/components/clients/AddClientModal'
import { AddDomainModal } from '@/components/services/AddDomainModal'
import { AddHostingModal } from '@/components/services/AddHostingModal'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Toaster } from '@/components/ui/toaster'
import { supabase } from '@/blink/client'
import { Client, Domain, Hosting, AppUser, DashboardStats } from '@/types'
import { differenceInDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const { toast } = useToast()
  
  // Data states
  const [clients, setClients] = useState<Client[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [hosting, setHosting] = useState<Hosting[]>([])
  const [appUsers, setAppUsers] = useState<AppUser[]>([])
  
  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showAddDomainModal, setShowAddDomainModal] = useState(false)
  const [showAddHostingModal, setShowAddHostingModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [editingHosting, setEditingHosting] = useState<Hosting | null>(null)
  
  // Delete confirmation states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: 'client' | 'domain' | 'hosting'
    id: string
    name: string
  }>({ open: false, type: 'client', id: '', name: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Session error:', error)
          // Clear any invalid session data
          await supabase.auth.signOut()
          setUser(null)
        } else {
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          // Clear all data when signed out
          setClients([])
          setDomains([])
          setHosting([])
          setAppUsers([])
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null)
        } else {
          setUser(session?.user || null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load data when user is authenticated
  useEffect(() => {
    if (user?.id) {
      loadAllData()
      initializeUserRole()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const loadAllData = useCallback(async () => {
    if (!user?.id) return
    
    try {
      await Promise.all([
        loadClients(),
        loadDomains(),
        loadHosting(),
        loadAppUsers()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive"
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, toast])

  const loadClients = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadDomains = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setDomains(data || [])
    } catch (error) {
      console.error('Error loading domains:', error)
    }
  }

  const loadHosting = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('hosting')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setHosting(data || [])
    } catch (error) {
      console.error('Error loading hosting:', error)
    }
  }

  const loadAppUsers = async () => {
    if (!user?.id) return
    
    try {
      // First check if current user exists in app_users table
      const { data: currentUserData, error: userError } = await supabase
        .from('app_users')
        .select('role')
        .eq('user_id', user.id)
        .single()
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking user role:', userError)
        // If there's an error other than "not found", don't proceed
        return
      }
      
      // If user doesn't exist in app_users table, they need to be initialized first
      if (!currentUserData) {
        console.log('User not found in app_users table, will be initialized')
        return
      }
      
      // If user is admin, load all users, otherwise just load their own profile
      if (currentUserData?.role === 'admin') {
        const { data, error } = await supabase
          .from('app_users')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error loading all users:', error)
          return
        }
        setAppUsers(data || [])
      } else {
        // Non-admin users can only see their own profile
        const { data, error } = await supabase
          .from('app_users')
          .select('*')
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Error loading user profile:', error)
          return
        }
        setAppUsers(data || [])
      }
    } catch (error) {
      console.error('Error loading app users:', error)
      // Don't show error toast for this as it's expected for non-admin users
    }
  }

  const initializeUserRole = async () => {
    if (!user?.id) return
    
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('app_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing user:', fetchError)
        return
      }

      if (!existingUser) {
        console.log('Initializing new user role...')
        
        // Check if this is the first user (should be admin)
        const { data: allUsers, error: countError } = await supabase
          .from('app_users')
          .select('id')
        
        if (countError) {
          console.error('Error counting users:', countError)
          return
        }
        
        const role = (allUsers?.length || 0) === 0 ? 'admin' : 'standard'
        
        const { error: insertError } = await supabase
          .from('app_users')
          .insert({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role
          })
        
        if (insertError) {
          console.error('Error inserting user:', insertError)
          toast({
            title: "Warning",
            description: "Could not initialize user profile. Some features may be limited.",
            variant: "destructive"
          })
          return
        }
        
        console.log(`User initialized with role: ${role}`)
        // Reload app users after successful initialization
        setTimeout(() => loadAppUsers(), 500)
      }
    } catch (error) {
      console.error('Error initializing user role:', error)
      toast({
        title: "Warning",
        description: "Could not initialize user profile. Some features may be limited.",
        variant: "destructive"
      })
    }
  }

  const calculateStats = (): DashboardStats => {
    const now = new Date()
    const expiringServices = [...domains, ...hosting].filter(service => {
      const daysUntilExpiration = differenceInDays(new Date(service.expiration_date), now)
      return daysUntilExpiration <= 30 && daysUntilExpiration >= 0
    }).length

    return {
      totalClients: clients.length,
      activeDomains: domains.filter(d => d.status === 'active').length,
      activeHosting: hosting.filter(h => h.status === 'active').length,
      expiringServices
    }
  }

  // Client CRUD operations
  const handleAddClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      setClients(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Client added successfully"
      })
    } catch (error) {
      console.error('Error adding client:', error)
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive"
      })
      throw error
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setShowAddClientModal(true)
  }

  const handleUpdateClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingClient) return

    try {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', editingClient.id)
        .select()
        .single()
      
      if (error) throw error
      
      setClients(prev => prev.map(c => c.id === editingClient.id ? data : c))
      setEditingClient(null)
      toast({
        title: "Success",
        description: "Client updated successfully"
      })
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive"
      })
      throw error
    }
  }

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return

    setDeleteDialog({
      open: true,
      type: 'client',
      id: clientId,
      name: client.name
    })
  }

  const confirmDeleteClient = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', deleteDialog.id)
      
      if (error) throw error
      
      setClients(prev => prev.filter(c => c.id !== deleteDialog.id))
      
      // Also remove associated domains and hosting (handled by CASCADE)
      setDomains(prev => prev.filter(d => d.client_id !== deleteDialog.id))
      setHosting(prev => prev.filter(h => h.client_id !== deleteDialog.id))
      
      toast({
        title: "Success",
        description: "Client deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting client:', error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialog({ open: false, type: 'client', id: '', name: '' })
    }
  }

  // Domain CRUD operations
  const handleAddDomain = async (domainData: Omit<Domain, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('domains')
        .insert({
          ...domainData,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      setDomains(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Domain added successfully"
      })
    } catch (error) {
      console.error('Error adding domain:', error)
      toast({
        title: "Error",
        description: "Failed to add domain",
        variant: "destructive"
      })
      throw error
    }
  }

  // Hosting CRUD operations
  const handleAddHosting = async (hostingData: Omit<Hosting, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('hosting')
        .insert({
          ...hostingData,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      setHosting(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Hosting service added successfully"
      })
    } catch (error) {
      console.error('Error adding hosting:', error)
      toast({
        title: "Error",
        description: "Failed to add hosting service",
        variant: "destructive"
      })
      throw error
    }
  }

  // User role management
  const handleUpdateUserRole = async (userId: string, role: 'admin' | 'standard') => {
    try {
      const userToUpdate = appUsers.find(u => u.user_id === userId)
      if (!userToUpdate) return

      const { data, error } = await supabase
        .from('app_users')
        .update({ role })
        .eq('id', userToUpdate.id)
        .select()
        .single()
      
      if (error) throw error
      
      setAppUsers(prev => prev.map(u => u.id === userToUpdate.id ? data : u))
      toast({
        title: "Success",
        description: `User role updated to ${role}`
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear all state
      setUser(null)
      setClients([])
      setDomains([])
      setHosting([])
      setAppUsers([])
      
      toast({
        title: "Success",
        description: "Signed out successfully"
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      })
    }
  }

  const handleExportData = () => {
    try {
      const csvData = [
        ['Client Name', 'Email', 'Company', 'Phone', 'Created Date'],
        ...clients.map(client => [
          client.name,
          client.email,
          client.company || '',
          client.phone || '',
          new Date(client.created_at).toLocaleDateString()
        ])
      ]

      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Data exported successfully"
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      })
    }
  }

  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard'
      case 'clients': return 'Clients'
      case 'services': return 'Domains & Hosting'
      case 'users': return 'User Management'
      case 'settings': return 'Settings'
      default: return 'Dashboard'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {activeView === 'dashboard' && (
            <DashboardView stats={calculateStats()} />
          )}
          {activeView === 'clients' && (
            <ClientsView
              clients={clients}
              onAddClient={() => setShowAddClientModal(true)}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onExportData={handleExportData}
            />
          )}
          {activeView === 'services' && (
            <ServicesView
              domains={domains}
              hosting={hosting}
              clients={clients}
              onAddDomain={() => setShowAddDomainModal(true)}
              onAddHosting={() => setShowAddHostingModal(true)}
            />
          )}
          {activeView === 'users' && (
            <UserManagementView
              users={appUsers}
              currentUser={user}
              onAddUser={() => {/* TODO: Implement add user */}}
              onUpdateUserRole={handleUpdateUserRole}
            />
          )}
          {activeView === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Configure application preferences
                </p>
              </div>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Modals */}
      <AddClientModal
        open={showAddClientModal}
        onOpenChange={(open) => {
          setShowAddClientModal(open)
          if (!open) setEditingClient(null)
        }}
        onSubmit={editingClient ? handleUpdateClient : handleAddClient}
        editingClient={editingClient}
      />

      <AddDomainModal
        open={showAddDomainModal}
        onOpenChange={setShowAddDomainModal}
        onSubmit={handleAddDomain}
        clients={clients}
        editingDomain={editingDomain}
      />

      <AddHostingModal
        open={showAddHostingModal}
        onOpenChange={setShowAddHostingModal}
        onSubmit={handleAddHosting}
        clients={clients}
        editingHosting={editingHosting}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmDeleteClient}
        title={`Delete ${deleteDialog.type}`}
        description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
      <Toaster />
    </SidebarProvider>
  )
}

export default App