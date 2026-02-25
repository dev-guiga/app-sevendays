import { cn } from "@/lib/utils";

interface SignupStepsIndicatorProps {
  currentStep: 1 | 2;
}

export function SignupStepsIndicator({ currentStep }: SignupStepsIndicatorProps) {
  const isStepOneFilled = currentStep >= 1;
  const isStepTwoFilled = currentStep >= 2;

  return (
    <div className="mx-auto flex items-center gap-2">
      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
          isStepOneFilled
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        1
      </div>

      <div
        className={cn(
          "h-1 w-12 rounded-full",
          isStepTwoFilled ? "bg-primary" : "bg-muted"
        )}
      />

      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
          isStepTwoFilled
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        2
      </div>
    </div>
  );
}
