import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Globe, Server, AlertTriangle } from 'lucide-react'
import { DashboardStats } from '@/types'

interface DashboardViewProps {
  stats: DashboardStats
}

export function DashboardView({ stats }: DashboardViewProps) {
  const cards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      description: 'Active client accounts',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Domains',
      value: stats.activeDomains,
      description: 'Registered domains',
      icon: Globe,
      color: 'text-green-600',
    },
    {
      title: 'Hosting Services',
      value: stats.activeHosting,
      description: 'Active hosting plans',
      icon: Server,
      color: 'text-purple-600',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringServices,
      description: 'Services expiring in 30 days',
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your client domain and hosting management
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.expiringServices > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Expiration Alerts
            </CardTitle>
            <CardDescription className="text-amber-700">
              You have {stats.expiringServices} services expiring within 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="border-amber-300 text-amber-800">
              Action Required
            </Badge>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest client and service updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">New client registered</div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Domain renewal completed</div>
                <div className="text-xs text-muted-foreground">1 day ago</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Hosting plan updated</div>
                <div className="text-xs text-muted-foreground">3 days ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left text-sm hover:bg-gray-50 p-2 rounded">
                Add New Client
              </button>
              <button className="w-full text-left text-sm hover:bg-gray-50 p-2 rounded">
                Register Domain
              </button>
              <button className="w-full text-left text-sm hover:bg-gray-50 p-2 rounded">
                Add Hosting Service
              </button>
              <button className="w-full text-left text-sm hover:bg-gray-50 p-2 rounded">
                Export Data
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}