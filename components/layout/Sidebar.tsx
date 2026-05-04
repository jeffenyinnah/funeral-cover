"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  // Hydration: read sidebar preference from localStorage once after mount.
  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(COLLAPSE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync UI with persisted preference post-hydration
      setCollapsed(v === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const items = role === "admin" ? adminNav : agentNav;
  const agent = agents.find((a) => a.id === agentId);
  const displayName =
    role === "admin" ? "Administrator" : agent?.name ?? "Agent";
  const initials =
    displayName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BF";

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border p-3">
        <Link
          href={role === "admin" ? "/admin" : "/agent"}
          className={cn(
            "flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight",
            collapsed && "justify-center"
          )}
          style={{ color: BRAND_PRIMARY }}
        >
          <Image
            src={LOGO_PATH}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 object-contain"
            priority
          />
          {!collapsed && (
            <span className="truncate font-sans leading-tight">{APP_NAME}</span>
          )}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {items.map((item) => {
          const active =
            item.href === "/admin" || item.href === "/agent"
              ? currentPath === item.href
              : currentPath === item.href ||
                currentPath.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "border-l-2 bg-[#1892ff]/12 font-medium text-[#1892ff]"
                  : "border-l-2 border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              style={
                active
                  ? { borderLeftColor: BRAND_PRIMARY }
                  : { borderLeftColor: "transparent" }
              }
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "mb-3 flex items-center gap-2",
            collapsed && "flex-col"
          )}
        >
          <Avatar className="size-9 shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <span
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  background: `${BRAND_PRIMARY}22`,
                  color: BRAND_PRIMARY,
                }}
              >
                {role}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
        >
          {!collapsed ? "Logout" : "Out"}
        </Button>
      </div>
    </aside>
  );
}
