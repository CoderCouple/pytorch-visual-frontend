"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES, OPERATIONS } from "@/lib/operations-registry";

function HeaderBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const items: { label: string; href?: string }[] = [];

  if (segments[0] === "pytorch") {
    items.push({ label: "PyTorch", href: "/pytorch" });

    if (segments[1]) {
      const cat = CATEGORIES.find((c) => c.slug === segments[1]);
      if (cat) items.push({ label: cat.name, href: "/pytorch" });
    }
    if (segments[2]) {
      const op = OPERATIONS.find(
        (o) => o.id === segments[2] && o.categorySlug === segments[1]
      );
      if (op) items.push({ label: op.name });
    }
  } else if (segments[0] === "numpy") {
    items.push({ label: "NumPy" });
  } else if (segments[0] === "nn-from-scratch") {
    items.push({ label: "Neural Network from Scratch" });
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <HeaderBreadcrumb />
      <div className="ml-auto">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </button>
      </div>
    </header>
  );
}
