import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StarBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  speed?: string;
  as?: React.ElementType;
}

export const StarBorder: React.FC<StarBorderProps> = ({
  children,
  className,
  color = "hsl(var(--primary))",
  speed = "3s",
  as: Component = "div",
}) => {
  return (
    <Component
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-4",
        className
      )}
    >
      <div
        className="absolute inset-0 h-full w-full animate-star-movement-bottom"
        style={{
          background: `radial-gradient(circle at 20% 80%, ${color} 1px, transparent 1px), 
                       radial-gradient(circle at 80% 20%, ${color} 1px, transparent 1px), 
                       radial-gradient(circle at 40% 40%, ${color} 1px, transparent 1px)`,
          backgroundSize: "50px 50px, 100px 100px, 30px 30px",
          animationDuration: speed,
          animationDelay: "0s",
        }}
      ></div>
      <div
        className="absolute inset-0 h-full w-full animate-star-movement-top"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color} 1px, transparent 1px), 
                       radial-gradient(circle at 70% 70%, ${color} 1px, transparent 1px), 
                       radial-gradient(circle at 90% 10%, ${color} 1px, transparent 1px)`,
          backgroundSize: "75px 75px, 25px 25px, 60px 60px",
          animationDuration: speed,
          animationDelay: "1s",
        }}
      ></div>
      <div className="relative z-10">{children}</div>
    </Component>
  );
};

// Demo component for testing
export const StarBorderDemo = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <StarBorder className="w-96 h-48" speed="2s">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Star Border Effect</h3>
          <p className="text-muted-foreground">
            A beautiful animated star border component with customizable colors and speed.
          </p>
        </div>
      </StarBorder>
    </div>
  );
};