import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.ComponentProps<"div"> {
  /**
   * When true (default), enables an animated luminous glowing shimmer sheen.
   */
  glow?: boolean
}

function Skeleton({ className, glow = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md bg-muted/80 animate-pulse motion-reduce:animate-none",
        glow && "skeleton-glow",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
