import { PolicyWizard } from "@/components/policies/PolicyWizard";

export default function NewPolicyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Issue new policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete all four steps to activate cover.
        </p>
      </div>
      <PolicyWizard />
    </div>
  );
}
