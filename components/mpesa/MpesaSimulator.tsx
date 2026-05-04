"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, generateMpesaReference } from "@/lib/utils";
import { BRAND_PRIMARY } from "@/lib/branding";

type Phase = "idle" | "loading" | "success";

export function MpesaSimulator({
  amount,
  phone,
  onSuccess,
}: {
  amount: number;
  phone: string;
  onSuccess: (reference: string) => void;
}) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [ref, setRef] = React.useState<string | null>(null);
  const [msgIdx, setMsgIdx] = React.useState(0);

  const messages = React.useMemo(
    () => [
      `Sending STK Push to ${phone}…`,
      "Waiting for client to confirm on their phone…",
      "Verifying payment with M-Pesa…",
    ],
    [phone]
  );

  React.useEffect(() => {
    if (phase !== "loading") return;
    const i = window.setInterval(() => {
      setMsgIdx((n) => (n + 1) % messages.length);
    }, 1000);
    return () => window.clearInterval(i);
  }, [phase, messages.length]);

  const start = () => {
    setPhase("loading");
    setMsgIdx(0);
    window.setTimeout(() => {
      const r = generateMpesaReference();
      setRef(r);
      setPhase("success");
      onSuccess(r);
    }, 3000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {phase === "idle" && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">
            Amount due:{" "}
            <span className="font-semibold text-foreground">{formatCurrency(amount)}</span>
          </p>
          <Button
            type="button"
            className="w-full font-semibold text-white hover:opacity-95"
            style={{ backgroundColor: BRAND_PRIMARY }}
            onClick={start}
          >
            Initiate M-Pesa Payment
          </Button>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Loader2 className="size-10 animate-spin text-[#1892ff]" />
          <p className="text-sm text-muted-foreground">{messages[msgIdx]}</p>
        </div>
      )}

      {phase === "success" && ref && (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <CheckCircle2 className="size-12 text-emerald-500 animate-in zoom-in-95" />
          <p className="font-medium text-emerald-700">Payment confirmed!</p>
          <p className="text-xs text-muted-foreground">
            M-Pesa reference:{" "}
            <span className="font-mono font-semibold text-foreground">{ref}</span>
          </p>
        </div>
      )}
    </div>
  );
}
