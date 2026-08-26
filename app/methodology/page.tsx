"use client";

import { MethodologyContent } from "@/components/methodology-content";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function MethodologyPage() {
  return (
    <div className="space-y-4">
      <DisclaimerBanner />
      <MethodologyContent />
    </div>
  );
}
