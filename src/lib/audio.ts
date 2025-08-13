"use client";

export type SmartPlaybackOptions = {
	baseRate?: number;
	punctuationSlowdownRate?: number;
	microPauseMs?: number;
};

export type SmartPlaybackController = {
	stop: () => void;
	isPlaying: () => boolean;
};

export async function decodeAudio(
	audioData: ArrayBuffer,
	audioContext: AudioContext
): Promise<AudioBuffer> {
	return await audioContext.decodeAudioData(audioData.slice(0));
}

export function createObjectUrlFromBuffer(
	arrayBuffer: ArrayBuffer,
	mime = "audio/mpeg"
): string {
	const blob = new Blob([arrayBuffer], { type: mime });
	return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url?: string) {
	if (!url) return;
	try {
		URL.revokeObjectURL(url);
	} catch {}
}

type TextSegment = {
	text: string;
	endsWithPunctuation: boolean;
	length: number;
};

export function splitTextByPunctuation(text: string): TextSegment[] {
	const parts: TextSegment[] = [];
	const regex = /(.*?)([.!?;:,\n]+|$)/gs;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(text)) !== null) {
		const body = (match[1] ?? "").trim();
		const punct = match[2] ?? "";
		const segmentText = body + punct;
		if (segmentText.length === 0) continue;
		parts.push({
			text: segmentText,
			endsWithPunctuation: /[.!?;:,\n]$/.test(segmentText),
			length: segmentText.length,
		});
	}
	if (parts.length === 0) {
		parts.push({ text, endsWithPunctuation: true, length: text.length });
	}
	return parts;
}

export function playSmart(
	audioContext: AudioContext,
	audioBuffer: AudioBuffer,
	originalText: string,
	options: SmartPlaybackOptions = {}
): SmartPlaybackController {
	const baseRate = options.baseRate ?? 1.12;
	const punctRate = options.punctuationSlowdownRate ?? 1.02;
	const microPauseMs = options.microPauseMs ?? 70;

	const segments = splitTextByPunctuation(originalText);
	const totalChars = segments.reduce((a, s) => a + s.length, 0);
	const totalAudioDuration = audioBuffer.duration;

	let cumulativeChars = 0;
	let scheduledAt = audioContext.currentTime + 0.05;
	const microPauseSec = microPauseMs / 1000;

	const gainNode = audioContext.createGain();
	gainNode.gain.value = 1.0;
	gainNode.connect(audioContext.destination);

	const activeNodes: AudioBufferSourceNode[] = [];
	let stopped = false;

	for (const segment of segments) {
		const segmentStartRatio = cumulativeChars / totalChars;
		const segmentLenRatio = segment.length / totalChars;
		const sliceOffset = totalAudioDuration * segmentStartRatio;
		const sliceDur = totalAudioDuration * segmentLenRatio;

		const node = audioContext.createBufferSource();
		node.buffer = audioBuffer;
		node.playbackRate.value = segment.endsWithPunctuation
			? punctRate
			: baseRate;
		node.connect(gainNode);
		node.start(scheduledAt, sliceOffset, Math.max(0, sliceDur - 0.01));

		const playTime = sliceDur / node.playbackRate.value;
		scheduledAt += playTime;
		if (segment.endsWithPunctuation) {
			scheduledAt += microPauseSec;
		}

		activeNodes.push(node);
		cumulativeChars += segment.length;
	}

	const stop = () => {
		if (stopped) return;
		stopped = true;
		try {
			activeNodes.forEach((n) => {
				try {
					n.stop();
				} catch {}
			});
		} finally {
			try {
				gainNode.disconnect();
			} catch {}
		}
	};

	return {
		stop,
		isPlaying: () => !stopped,
	};
}

export function ensureAudioContext(): AudioContext {
	// @ts-expect-error Safari prefix
	const AC = (window.AudioContext ||
		(window as any).webkitAudioContext) as typeof AudioContext;
	const ctx = new AC();
	return ctx;
}
