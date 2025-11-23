import * as React from "react"
import { cn } from "@/lib/utils"

// Note: I'm not installing radix-ui/react-slot yet, so I'll implement a simpler version or install it.
// Actually, I should install class-variance-authority and @radix-ui/react-slot for a proper implementation if I want to follow shadcn.
// For now, I'll stick to a simpler implementation without Slot/CVA to avoid extra deps unless I install them.
// I'll install `class-variance-authority` as it's very useful.

// Wait, I didn't install `class-variance-authority`. I should install it.
// I'll use a simpler implementation for now to avoid blocking.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const variants = {
            default: "bg-primary text-white hover:bg-primary-dark shadow-sm",
            secondary: "bg-secondary text-white hover:bg-secondary-dark shadow-sm",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
