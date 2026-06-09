import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary",
      secondary: "bg-secondary text-secondary-foreground",
      red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
    }
  },
  defaultVariants: { variant: "default" }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
