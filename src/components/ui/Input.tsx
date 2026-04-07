import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export function Input({ label, error, icon, rightElement, className, ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-[#d0d0d0]">{label}</span> : null}
      <div
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-[6px] border bg-black px-4 py-3 text-text-primary transition",
          error
            ? "border-error"
            : "border-border-default focus-within:border-accent-cyan focus-within:shadow-glow-cyan",
        )}
      >
        {icon ? <span className="text-text-muted">{icon}</span> : null}
        <input
          className={cn("w-full border-none bg-transparent text-sm outline-none placeholder:text-text-muted", className)}
          {...props}
        />
        {rightElement}
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </label>
  );
}
