import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#1A1A2E] text-white hover:bg-[#2a2a4e]',
        accent: 'bg-[#E94560] text-white hover:bg-[#d63d56]',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline: 'border border-[#1A1A2E] bg-transparent text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white',
        secondary: 'bg-gray-100 text-[#1A1A2E] hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 text-[#1A1A2E]',
        link: 'text-[#E94560] underline-offset-4 hover:underline',
        success: 'bg-[#10B981] text-white hover:bg-[#059669]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        xl: 'h-14 rounded-md px-10 text-base font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
