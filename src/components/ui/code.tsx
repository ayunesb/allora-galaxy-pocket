
import * as React from "react"
import { cn } from "@/lib/utils"

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {}

const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "bg-muted p-4 rounded-md font-mono overflow-x-auto text-sm",
          className
        )}
        {...props}
      />
    )
  }
)
Code.displayName = "Code"

export { Code }
