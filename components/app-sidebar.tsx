"use client"

import {
  Building,
  Users,
  Bed,
  DollarSign,
  UserCog,
  Receipt,
  BarChart3,
  Calendar,
  Utensils,
  AlertCircle,
  TrendingUp,
  Home,
  Menu,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Properties", href: "/properties", icon: Building },
    { name: "Tenants", href: "/tenants", icon: Users },
    { name: "Bed Availability", href: "/beds", icon: Bed },
    { name: "Staff", href: "/staff", icon: UserCog },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
    { name: "Rent Collection", href: "/rent", icon: Receipt },
    { name: "Bookings", href: "/bookings", icon: Calendar },
    { name: "Food Register", href: "/food", icon: Utensils },
    { name: "Issues", href: "/issues", icon: AlertCircle },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Profit/Loss", href: "/profit-loss", icon: TrendingUp },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-3">
          <Building className="h-6 w-6" />
          <span className="font-semibold text-lg">PG Manager</span>
        </div>
        <div className="md:hidden px-2 py-2">
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} PG Manager</div>
      </SidebarFooter>
    </Sidebar>
  )
}
