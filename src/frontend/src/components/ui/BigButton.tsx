import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const bigButtonVariants = cva(
  "inline-flex items-center justify-center gap-3 rounded-full font-display font-semibold transition-all duration-300 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-6 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-subtle hover:bg-primary/90 hover:shadow-elevated",
        warm: "bg-gradient-warm text-accent-foreground shadow-subtle hover:shadow-elevated",
        secondary:
          "bg-secondary text-secondary-foreground shadow-subtle hover:bg-secondary/80",
        outline:
          "border-2 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-14 px-8 text-lg",
        lg: "h-16 px-10 text-xl",
        sm: "h-12 px-6 text-base",
        icon: "size-14",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface BigButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof bigButtonVariants> {
  asChild?: boolean;
}

function BigButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: BigButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="big-button"
      className={cn(bigButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { BigButton, bigButtonVariants };
