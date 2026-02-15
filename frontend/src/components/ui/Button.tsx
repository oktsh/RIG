import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  danger?: boolean;
}

export default function Button({
  variant = "primary",
  danger = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-6 py-3 text-xs font-bold uppercase tracking-wide transition-all",
        danger
          ? "border border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white"
          : variant === "primary"
            ? "btn-primary"
            : "btn-outline",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
