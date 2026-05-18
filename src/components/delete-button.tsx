'use client';

interface Props {
  action: () => Promise<void>;
  label: string;
}

export function DeleteButton({ action, label }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Delete this record? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-rust border border-rust/30 rounded-md hover:bg-rust/10 transition-colors"
      >
        {label}
      </button>
    </form>
  );
}
