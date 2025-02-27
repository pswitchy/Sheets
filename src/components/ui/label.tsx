// src/components/ui/label.tsx
// Last Updated: 2025-02-26 16:46:46
// Author: parthsharma-git

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      error?: boolean;
      optional?: boolean;
    }
>(({ className, error, optional, children, ...props }, ref) => (
  <div className="space-y-2">
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        labelVariants(),
        error && "text-destructive",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-1">
        {children}
        {optional && (
          <span className="text-xs text-muted-foreground">(optional)</span>
        )}
      </span>
    </LabelPrimitive.Root>
  </div>
));
Label.displayName = LabelPrimitive.Root.displayName;

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      error?: string;
      optional?: boolean;
      description?: string;
    }
>(({ className, error, optional, description, children, ...props }, ref) => (
  <div className="space-y-2">
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      optional={optional}
      {...props}
    >
      {children}
    </Label>
    {description && (
      <p className="text-sm text-muted-foreground">{description}</p>
    )}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
));
FormLabel.displayName = "FormLabel";

export { Label, FormLabel };