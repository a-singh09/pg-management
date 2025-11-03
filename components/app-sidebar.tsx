"use client";

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
  LogOut,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authService, User as UserType } from "@/lib/auth";

export function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

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
  ];

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
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.name}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 space-y-4">
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.userType === "tenant"
                  ? `Tenant (${user.tenantCode})`
                  : "Owner"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PG Manager
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
