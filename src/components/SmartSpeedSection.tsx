import { ManualSpeedAdjustmentSection } from "./ManualSpeedAdjustmentSection";

interface SmartSpeedSectionProps {
  text: string;
  manual: import("@/hooks/useManualSpeedAdjustment").ManualHookReturn;
}

export function SmartSpeedSection({ text, manual }: SmartSpeedSectionProps) {
  return <ManualSpeedAdjustmentSection text={text} manual={manual} />;
}
