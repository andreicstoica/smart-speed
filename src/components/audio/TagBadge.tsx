import { cn } from "@/lib/utils";

export interface TagBadgeProps {
	type: "break" | "style";
	content: string;
	className?: string;
}

export function TagBadge({ type, content, className }: TagBadgeProps) {
	const isBreak = type === "break";

	return (
		<span
			className={cn(
				"inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 font-medium text-xs",
				isBreak
					? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
					: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
				className
			)}
			title={content}
		>
			{isBreak ? (
				<>
					<span className="mr-1">⏸</span>
					{content.match(/time="(\d+)ms"/)?.[1] || "break"}ms
				</>
			) : (
				<>
					<span className="mr-1">✨</span>
					{content.replace(/[[\]]/g, "")}
				</>
			)}
		</span>
	);
}

export function TaggedText({
	text,
	originalText,
	className,
}: {
	text: string;
	originalText?: string;
	className?: string;
}) {
	// Parse the text to find tags and create a rendered version
	const parts: Array<{
		type: "text" | "tag";
		content: string;
		tagType?: "break" | "style";
	}> = [];

	let lastIndex = 0;

	// Find all tags (both break and style tags)
	const tagRegex = /(<break[^>]*\/>|\[[\w\s]+\])/g;
	let match;

	while ((match = tagRegex.exec(text)) !== null) {
		// Add text before the tag
		if (match.index > lastIndex) {
			parts.push({
				type: "text",
				content: text.slice(lastIndex, match.index),
			});
		}

		// Add the tag
		const tagContent = match[0];
		const isBreak = tagContent.startsWith("<break");
		parts.push({
			type: "tag",
			content: tagContent,
			tagType: isBreak ? "break" : "style",
		});

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push({
			type: "text",
			content: text.slice(lastIndex),
		});
	}

	return (
		<div className={cn("space-y-1", className)}>
			{parts.map((part, index) =>
				part.type === "text" ? (
					<span key={index}>{part.content}</span>
				) : (
					<TagBadge
						className="mx-1"
						content={part.content}
						key={index}
						type={part.tagType!}
					/>
				)
			)}
		</div>
	);
}
