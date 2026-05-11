import { FeatureGate } from "@/components/features/FeatureGate";

export default function ClientWalletPage() {
  return (
    <FeatureGate featureId="wallet">
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Wallet</h1>
      </div>
    </FeatureGate>
  );
}
