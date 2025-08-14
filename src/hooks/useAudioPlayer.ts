import { useEffect, useRef, useState } from "react";

interface PlayerOptions {
    initialRate?: number;
    lockRate?: boolean;
    speedOptions?: number[];
}

export function useAudioPlayer(audioUrl?: string, options: PlayerOptions = {}) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(options.initialRate ?? 1);

    const speedOptions = options.speedOptions ?? [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

    // Reset when new audio loads
    useEffect(() => {
        setIsPlaying(false);
        setDuration(0);
        setCurrentTime(0);
    }, [audioUrl]);

    // Wire up audio events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoaded = () => {
            setDuration(audio.duration || 0);
            // Ensure playback rate is applied on metadata load
            audio.playbackRate = options.initialRate ?? playbackSpeed;
        };
        const onTime = () => {
            if (!isSeeking) setCurrentTime(audio.currentTime || 0);
        };
        const onEnd = () => setIsPlaying(false);

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("ended", onEnd);

        return () => {
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("ended", onEnd);
        };
    }, [audioUrl, isSeeking]);

    // Respond to external initialRate changes
    useEffect(() => {
        if (typeof options.initialRate === 'number') {
            setPlaybackSpeed(options.initialRate);
            const audio = audioRef.current;
            if (audio) {
                audio.playbackRate = options.initialRate;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.initialRate]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            audio
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => { });
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    };

    const onScrubStart = () => setIsSeeking(true);
    const onScrub = (value: number) => setCurrentTime(value);
    const onScrubEnd = (value: number) => {
        const audio = audioRef.current;
        setIsSeeking(false);
        if (audio) audio.currentTime = value;
    };

    const skipTime = (seconds: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(
            0,
            Math.min(audio.duration, audio.currentTime + seconds)
        );
    };

    const toggleSpeed = () => {
        if (options.lockRate) return; // locked rate, do nothing
        const currentIndex = speedOptions.indexOf(playbackSpeed);
        const nextIndex = (currentIndex + 1) % speedOptions.length;
        const newSpeed = speedOptions[nextIndex];
        setPlaybackSpeed(newSpeed);

        const audio = audioRef.current;
        if (audio) {
            audio.playbackRate = newSpeed;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    return {
        audioRef,
        isPlaying,
        duration,
        currentTime,
        playbackSpeed,
        speedOptions,
        togglePlay,
        onScrubStart,
        onScrub,
        onScrubEnd,
        skipTime,
        toggleSpeed,
        formatTime,
    };
}
