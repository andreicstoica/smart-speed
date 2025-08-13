"use client";

import { useState } from "react";
import { BaselineAudioPlayer } from "@/components/audio/BaselineAudioPlayer";
import { Editors } from "@/components/Editors";
import { SmartSpeedSection } from "@/components/SmartSpeedSection";
import { IntroModal } from "@/components/IntroModal";
import { useSampleText } from "@/lib/utils";
import { Card } from "../components/ui/card";

export default function Home() {
  const sample = useSampleText();
  const [text, setText] = useState<string>(sample);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <IntroModal />

      <div className="mb-6">
        <h1 className="font-semibold text-2xl">Smart Speed Adjustment</h1>
        <p className="text-muted-foreground text-sm">Baseline vs Smart Speed</p>
      </div>

      {/* Text Input */}
      <Card className="mb-6 p-4">
        <Editors
          onChange={setText}
          onUseSample={() => setText(sample)}
          value={text}
        />
      </Card>

      {/* Baseline Audio */}
      <div className="mb-8">
        <BaselineAudioPlayer text={text} />
      </div>

      {/* Divider */}
      <div className="mb-8 border-1 border-gray-200 border-t dark:border-gray-800" />

      {/* Smart Speed Section */}
      <SmartSpeedSection text={text} />
    </div>
  );
}
