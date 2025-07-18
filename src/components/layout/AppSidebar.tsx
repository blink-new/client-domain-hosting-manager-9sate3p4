import { Home, Users, Globe, Settings, UserCog } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const items = [
  {
    title: 'Dashboard',
    url: '#dashboard',
    icon: Home,
  },
  {
    title: 'Clients',
    url: '#clients',
    icon: Users,
  },
  {
    title: 'Domains & Hosting',
    url: '#services',
    icon: Globe,
  },
  {
    title: 'User Management',
    url: '#users',
    icon: UserCog,
  },
  {
    title: 'Settings',
    url: '#settings',
    icon: Settings,
  },
]

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Client Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.url.replace('#', '')}
                  >
                    <button
                      onClick={() => onViewChange(item.url.replace('#', ''))}
                      className="w-full"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}