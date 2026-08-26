"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookCopy, LogOut, Menu, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/books", label: "单词书管理", icon: BookCopy },
  { href: "/admin-users", label: "管理员管理", icon: ShieldCheck },
];

function SidebarContent({ session, onNavigate }: { session: SessionUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("/signin");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-18 items-center border-b border-sidebar-border px-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="后台主导航">
        <p className="mb-2 px-2 pt-2 text-[11px] font-medium uppercase text-muted-foreground">内容与权限</p>
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="size-[18px]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
            {session.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{session.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session.email}</p>
          </div>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={signOut} aria-label="退出登录" className="size-9 shrink-0" />}>
              <LogOut className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="top">退出登录</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children, session }: { children: React.ReactNode; session: SessionUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background md:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border md:block">
        <SidebarContent session={session} />
      </aside>
      <header className="sticky top-0 z-20 flex h-15 items-center border-b bg-background/95 px-4 backdrop-blur md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" aria-label="打开导航菜单" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">后台导航</SheetTitle>
            <SidebarContent session={session} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="ml-3"><BrandMark /></div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
