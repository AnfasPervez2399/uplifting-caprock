import { useOnboardingController } from "../features/onboarding/useOnboardingController";
import { OnboardingShell } from "../features/onboarding/components/OnboardingShell";
import { SubmittedApplication } from "../features/onboarding/components/SubmittedApplication";
import { PersonalStep } from "../features/onboarding/steps/PersonalStep";
import { BusinessStep } from "../features/onboarding/steps/BusinessStep";
import { IdentityStep } from "../features/onboarding/steps/IdentityStep";
import { BankStep } from "../features/onboarding/steps/BankStep";
import { CashAccountsStep } from "../features/onboarding/steps/CashAccountsStep";
import { SignatureStep } from "../features/onboarding/steps/SignatureStep";
import { DocumentsStep } from "../features/onboarding/steps/DocumentsStep";
import { ReviewStep } from "../features/onboarding/steps/ReviewStep";

export function Onboarding() {
  const controller = useOnboardingController();

  const renderActiveStep = () => {
    switch (controller.activeStepId) {
      case "personal":
        return <PersonalStep controller={controller} />;
      case "business":
        return <BusinessStep controller={controller} />;
      case "identity":
        return <IdentityStep controller={controller} />;
      case "bank":
        return <BankStep controller={controller} />;
      case "cash":
        return <CashAccountsStep controller={controller} />;
      case "documents":
        return <DocumentsStep controller={controller} />;
      case "signature":
        return <SignatureStep controller={controller} />;
      case "review":
        return <ReviewStep controller={controller} />;
      default:
        return null;
    }
  };

  if (controller.submitted) {
    return <SubmittedApplication controller={controller} />;
  }

  return (
    <OnboardingShell controller={controller}>
      {renderActiveStep()}
    </OnboardingShell>
  );
}

export default Onboarding;
