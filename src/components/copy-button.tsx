'use client';

import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  label?: string;
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy ${label ?? value}`}
      className="inline-flex items-center gap-1 font-mono text-xs text-ink hover:text-moss transition-colors group"
    >
      <span>{value}</span>
      <span className={`text-[10px] transition-colors ${copied ? 'text-moss' : 'text-muted-foreground/50 group-hover:text-muted-foreground'}`}>
        {copied ? '✓' : '⧉'}
      </span>
    </button>
  );
}
