"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutGrid, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME, BRAND_PRIMARY, LOGO_PATH } from "@/lib/branding";

export default function LoginPage() {
  const { login, role } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (role === "admin") router.replace("/admin");
    else if (role === "agent") router.replace("/agent");
  }, [role, router]);

  if (role === "admin" || role === "agent") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-zinc-400 text-sm">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 py-12">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${BRAND_PRIMARY}12 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-10">

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src={LOGO_PATH}
            alt={APP_NAME}
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
          <div className="text-center">
            <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900">
              {APP_NAME}
            </h1>
            <p className="mt-1 text-[13px] text-zinc-400">
              Funeral Insurance Management Platform
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="flex w-full flex-col gap-3">
          <LoginCard
            icon={<LayoutGrid size={14} />}
            title="Admin Portal"
            description="Full system access, analytics & agent management"
            accent
            accentColor={BRAND_PRIMARY}
            buttonLabel="Continue as Admin"
            onClick={() => {
              login("admin");
              router.push("/admin");
            }}
          />
          <LoginCard
            icon={<UserRound size={14} />}
            title="Agent Portal"
            description="Issue policies, manage clients & record payments"
            buttonLabel="Continue as Agent"
            onClick={() => {
              login("agent", "agent-1");
              router.push("/agent");
            }}
          />
        </div>

        <p className="text-center text-[11px] text-zinc-400">
          Demo mode — no real credentials required
        </p>
      </div>
    </div>
  );
}

type LoginCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: boolean;
  accentColor?: string;
  buttonLabel: string;
  onClick: () => void;
};

function LoginCard({
  icon,
  title,
  description,
  accent,
  accentColor,
  buttonLabel,
  onClick,
}: LoginCardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border bg-white p-5 transition-all duration-200 shadow-sm"
      style={{
        borderColor: hovered
          ? accent
            ? `${accentColor}60`
            : "rgb(212 212 216)"
          : "rgb(228 228 231)",
        boxShadow: hovered
          ? "0 4px 24px 0 rgb(0 0 0 / 0.06)"
          : "0 1px 4px 0 rgb(0 0 0 / 0.04)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Shine on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: accent
            ? `radial-gradient(ellipse 80% 60% at 10% 10%, ${accentColor}08, transparent 60%)`
            : "radial-gradient(ellipse 80% 60% at 10% 10%, rgb(0 0 0 / 0.015), transparent 60%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          {/* Icon pill */}
          <div
            className="flex size-7 items-center justify-center rounded-lg"
            style={{
              background: accent ? `${accentColor}15` : "rgb(244 244 245)",
              color: accent ? accentColor : "rgb(113 113 122)",
            }}
          >
            {icon}
          </div>

          <div className="mt-1">
            <p className="text-sm font-medium text-zinc-800">{title}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-400">
              {description}
            </p>
          </div>
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={onClick}
          className="mt-1 shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all duration-150"
          style={
            accent
              ? {
                  background: `${accentColor}12`,
                  color: accentColor,
                  border: `1px solid ${accentColor}30`,
                }
              : {
                  background: "rgb(250 250 250)",
                  color: "rgb(63 63 70)",
                  border: "1px solid rgb(228 228 231)",
                }
          }
        >
          {buttonLabel} →
        </button>
      </div>
    </div>
  );
}