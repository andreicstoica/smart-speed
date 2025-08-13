"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";

const schema = z.object({
  text: z.string().min(1).max(5000),
});

import { SAMPLE_TEXT } from "../constants/sample";

export type EditorsProps = {
  value: string;
  onChange: (v: string) => void;
  onUseSample: () => void;
};

export function Editors(props: EditorsProps) {
  const { value, onChange, onUseSample } = props;
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-muted-foreground text-sm">
          Paste text (≤ 5k chars)
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onChange("")}
            type="button"
            variant="secondary"
          >
            Clear
          </Button>
          <Button onClick={onUseSample} type="button">
            Load Sample
          </Button>
        </div>
      </div>
      <textarea
        className="min-h-[220px] w-full resize-y rounded-md border bg-background p-3 font-mono text-sm outline-none"
        onChange={(e) => {
          const next = e.target.value;
          const res = schema.safeParse({ text: next || "x" });
          setError(res.success ? null : "Too long");
          onChange(next);
        }}
        placeholder="Paste or type here..."
        value={value}
      />
      {error ? <div className="text-red-500 text-xs">{error}</div> : null}
    </div>
  );
}

export function useSampleText(): string {
  return SAMPLE_TEXT;
}
