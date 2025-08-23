import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
  className?: string;
}

export const ProgressIndicator = ({ steps, currentStep, className }: ProgressIndicatorProps) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-progress-background rounded-full h-2">
          <div 
            className="bg-progress h-2 rounded-full transition-all duration-normal"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";
          const isUpcoming = step.status === "upcoming";

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all duration-normal",
                  {
                    "bg-step-completed text-primary-foreground": isCompleted,
                    "bg-step-active text-primary-foreground ring-2 ring-step-active ring-offset-2": isCurrent,
                    "bg-muted text-step-inactive": isUpcoming,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Title */}
              <div className="text-center max-w-20">
                <div
                  className={cn(
                    "text-xs font-medium transition-colors duration-normal",
                    {
                      "text-foreground": isCompleted || isCurrent,
                      "text-muted-foreground": isUpcoming,
                    }
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 h-0.5 transition-colors duration-normal",
                    "hidden sm:block",
                    {
                      "bg-step-completed": index < currentStepIndex,
                      "bg-muted": index >= currentStepIndex,
                    }
                  )}
                  style={{
                    left: `${(100 / steps.length) * (index + 1) - (100 / steps.length) / 2}%`,
                    width: `${100 / steps.length}%`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};