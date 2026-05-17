'use client';

import * as Tooltip from '@radix-ui/react-tooltip';

interface InfoTooltipProps {
  text: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function InfoTooltip({ text, side = 'top' }: InfoTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold hover:bg-muted-foreground/20 transition-colors ml-1 shrink-0 align-middle"
            aria-label="More information"
          >
            ?
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={6}
            className="z-50 max-w-64 rounded-md bg-ink px-3 py-2 text-xs text-background shadow-md leading-relaxed"
          >
            {text}
            <Tooltip.Arrow className="fill-ink" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
