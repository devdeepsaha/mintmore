import { FeatureGate } from '@/components/features/FeatureGate';

export default function SocialPublishingPage() {
  return (
    <FeatureGate featureId="social_publishing">
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Social Publishing</h1>
      </div>
    </FeatureGate>
  );
}