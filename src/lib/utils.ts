import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SAMPLE_TEXT } from "@/constants/sample";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function useSampleText(): string {
	return SAMPLE_TEXT;
}
