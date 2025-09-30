import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border-0 px-2.5 py-1 text-sm font-normal w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300",
        success:
          "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300",
        warning:
          "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300", 
        outline:
          "border border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

