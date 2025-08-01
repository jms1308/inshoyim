import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 border-blue-600 hover:border-blue-700 hover:shadow-md",
        destructive:
          "bg-transparent text-red-600 shadow-sm hover:bg-red-50 active:bg-red-100 border-red-200 hover:border-red-300",
        outline:
          "bg-transparent text-blue-600 shadow-sm hover:bg-blue-50 active:bg-blue-100 border-blue-200 hover:border-blue-300",
        secondary:
          "bg-white text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 border-gray-300 hover:border-gray-400 hover:shadow-md",
        ghost:
          "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 border-transparent hover:border-gray-200",
        link: "text-blue-600 underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
