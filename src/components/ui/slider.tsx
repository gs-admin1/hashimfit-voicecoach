
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showGradient?: boolean;
  }
>(({ className, showGradient = false, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track 
      className={cn(
        "relative h-4 w-full grow overflow-hidden rounded-full",
        showGradient 
          ? "bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500" 
          : "bg-secondary"
      )}
    >
      {!showGradient && (
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      )}
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className={cn(
        "block h-7 w-7 rounded-full border-3 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg cursor-pointer",
        showGradient ? "border-gray-300 shadow-xl" : "border-primary"
      )} 
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
