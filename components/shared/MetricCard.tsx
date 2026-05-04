"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const colorRing: Record<string, string> = {
  default: "bg-primary/15 text-primary",
  brand: "bg-[#1892ff]/15 text-[#1892ff]",
  red: "bg-destructive/15 text-destructive",
  green: "bg-emerald-500/15 text-emerald-600",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "default",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "brand" | "red" | "green";
}) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="relative overflow-hidden border-border/80 shadow-sm">
      <CardContent className="p-5 pt-6">
        <div
          className={cn(
            "absolute right-4 top-4 flex size-10 items-center justify-center rounded-full",
            colorRing[color] ?? colorRing.default
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 font-[family-name:var(--font-dm-serif)] text-3xl tracking-tight text-foreground">
          {value}
        </p>
        {(subtitle || trend) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {subtitle && <span>{subtitle}</span>}
            {trend && trendValue && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  trend === "up" && "text-emerald-600",
                  trend === "down" && "text-red-600",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                <TrendIcon className="size-3.5" />
                {trendValue}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
