import { useState } from "react";
import type { VoiceStyle } from "@/constants/voice-presets";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { DiffPanel } from "./audio/DiffPanel";
import { Label } from "./ui/label";
import { useSmartSpeed } from "@/hooks/useSmartSpeed";
import type { ManualHookReturn } from "@/hooks/useManualSpeedAdjustment";

type ModelVersion = "v2" | "v3";

interface ModelDetailsSectionProps {
  modelVersion: ModelVersion;
  setModelVersion: (version: ModelVersion) => void;
  transformResult?: any; // Will be passed from parent
  text: string; // Add text prop for DiffPanel
  manualSpeed: ManualHookReturn; // shared manual state
}

export function ModelDetailsSection({
  modelVersion,
  setModelVersion,
  transformResult,
  text,
  manualSpeed,
}: ModelDetailsSectionProps) {
  const [selectedStyle, setSelectedStyle] = useState<VoiceStyle | null>(null);
  const smartSpeed = useSmartSpeed(text);

  const handleStyleSelect = (style: VoiceStyle) => {
    setSelectedStyle(style);
    smartSpeed.selectStyle(style);
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="space-y-6">
      <Card className="mb-6 p-4">
        <div className="mb-4">
          <h3 className="mb-2 font-semibold text-lg">Speed up the audio</h3>
          <p className="text-muted-foreground text-sm">
            Select model version and see other parameters
          </p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Model:</span>
          <Button
            size="sm"
            variant={modelVersion === "v2" ? "default" : "outline"}
            onClick={() => setModelVersion("v2")}
          >
            V2
          </Button>
          <Button
            size="sm"
            variant={modelVersion === "v3" ? "default" : "outline"}
            onClick={() => setModelVersion("v3")}
          >
            V3
          </Button>
        </div>

        {/* V2 Speed Control */}
        {modelVersion === "v2" && (
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
        )}

        {/* V3 Style Selection */}
        {modelVersion === "v3" && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                disabled={!hasText}
                onClick={() => handleStyleSelect("bedtime")}
                variant={selectedStyle === "bedtime" ? "default" : "outline"}
                size="sm"
              >
                Bedtime
              </Button>
              <Button
                disabled={!hasText}
                onClick={() => handleStyleSelect("energetic")}
                variant={selectedStyle === "energetic" ? "default" : "outline"}
                size="sm"
              >
                Energetic
              </Button>
            </div>

            {!hasText && (
              <div className="text-muted-foreground text-xs">
                Enter some text to enable style selection
              </div>
            )}
          </div>
        )}
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
