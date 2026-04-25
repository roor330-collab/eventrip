import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-glow active:scale-95",
  secondary:
    "bg-dark-700 hover:bg-dark-600 text-white border border-dark-500 active:scale-95",
  ghost: "text-accent-400 hover:text-accent-300 hover:bg-white/5 active:scale-95",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg active:scale-95",
  outline:
    "border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10 active:scale-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-base rounded-xl",
  lg: "px-6 py-3 text-lg rounded-2xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "font-semibold transition-smooth inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
