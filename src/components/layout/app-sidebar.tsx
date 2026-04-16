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
import { NN_CHAPTERS } from "@/lib/nn-registry";

const TRACKS = [
  { title: "Visual PyTorch", href: "/pytorch", emoji: "🔥" },
  { title: "Visual NumPy", href: "/numpy", emoji: "🔢" },
  { title: "NN from Scratch", href: "/nn-from-scratch", emoji: "🧠" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EE4C2C] text-white font-bold text-sm">
            VT
          </div>
          <span className="font-semibold text-lg">Visual Tutorials</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Tracks */}
        <SidebarGroup>
          <SidebarGroupLabel>Tracks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TRACKS.map((track) => {
                const isActive =
                  pathname === track.href || pathname.startsWith(track.href + "/");
                return (
                  <SidebarMenuItem key={track.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={track.href} />}
                    >
                      <span className="mr-1">{track.emoji}</span>
                      <span>{track.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PyTorch operation tree — only on /pytorch pages */}
        {pathname.startsWith("/pytorch") &&
          CATEGORIES.map((cat) => {
            const ops = OPERATIONS.filter((op) => op.categorySlug === cat.slug);
            return (
              <SidebarGroup key={cat.slug}>
                <SidebarGroupLabel>{cat.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {ops.map((op) => {
                      const href = `/pytorch/${cat.slug}/${op.id}`;
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

        {/* NN from Scratch chapters — only on /nn-from-scratch pages */}
        {pathname.startsWith("/nn-from-scratch") && (
          <SidebarGroup>
            <SidebarGroupLabel>Chapters</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NN_CHAPTERS.map((ch) => {
                  const href = `/nn-from-scratch/${ch.id}`;
                  const isActive = pathname === href;
                  return (
                    <SidebarMenuItem key={ch.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={href} />}
                      >
                        <span className="font-mono text-xs">{ch.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
