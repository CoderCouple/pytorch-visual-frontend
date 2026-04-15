"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CATEGORIES, OPERATIONS } from "@/lib/operations-registry";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EE4C2C] text-white font-bold text-sm">
            PT
          </div>
          <span className="font-semibold text-lg">PyTorch Visual</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {CATEGORIES.map((cat) => {
          const ops = OPERATIONS.filter((op) => op.categorySlug === cat.slug);
          return (
            <SidebarGroup key={cat.slug}>
              <SidebarGroupLabel>{cat.name}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ops.map((op) => {
                    const href = `/operations/${cat.slug}/${op.id}`;
                    const isActive = pathname === href;
                    return (
                      <SidebarMenuItem key={op.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          render={<Link href={href} />}
                        >
                          <span className="font-mono text-xs">{op.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
