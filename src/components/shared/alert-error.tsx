"use client";

import * as React from "react";
import { CircleX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AlertErrorWithEverythingProps {
  title?: React.ReactNode;
  description: React.ReactNode;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  className?: string;
  action?: React.ReactNode;
}

export function AlertErrorWithEverything({
  title = "Error",
  description,
  onRetry,
  onDismiss,
  retryLabel = "Retry",
  dismissLabel = "Dismiss",
  className,
  action,
}: AlertErrorWithEverythingProps) {
  return (
    <Alert
      variant="destructive"
      className={cn(
        "w-full flex flex-row items-start gap-3 border-destructive/80 bg-destructive/5 text-destructive rounded-xl p-4 shadow-xs",
        className
      )}
    >
      <CircleX className="size-5 shrink-0 translate-y-0.5 text-destructive" />
      <div className="flex flex-1 flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          {title && <AlertTitle className="font-semibold text-base leading-none tracking-tight">{title}</AlertTitle>}
          <AlertDescription className="text-sm text-destructive/90 leading-relaxed font-normal">
            {description}
          </AlertDescription>
        </div>
        {(onRetry || onDismiss || action) && (
          <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
            {action}
            {onRetry && (
              <Button size="sm" variant="destructive" type="button" onClick={onRetry} className="min-h-9 px-3">
                {retryLabel}
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="outline" type="button" onClick={onDismiss} className="min-h-9 px-3">
                {dismissLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
}

export default AlertErrorWithEverything;
