"use client";

import { useState } from "react";
import { BaselineAudioPlayer } from "@/components/audio/BaselineAudioPlayer";
import { Editors } from "@/components/Editors";
import { SmartSpeedSection } from "@/components/SmartSpeedSection";
import { ModelDetailsSection } from "@/components/ModelDetailsSection";
import { IntroModal } from "@/components/IntroModal";
import { useSampleText } from "@/lib/utils";
import { useManualSpeedAdjustment } from "@/hooks/useManualSpeedAdjustment";
import { Card } from "../components/ui/card";

export default function Home() {
  const sample = useSampleText();
  const [text, setText] = useState<string>(sample);

  // Initialize manual speed adjustment hook
  const manualSpeed = useManualSpeedAdjustment(text);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <IntroModal />

      {/* Text Input */}
      <Card className="mb-6 p-4">
        <div className="mb-2">
          <div className="font-semibold text-lg">Paste some text</div>
          <div className="text-muted-foreground text-sm">
            I don't have a lot of credits left, so please use small sample texts
            :)
          </div>
        </div>
        <Editors
          onChange={setText}
          onUseSample={() => setText(sample)}
          value={text}
        />
      </Card>

      {/* Model Details Section */}
      <ModelDetailsSection
        transformResult={manualSpeed.transformResult}
        text={text}
        manualSpeed={manualSpeed}
      />

      {/* Audio Players Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Baseline Audio */}
        <div>
          <BaselineAudioPlayer text={text} playbackRate={manualSpeed.speed} />
        </div>

        {/* Smart Speed Audio */}
        <SmartSpeedSection text={text} manual={manualSpeed} />
      </div>
    </div>
  );
}
