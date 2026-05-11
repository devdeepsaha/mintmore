import { FeatureGate } from '@/components/features/FeatureGate';

// AI Tools placeholder — FeatureGate renders ComingSoonPage from registry
export default function AIToolsPage() {
  return (
    <FeatureGate featureId="ai_tools">
      {/* This inner content renders when feature becomes enabled */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-slate-900">AI Tools</h1>
      </div>
    </FeatureGate>
  );
}