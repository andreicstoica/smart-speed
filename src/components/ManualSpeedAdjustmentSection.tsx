"use client";

import { useMemo } from "react";
import { AudioPlayer } from "./audio/AudioPlayer";
import { DiffPanel } from "./audio/DiffPanel";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { useManualSpeedAdjustment } from "@/hooks/useManualSpeedAdjustment";

type ModelVersion = "v2" | "v3";

interface Props {
  text: string;
  modelVersion: ModelVersion;
  setModelVersion: (version: ModelVersion) => void;
}

export function ManualSpeedAdjustmentSection({
  text,
  modelVersion,
  setModelVersion,
}: Props) {
  const manual = useManualSpeedAdjustment(text);

  const hasText = useMemo(() => text.trim().length > 0, [text]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div>
          <h3 className="mb-2 font-semibold text-lg">
            Manual Speed Adjustment
          </h3>
          <p className="text-muted-foreground text-sm">
            Control speed and normalization directly. Tagging is inferred from
            speed.
          </p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Model:</span>
          <Button
            size="sm"
            variant={
              modelVersion === ("v2" as ModelVersion) ? "default" : "outline"
            }
            onClick={() => setModelVersion("v2" as ModelVersion)}
          >
            V2
          </Button>
          <Button
            size="sm"
            variant={
              modelVersion === ("v3" as ModelVersion) ? "default" : "outline"
            }
            onClick={() => setModelVersion("v3" as ModelVersion)}
          >
            V3
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="col-span-2">
            <Label htmlFor="speed">Speed (0.75–3.0)</Label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="speed"
                type="range"
                min={0.75}
                max={3}
                step={0.05}
                value={manual.speed}
                onChange={(e) => manual.setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="w-16 text-right font-semibold">
                {manual.speed.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        {manual.transformResult && (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-2">
              <div>
                <div className="font-medium text-muted-foreground">Speed</div>
                <div className="font-semibold text-lg">
                  {manual.transformResult.params.speed}x
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Model</div>
                <div className="font-semibold text-lg">
                  {manual.transformResult.params.model_id}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {manual.transformResult && (
        <DiffPanel
          originalText={text}
          transformResult={manual.transformResult}
        />
      )}

      <Card className="relative p-6">
        <div className="mb-4 text-center">
          <div className="font-medium text-lg">Smart Speed Audio</div>
          <div className="text-muted-foreground text-sm">
            Enhanced with timing and expression tags
          </div>
        </div>

        {manual.smartAudioUrl ? (
          <AudioPlayer
            audioUrl={manual.smartAudioUrl}
            title="Smart Speed Generated Audio"
            subtitle="Enhanced with timing and expression tags"
            initialRate={manual.transformResult?.params.speed}
            lockRate
            hideSkipButtons
          />
        ) : (
          <div className="flex justify-center">
            <Button
              className="px-8"
              disabled={!hasText || manual.loading}
              onClick={manual.generateSmartAudio}
              size="lg"
            >
              {manual.loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </div>
              ) : (
                "Generate New Audio"
              )}
            </Button>
          </div>
        )}

        {manual.error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <div className="font-medium text-red-700 text-sm dark:text-red-300">
              {manual.error}
            </div>
            <Button
              className="mt-2"
              onClick={manual.generateSmartAudio}
              size="sm"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
