import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { buttonOutline, buttonSolid } from "../../site";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const variants = {
    primary: buttonSolid,
    secondary: buttonOutline,
    ghost: "inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-transparent px-5 py-3 font-semibold text-text-secondary transition duration-200 ease-out hover:bg-white/4 hover:text-text-primary",
  };

  return (
    <button
      className={cn(
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
