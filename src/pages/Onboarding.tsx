import { OnboardingShell } from "../features/onboarding/components/OnboardingShell";
import { ApplicationTypeStep } from "../features/onboarding/steps/ApplicationTypeStep";
import { BankStep } from "../features/onboarding/steps/BankStep";
import { BusinessStep } from "../features/onboarding/steps/BusinessStep";
import { CashAccountsStep } from "../features/onboarding/steps/CashAccountsStep";
import { CompanyBusinessStep } from "../features/onboarding/steps/CompanyBusinessStep";
import {
  CompanyDirectorsStep,
  CompanyShareholdersStep,
} from "../features/onboarding/steps/CompanyPartiesStep";
import { CompanyProfileStep } from "../features/onboarding/steps/CompanyProfileStep";
import { DocumentsStep } from "../features/onboarding/steps/DocumentsStep";
import { EntityDocumentsStep } from "../features/onboarding/steps/EntityDocumentsStep";
import { IdentityStep } from "../features/onboarding/steps/IdentityStep";
import { PersonalStep } from "../features/onboarding/steps/PersonalStep";
import { ReviewStep } from "../features/onboarding/steps/ReviewStep";
import { SignatureStep } from "../features/onboarding/steps/SignatureStep";
import { TrustBeneficiariesStep } from "../features/onboarding/steps/TrustBeneficiariesStep";
import { TrustBusinessStep } from "../features/onboarding/steps/TrustBusinessStep";
import { TrustPartiesStep } from "../features/onboarding/steps/TrustPartiesStep";
import { TrustProfileStep } from "../features/onboarding/steps/TrustProfileStep";
import type { StepId } from "../features/onboarding/types";
import { useOnboardingController } from "../features/onboarding/useOnboardingController";

export default function Onboarding() {
  const controller = useOnboardingController();

  const renderStep = (stepId: StepId) => {
    switch (stepId) {
      case "application":
        return <ApplicationTypeStep controller={controller} />;
      case "personal":
        return <PersonalStep controller={controller} />;
      case "entity":
        return <CompanyProfileStep controller={controller} />;
      case "trust":
        return <TrustProfileStep controller={controller} />;
      case "business":
        if (controller.isCompany)
          return <CompanyBusinessStep controller={controller} />;
        if (controller.isTrust)
          return <TrustBusinessStep controller={controller} />;
        return <BusinessStep controller={controller} />;
      case "directors":
        return <CompanyDirectorsStep controller={controller} />;
      case "shareholders":
        return <CompanyShareholdersStep controller={controller} />;
      case "trustees":
        return <TrustPartiesStep controller={controller} />;
      case "beneficiaries":
        return <TrustBeneficiariesStep controller={controller} />;
      case "identity":
        return <IdentityStep controller={controller} />;
      case "bank":
        return <BankStep controller={controller} />;
      case "cash":
        return <CashAccountsStep controller={controller} />;
      case "documents":
        return controller.isIndividual ? (
          <DocumentsStep controller={controller} />
        ) : (
          <EntityDocumentsStep controller={controller} />
        );
      case "signature":
        return <SignatureStep controller={controller} />;
      case "review":
        return <ReviewStep controller={controller} />;
      default:
        return <ApplicationTypeStep controller={controller} />;
    }
  };

  return (
    <OnboardingShell controller={controller}>
      {renderStep(controller.activeStepId)}
    </OnboardingShell>
  );
}
