import type { TransformResult } from "@/lib/tagging";
import { Card } from "../ui/card";
import { TaggedText } from "./TagBadge";

export interface DiffPanelProps {
  originalText: string;
  transformResult: TransformResult;
  className?: string;
}

export function DiffPanel({
  originalText,
  transformResult,
  className,
}: DiffPanelProps) {
  const { taggedText, tagStats, params } = transformResult;

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="mb-2 font-semibold text-lg">
          How the smart speed is changing the text
        </h3>
        <div className="mb-4 text-muted-foreground text-sm">
          Adding pauses variably after punctuation, paragraphs, etc. This lets
          people listen faster.
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <h4 className="font-medium text-muted-foreground text-sm">
            Original Text
          </h4>
          <h4 className="font-medium text-muted-foreground text-sm">
            Enhanced Text
          </h4>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {originalText}
            </div>
            <div className="text-sm leading-relaxed">
              <TaggedText originalText={originalText} text={taggedText} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
