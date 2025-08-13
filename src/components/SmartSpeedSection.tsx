import { useState } from "react";
import type { VoiceStyle } from "@/constants/voice-presets";
import { AudioPlayer } from "./audio/AudioPlayer";
import { DiffPanel } from "./audio/DiffPanel";
import { useSmartSpeed } from "@/hooks/useSmartSpeed";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ManualSpeedAdjustmentSection } from "./ManualSpeedAdjustmentSection";

interface SmartSpeedSectionProps {
  text: string;
}

type ModelVersion = "v2" | "v3";

export function SmartSpeedSection({ text }: SmartSpeedSectionProps) {
  const [modelVersion, setModelVersion] = useState<ModelVersion>("v3");
  const [selectedStyle, setSelectedStyle] = useState<VoiceStyle | null>(null);

  // Always call hooks in the same order
  const smartSpeed = useSmartSpeed(text);

  // Render V2 mode if selected
  if (modelVersion === "v2") {
    return (
      <ManualSpeedAdjustmentSection
        text={text}
        modelVersion={modelVersion}
        setModelVersion={setModelVersion}
      />
    );
  }

  const handleStyleSelect = (style: VoiceStyle) => {
    setSelectedStyle(style);
    smartSpeed.selectStyle(style);
  };

  const handleGenerateAudio = () => {
    smartSpeed.generateSmartAudio();
  };

  const hasText = text.trim().length > 0;
  const showDiff = smartSpeed.transformResult;

  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <Card className="p-6">
        <div>
          <h3 className="mb-2 font-semibold text-lg">Voice Style Selection</h3>
          <p className="text-muted-foreground text-sm">
            Choose a style to enhance your audio with smart timing and
            expression
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

        <div className="flex gap-3">
          <Button
            disabled={!hasText}
            onClick={() => handleStyleSelect("bedtime")}
            variant={selectedStyle === "bedtime" ? "default" : "outline"}
          >
            Bedtime
          </Button>
          <Button
            disabled={!hasText}
            onClick={() => handleStyleSelect("energetic")}
            variant={selectedStyle === "energetic" ? "default" : "outline"}
          >
            Energetic
          </Button>
        </div>

        {!hasText && (
          <div className="text-muted-foreground text-sm">
            Enter some text to enable style selection
          </div>
        )}

        {/* Style Details */}
        {selectedStyle && smartSpeed.transformResult && (
          <>
            <div className="mb-4 border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                <div>
                  <div className="font-medium text-muted-foreground">Speed</div>
                  <div className="font-semibold text-lg">
                    {smartSpeed.transformResult.params.speed}x
                  </div>
                </div>

                <div>
                  <div className="font-medium text-muted-foreground">Model</div>
                  <div className="font-semibold text-lg">
                    {smartSpeed.transformResult.params.model_id}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-muted-foreground">
                    Breaks Added
                  </div>
                  <div className="font-semibold text-blue-600 text-lg dark:text-blue-400">
                    {smartSpeed.transformResult.tagStats.breaks}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-muted-foreground">
                    Style Tags
                  </div>
                  <div className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                    {smartSpeed.transformResult.tagStats.styleTags}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Timing breaks for natural pauses
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                Style enhancement tags
              </div>
              <div className="flex items-center gap-1">
                <span>Normalization:</span>
                <span className="font-medium">
                  {smartSpeed.transformResult.params.apply_text_normalization
                    ? "ON"
                    : "OFF"}
                </span>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Text Transformation Preview */}
      {showDiff && (
        <DiffPanel
          originalText={text}
          transformResult={smartSpeed.transformResult!}
        />
      )}

      {/* Smart Speed Audio Player */}
      <Card className="relative p-6">
        <div className="mb-4 text-center">
          <div className="font-medium text-lg">Smart Speed Audio</div>
          <div className="text-muted-foreground text-sm">
            Enhanced with timing and expression tags
          </div>
        </div>

        {/* Generate Button or Player */}
        {smartSpeed.smartAudioUrl ? (
          smartSpeed.smartAudioUrl && (
            <AudioPlayer
              audioUrl={smartSpeed.smartAudioUrl}
              subtitle="Enhanced with timing and expression tags"
              title="Smart Speed Generated Audio"
              initialRate={smartSpeed.transformResult?.params.speed}
              lockRate
              hideSkipButtons
            />
          )
        ) : (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="px-8"
                      disabled={
                        !(hasText && selectedStyle) || smartSpeed.loading
                      }
                      onClick={handleGenerateAudio}
                      size="lg"
                    >
                      {smartSpeed.loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Generating...
                        </div>
                      ) : (
                        "Generate New Audio"
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!selectedStyle && (
                  <TooltipContent>
                    <p>Please select a voice style first</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Error Display */}
        {smartSpeed.error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <div className="font-medium text-red-700 text-sm dark:text-red-300">
              {smartSpeed.error}
            </div>
            <Button
              className="mt-2"
              onClick={handleGenerateAudio}
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
