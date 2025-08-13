"use client";

import { useMemo, useState } from "react";
import { Editors, useSampleText } from "../components/Editors";
import { Players } from "../components/Players";
import { Card } from "../components/ui/card";

export default function Home() {
	const sample = useSampleText();
	const [text, setText] = useState<string>(sample);

	return (
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<div className="mb-6">
				<h1 className="font-semibold text-2xl">Smart Voice Speedup</h1>
				<p className="text-muted-foreground text-sm">
					Baseline vs Smart Speed (punctuation-aware)
				</p>
			</div>

			<Card className="mb-6 p-4">
				<Editors
					onChange={setText}
					onUseSample={() => setText(sample)}
					value={text}
				/>
			</Card>

			<Players text={text} />
		</div>
	);
}
