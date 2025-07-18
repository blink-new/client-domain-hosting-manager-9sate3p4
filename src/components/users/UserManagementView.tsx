import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Plus, Search, Shield, User, Crown } from 'lucide-react'
import { AppUser } from '@/types'

interface UserManagementViewProps {
  users: AppUser[]
  currentUser: any
  onAddUser: () => void
  onUpdateUserRole: (userId: string, role: 'admin' | 'standard') => void
}

export function UserManagementView({ 
  users, 
  currentUser,
  onAddUser, 
  onUpdateUserRole 
}: UserManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentUserRole = users.find(u => u.user_id === currentUser?.id)?.role || 'standard'
  const isCurrentUserAdmin = currentUserRole === 'admin'

  const handleRoleToggle = (user: AppUser) => {
    if (!isCurrentUserAdmin || user.user_id === currentUser?.id) return
    
    const newRole = user.role === 'admin' ? 'standard' : 'admin'
    onUpdateUserRole(user.user_id, newRole)
  }

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Crown : User
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions for the application
          </p>
        </div>
        {isCurrentUserAdmin && (
          <Button onClick={onAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {!isCurrentUserAdmin && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Shield className="h-5 w-5" />
              Limited Access
            </CardTitle>
            <CardDescription className="text-amber-700">
              You have standard user permissions. Contact an administrator to modify user roles.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => {
          const RoleIcon = getRoleIcon(user.role)
          const isCurrentUser = user.user_id === currentUser?.id
          
          return (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RoleIcon className="h-4 w-4" />
                      {user.name || 'Unnamed User'}
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role === 'admin' ? 'Admin' : 'Standard'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Added {new Date(user.created_at).toLocaleDateString()}
                </div>
                
                {isCurrentUserAdmin && !isCurrentUser && (
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Switch
                      id={`role-${user.id}`}
                      checked={user.role === 'admin'}
                      onCheckedChange={() => handleRoleToggle(user)}
                    />
                    <Label htmlFor={`role-${user.id}`} className="text-sm">
                      Administrator privileges
                    </Label>
                  </div>
                )}
                
                {isCurrentUser && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    You cannot modify your own role
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <User className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search term" 
                  : "No users have been added to the system yet"
                }
              </p>
              {!searchTerm && isCurrentUserAdmin && (
                <Button onClick={onAddUser} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First User
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding the different user roles and their capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Administrator</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Full access to all features</li>
                <li>• Can add, edit, and delete clients</li>
                <li>• Can manage domains and hosting</li>
                <li>• Can manage user roles</li>
                <li>• Can export data</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Standard User</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• View-only access to clients</li>
                <li>• View domains and hosting</li>
                <li>• Cannot modify data</li>
                <li>• Cannot manage users</li>
                <li>• Limited export capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}