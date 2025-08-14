import { Card } from "./ui/card";
import { DiffPanel } from "./audio/DiffPanel";
import { Label } from "./ui/label";
import type { ManualHookReturn } from "@/hooks/useManualSpeedAdjustment";

interface ModelDetailsSectionProps {
  transformResult?: any; // Will be passed from parent
  text: string; // Add text prop for DiffPanel
  manualSpeed: ManualHookReturn; // shared manual state
}

export function ModelDetailsSection({
  transformResult,
  text,
  manualSpeed,
}: ModelDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="mb-6 p-4">
        <div className="mb-4">
          <h3 className="mb-2 font-semibold text-lg">Speed up the audio</h3>
          <p className="text-muted-foreground text-sm">
            Adjust speed and see other parameters
          </p>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="col-span-2">
              <Label htmlFor="speed">Speed (0.75–3.0)</Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="speed"
                  type="range"
                  min={0.75}
                  max={3}
                  step={0.05}
                  value={manualSpeed.speed}
                  onChange={(e) =>
                    manualSpeed.setSpeed(parseFloat(e.target.value))
                  }
                  className="w-full"
                />
                <span className="w-16 text-right font-semibold">
                  {manualSpeed.speed.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Text Transformation Preview */}
      {transformResult && (
        <Card className="mb-6 p-4">
          <DiffPanel originalText={text} transformResult={transformResult} />
        </Card>
      )}
    </div>
  );
}
