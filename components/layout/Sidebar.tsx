"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { APP_NAME, BRAND_PRIMARY, LOGO_PATH } from "@/lib/branding";

const COLLAPSE_KEY = "britam_sidebar_collapsed";

type NavItem = { href: string; label: string; icon: React.ElementType };

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agents", label: "Agents", icon: Users },
  { href: "/admin/clients", label: "All Clients", icon: UserCircle },
  { href: "/admin/policies", label: "All Policies", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/claims", label: "Claims", icon: AlertCircle },
  { href: "/admin/plans", label: "Plans & Pricing", icon: Package },
];

const agentNav: NavItem[] = [
  { href: "/agent", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/clients", label: "My Clients", icon: UserCircle },
  { href: "/agent/policies", label: "My Policies", icon: FileText },
  { href: "/agent/payments", label: "Payments", icon: CreditCard },
  { href: "/agent/claims", label: "Claims", icon: AlertCircle },
];

export function Sidebar({
  role,
  currentPath,
}: {
  role: "admin" | "agent";
  currentPath: string;
}) {
  const { logout, agentId } = useAuth();
  const { agents } = useData();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(COLLAPSE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(v === "1");
    } catch { /* ignore */ }
  }, []);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
  };

  const items = role === "admin" ? adminNav : agentNav;
  const agent = agents.find((a) => a.id === agentId);
  const displayName = role === "admin" ? "Administrator" : (agent?.name ?? "Agent");
  const initials =
    displayName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "BF";

  function isActive(href: string) {
    return href === "/admin" || href === "/agent"
      ? currentPath === href
      : currentPath === href || currentPath.startsWith(href + "/");
  }

  function NavLink({ item, forceExpanded = false }: { item: NavItem; forceExpanded?: boolean }) {
    const active = isActive(item.href);
    const Icon = item.icon;
    const showLabel = forceExpanded || !collapsed;
    return (
      <Link
        href={item.href}
        title={collapsed && !forceExpanded ? item.label : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
          showLabel ? "justify-start" : "justify-center px-2",
          active
            ? "bg-[#1892ff] text-white shadow-sm shadow-[#1892ff]/30"
            : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
        )}
      >
        <Icon
          className={cn(
            "shrink-0 transition-colors",
            collapsed && !forceExpanded ? "size-5" : "size-4",
            active ? "text-white" : "text-slate-500 group-hover:text-white"
          )}
        />
        {showLabel && <span className="truncate">{item.label}</span>}
      </Link>
    );
  }

  function UserSection({ forceExpanded = false }: { forceExpanded?: boolean }) {
    const show = forceExpanded || !collapsed;
    return (
      <div className="border-t border-white/[0.08] p-3">
        <div className={cn("mb-3 flex items-center gap-3", !show && "flex-col gap-2")}>
          <Avatar className="size-8 shrink-0 ring-2 ring-white/10">
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ background: `${BRAND_PRIMARY}55` }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          {show && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <span
                className="inline-block rounded-full px-2 py-px text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: `${BRAND_PRIMARY}25`, color: BRAND_PRIMARY }}
              >
                {role}
              </span>
            </div>
          )}
          <button
            type="button"
            title="Logout"
            onClick={() => { logout(); window.location.href = "/"; }}
            className={cn(
              "shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/[0.07] hover:text-red-400",
              show ? "ml-auto" : ""
            )}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Desktop sidebar ────────────────────────────────────────────────────────
  const desktopSidebar = (
    <aside
      className={cn(
        "hidden md:flex h-screen sticky top-0 shrink-0 flex-col bg-[#0d1827] transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-white/[0.08] px-3 py-4",
        collapsed ? "justify-center" : "justify-between gap-2"
      )}>
        <Link
          href={role === "admin" ? "/admin" : "/agent"}
          className={cn(
            "flex min-w-0 items-center gap-2.5",
            collapsed && "justify-center"
          )}
        >
          <Image
            src={LOGO_PATH}
            alt={APP_NAME}
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-md object-contain"
            priority
          />
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-white leading-tight">
              {APP_NAME}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/[0.07] hover:text-slate-300"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 py-3">
        {items.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* User */}
      <UserSection />
    </aside>
  );

  // ── Mobile header + overlay sidebar ───────────────────────────────────────
  const mobileParts = (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.08] bg-[#0d1827] px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/[0.07] hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <Link href={role === "admin" ? "/admin" : "/agent"} className="flex items-center gap-2">
          <Image src={LOGO_PATH} alt={APP_NAME} width={26} height={26} className="size-[26px] rounded object-contain" priority />
          <span className="text-sm font-semibold text-white">{APP_NAME}</span>
        </Link>
      </header>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0d1827] transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4">
          <Link href={role === "admin" ? "/admin" : "/agent"} className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <Image src={LOGO_PATH} alt={APP_NAME} width={32} height={32} className="size-8 rounded-md object-contain" priority />
            <span className="text-sm font-semibold text-white">{APP_NAME}</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-white/[0.07] hover:text-white"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink key={item.href} item={item} forceExpanded />
          ))}
        </nav>

        {/* Drawer user */}
        <UserSection forceExpanded />
      </aside>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileParts}
    </>
  );
}
