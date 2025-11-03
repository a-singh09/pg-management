"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Routes that should not show the sidebar
  const noSidebarRoutes = ["/auth"];
  const shouldShowSidebar = !noSidebarRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}
