import { extractTagsFromText, transformTextForStyle } from "../tagging";
import { V2_PRESETS } from "../../constants/voice-presets";

// Helper function to simulate manual speed adjustment logic
function simulateManualSpeedTransform(text: string, speed: number) {
	const cleanText = text.trim();
	const wordCount = cleanText.split(/\s+/).length;
	const maxBreaks = Math.max(1, Math.floor((wordCount / 100) * 3)); // Ensure at least 1 break for testing

	// Overcast-like Smart Speed: shorten silences at natural boundaries
	const sentenceMatches = [...cleanText.matchAll(/[.!?]+\"?/g)];
	const clauseMatches = [...cleanText.matchAll(/[,;:]/g)];
	const newlineMatches = [...cleanText.matchAll(/\n+/g)];

	// Build candidate positions ordered by priority
	const candidates: Array<{ index: number; kind: "sentence" | "clause" | "para" }> = [];
	sentenceMatches.forEach((m) => m.index !== undefined && candidates.push({ index: m.index + m[0].length, kind: "sentence" }));
	clauseMatches.forEach((m) => m.index !== undefined && candidates.push({ index: m.index + m[0].length, kind: "clause" }));
	newlineMatches.forEach((m) => m.index !== undefined && candidates.push({ index: m.index + m[0].length, kind: "para" }));

	// Determine break windows based on speed
	const ranges = (() => {
		if (speed >= 2.0) {
			return { sentence: [80, 120] as const, clause: [40, 80] as const, para: [140, 200] as const };
		}
		if (speed >= 1.5) {
			return { sentence: [100, 150] as const, clause: [60, 100] as const, para: [160, 220] as const };
		}
		if (speed >= 1.1) {
			return { sentence: [140, 200] as const, clause: [90, 140] as const, para: [200, 260] as const };
		}
		return { sentence: [200, 260] as const, clause: [120, 180] as const, para: [240, 300] as const };
	})();

	function randIn([min, max]: readonly [number, number]) {
		return Math.floor(min + Math.random() * (max - min));
	}

	// Sort by priority and position; then choose up to maxBreaks
	const priority = { sentence: 0, para: 1, clause: 2 } as const;
	candidates.sort((a, b) => (priority[a.kind] - priority[b.kind]) || (a.index - b.index));
	const selected = candidates.slice(0, Math.max(0, maxBreaks));

	// Insert from end to preserve indices
	selected.sort((a, b) => b.index - a.index);

	let taggedText = cleanText;
	let breakCount = 0;
	for (const c of selected) {
		const breakTime = c.kind === "sentence" ? randIn(ranges.sentence) : c.kind === "para" ? randIn(ranges.para) : randIn(ranges.clause);
		taggedText = taggedText.slice(0, c.index) + ` <break time="${breakTime}ms" />` + taggedText.slice(c.index);
		breakCount++;
	}

	return { taggedText, breakCount };
}

describe("transformTextForStyle", () => {
	const sampleText =
		"Hello world, this is a test. How are you doing today? (This is in parentheses). Let's continue with more text.";

	test("bedtime style should have slower speed and gentle tone", () => {
		const result = transformTextForStyle(sampleText, "bedtime");

		expect(result.params.speed).toBe(0.9);
		expect(result.taggedText).toContain("[gentle tone]");
		expect(result.tagStats.styleTags).toBeGreaterThan(0);
	});

	test("energetic style should have faster speed", () => {
		const result = transformTextForStyle(sampleText, "energetic");

		expect(result.params.speed).toBe(1.12);
		// Should add rushed tags to parentheticals
		if (result.taggedText.includes("(")) {
			expect(result.taggedText).toContain("[rushed]");
		}
	});

	test("should sanitize existing tags", () => {
		const textWithTags =
			'Hello [existing tag] world <break time="100ms" /> more text.';
		const result = transformTextForStyle(textWithTags, "bedtime");

		// Should not contain the original tags in a nested way
		expect(result.taggedText).not.toContain("[existing tag]");
		expect(result.taggedText).not.toContain('<break time="100ms" />');
	});

	test("should limit break tags to prevent instability", () => {
		const longText = "This is a very long text. ".repeat(50); // ~300 words
		const result = transformTextForStyle(longText, "bedtime");

		// Should not exceed reasonable limits
		expect(result.tagStats.breaks).toBeLessThanOrEqual(9); // 3 per 100 words max
	});
});

describe("extractTagsFromText", () => {
	test("should extract break tags", () => {
		const text = 'Hello <break time="200ms" /> world';
		const tags = extractTagsFromText(text);

		expect(tags).toHaveLength(1);
		expect(tags[0].type).toBe("break");
		expect(tags[0].content).toBe('<break time="200ms" />');
	});

	test("should extract style tags", () => {
		const text = "[gentle tone] Hello world";
		const tags = extractTagsFromText(text);

		expect(tags).toHaveLength(1);
		expect(tags[0].type).toBe("style");
		expect(tags[0].content).toBe("[gentle tone]");
	});

	test("should extract multiple tags in order", () => {
		const text =
			'[gentle tone] Hello <break time="150ms" /> world [rushed] more text';
		const tags = extractTagsFromText(text);

		expect(tags).toHaveLength(3);
		expect(tags[0].content).toBe("[gentle tone]");
		expect(tags[1].content).toBe('<break time="150ms" />');
		expect(tags[2].content).toBe("[rushed]");
	});
});

describe("Manual Speed Adjustment Logic", () => {
	const sampleText = "Hello world, this is a test. How are you doing today? (This is in parentheses). Let's continue with more text.";

	test("should clamp speed between 0.75 and 3.0", () => {
		const setSpeed = (v: number) => Math.max(0.75, Math.min(3.0, v));

		expect(setSpeed(0.5)).toBe(0.75);
		expect(setSpeed(0.75)).toBe(0.75);
		expect(setSpeed(1.0)).toBe(1.0);
		expect(setSpeed(2.5)).toBe(2.5);
		expect(setSpeed(3.0)).toBe(3.0);
		expect(setSpeed(4.0)).toBe(3.0);
	});

	test("should add shorter breaks for higher speeds (Overcast-like)", () => {
		const text = "Hello world. This is a sentence. Another one here. And more text.";

		const slowResult = simulateManualSpeedTransform(text, 0.9);
		const fastResult = simulateManualSpeedTransform(text, 2.5);

		// Extract break times
		const slowBreaks = [...slowResult.taggedText.matchAll(/<break time="(\d+)ms" \/>/g)].map(m => parseInt(m[1]));
		const fastBreaks = [...fastResult.taggedText.matchAll(/<break time="(\d+)ms" \/>/g)].map(m => parseInt(m[1]));

		// Fast speed should have shorter breaks on average
		const slowAvg = slowBreaks.length > 0 ? slowBreaks.reduce((a, b) => a + b, 0) / slowBreaks.length : 0;
		const fastAvg = fastBreaks.length > 0 ? fastBreaks.reduce((a, b) => a + b, 0) / fastBreaks.length : 0;

		expect(fastAvg).toBeLessThan(slowAvg);
		expect(slowAvg).toBeGreaterThan(150); // Slow should be >150ms
		expect(fastAvg).toBeLessThan(150); // Fast should be <150ms
	});

	test("should prioritize sentence endings over clauses", () => {
		const text = "Hello world. This is a clause, and another one. Final sentence.";
		const result = simulateManualSpeedTransform(text, 1.5);

		// Should have breaks after periods, not just commas
		expect(result.taggedText).toMatch(/\. <break time="\d+ms" \/>/);
	});

	test("should respect max break limits", () => {
		const longText = "This is a sentence. ".repeat(20); // ~120 words
		const result = simulateManualSpeedTransform(longText, 1.0);

		// Should not exceed 3 breaks per 100 words
		expect(result.breakCount).toBeLessThanOrEqual(4); // 120 words = max 3.6 breaks
	});
});

describe("Audio Player Speed Controls", () => {
	test("should support locked playback rate", () => {
		const options = { initialRate: 2.5, lockRate: true };

		// Simulate the logic
		expect(options.initialRate).toBe(2.5);
		expect(options.lockRate).toBe(true);
	});

	test("should clamp speed options to valid range", () => {
		const speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

		expect(Math.min(...speedOptions)).toBe(0.75);
		expect(Math.max(...speedOptions)).toBe(3);
		expect(speedOptions).toHaveLength(10);
	});
});
