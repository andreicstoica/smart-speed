import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { DiffPanel } from "./audio/DiffPanel";
import { AudioPlayer } from "./audio/AudioPlayer";
import { useSmartSpeed } from "./audio/useSmartSpeed";
import type { VoiceStyle } from "@/constants/voice-presets";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface SmartSpeedSectionProps {
  text: string;
}

export function SmartSpeedSection({ text }: SmartSpeedSectionProps) {
  const [selectedStyle, setSelectedStyle] = useState<VoiceStyle | null>(null);
  const smartSpeed = useSmartSpeed(text);

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
          <h3 className="text-lg font-semibold mb-2">Voice Style Selection</h3>
          <p className="text-sm text-muted-foreground">
            Choose a style to enhance your audio with smart timing and
            expression
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant={selectedStyle === "bedtime" ? "default" : "outline"}
            onClick={() => handleStyleSelect("bedtime")}
            disabled={!hasText}
          >
            Bedtime
          </Button>
          <Button
            variant={selectedStyle === "energetic" ? "default" : "outline"}
            onClick={() => handleStyleSelect("energetic")}
            disabled={!hasText}
          >
            Energetic
          </Button>
        </div>

        {!hasText && (
          <div className="text-sm text-muted-foreground">
            Enter some text to enable style selection
          </div>
        )}

        {/* Style Details */}
        {selectedStyle && smartSpeed.transformResult && (
          <>
            <div className="border-t pt-6 mb-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Speed</div>
                  <div className="text-lg font-semibold">
                    {smartSpeed.transformResult.params.speed}x
                  </div>
                </div>

                <div>
                  <div className="font-medium text-muted-foreground">Model</div>
                  <div className="text-lg font-semibold">
                    {smartSpeed.transformResult.params.model_id}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-muted-foreground">
                    Breaks Added
                  </div>
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {smartSpeed.transformResult.tagStats.breaks}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-muted-foreground">
                    Style Tags
                  </div>
                  <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {smartSpeed.transformResult.tagStats.styleTags}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Timing breaks for natural pauses
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
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
      <Card className="p-6 relative">
        <div className="text-center mb-4">
          <div className="text-lg font-medium">Smart Speed Audio</div>
          <div className="text-sm text-muted-foreground">
            Enhanced with timing and expression tags
          </div>
        </div>

        {/* Generate Button or Player */}
        {!smartSpeed.smartAudioUrl ? (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={handleGenerateAudio}
                      disabled={
                        !hasText || !selectedStyle || smartSpeed.loading
                      }
                      size="lg"
                      className="px-8"
                    >
                      {smartSpeed.loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        ) : (
          smartSpeed.smartAudioUrl && (
            <AudioPlayer
              audioUrl={smartSpeed.smartAudioUrl}
              title="Smart Speed Audio"
              subtitle="Enhanced with timing and expression tags"
            />
          )
        )}

        {/* Error Display */}
        {smartSpeed.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-red-700 dark:text-red-300 text-sm font-medium">
              {smartSpeed.error}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAudio}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
