import { Building2 } from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import {
  AUSTRALIAN_STATE_OPTIONS,
  DOMESTIC_COMPANY_TYPE_OPTIONS,
  INVESTMENT_AMOUNT_OPTIONS,
  INVESTMENT_CURRENCY_OPTIONS,
} from "../config";
import {
  DocumentUpload,
  Field,
  SectionIntro,
  SubsectionHeading,
  inputClass,
} from "../components/FormPrimitives";
import { documentFromFile } from "../utils";
import type { OnboardingController } from "../useOnboardingController";

export function CompanyProfileStep({
  controller,
}: {
  controller: OnboardingController;
}) {
  const { form, errors, sectionEyebrow, updateCompany, openDocumentPreview } =
    controller;
  const type = form.personal.applicationType;
  const domestic = type === "australian-company";
  const asicForeign = type === "asic-non-australian-company";

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("entity")}
        title="Company Profile"
        description="Enter the entity’s registered name, identifier and investment profile exactly as they appear in official records."
        icon={Building2}
      />
      <div className="space-y-6">
        <section>
          <SubsectionHeading
            title="Registered company details"
            description="Use the company’s current legal registration details."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <DocumentUpload
                id="companyLogo"
                title="Company logo"
                description="Optional profile image for the company account."
                value={form.company.logo}
                onChange={(file) =>
                  updateCompany("logo", documentFromFile(file))
                }
                onPreview={openDocumentPreview}
                required={false}
                accept="image/*"
                compact
              />
            </div>
            <Field
              label={
                domestic || asicForeign
                  ? "Full company name as registered by ASIC"
                  : "Company name"
              }
              htmlFor="companyName"
              bottomAlign
              error={errors.companyName}
            >
              <input
                id="companyName"
                value={form.company.name}
                onChange={(event) => updateCompany("name", event.target.value)}
                placeholder="Registered company name"
                className={inputClass(Boolean(errors.companyName))}
              />
            </Field>
            <Field
              label="Company website"
              htmlFor="companyWebsite"
              bottomAlign
              error={errors.companyWebsite}
              required={false}
            >
              <input
                id="companyWebsite"
                value={form.company.website}
                onChange={(event) =>
                  updateCompany("website", event.target.value)
                }
                placeholder="www.example.com"
                className={inputClass(Boolean(errors.companyWebsite))}
              />
            </Field>
            {asicForeign ? (
              <Field
                label="Australian Registered Body Number (ARBN)"
                htmlFor="companyArbn"
                bottomAlign
                error={errors.companyArbn}
              >
                <input
                  id="companyArbn"
                  value={form.company.arbn}
                  onChange={(event) =>
                    updateCompany("arbn", event.target.value)
                  }
                  placeholder="ARBN issued to the company"
                  className={inputClass(Boolean(errors.companyArbn))}
                />
              </Field>
            ) : (
              <Field
                label="Company registration number"
                htmlFor="companyRegistrationNumber"
                bottomAlign
                error={errors.companyRegistrationNumber}
              >
                <input
                  id="companyRegistrationNumber"
                  value={form.company.registrationNumber}
                  onChange={(event) =>
                    updateCompany("registrationNumber", event.target.value)
                  }
                  placeholder="Registration number"
                  className={inputClass(
                    Boolean(errors.companyRegistrationNumber),
                  )}
                />
              </Field>
            )}
            {domestic ? (
              <>
                <Field
                  label="State or territory of formation or registration"
                  htmlFor="companyState"
                  bottomAlign
                  error={errors.companyState}
                >
                  <CustomSelect
                    id="companyState"
                    value={form.company.stateOrTerritory}
                    onChange={(value) =>
                      updateCompany("stateOrTerritory", value)
                    }
                    options={AUSTRALIAN_STATE_OPTIONS}
                    placeholder="Select state or territory"
                    error={Boolean(errors.companyState)}
                  />
                </Field>
                <Field
                  label="Type of company"
                  htmlFor="companyType"
                  bottomAlign
                  error={errors.companyType}
                >
                  <CustomSelect
                    id="companyType"
                    value={form.company.companyType}
                    onChange={(value) =>
                      updateCompany(
                        "companyType",
                        value as typeof form.company.companyType,
                      )
                    }
                    options={DOMESTIC_COMPANY_TYPE_OPTIONS}
                    placeholder="Select company type"
                    error={Boolean(errors.companyType)}
                  />
                </Field>
                <Field
                  label="Date of incorporation"
                  htmlFor="companyIncorporationDate"
                  bottomAlign
                  error={errors.companyIncorporationDate}
                >
                  <input
                    id="companyIncorporationDate"
                    type="date"
                    value={form.company.incorporationDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) =>
                      updateCompany("incorporationDate", event.target.value)
                    }
                    className={inputClass(
                      Boolean(errors.companyIncorporationDate),
                    )}
                  />
                </Field>
              </>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading
            title="Investment profile"
            description="Select the currency and expected investment range for this company."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Investment currency"
              htmlFor="companyInvestmentCurrency"
              error={errors.companyInvestmentCurrency}
            >
              <CustomSelect
                id="companyInvestmentCurrency"
                value={form.company.investmentCurrency}
                onChange={(value) => updateCompany("investmentCurrency", value)}
                options={INVESTMENT_CURRENCY_OPTIONS}
                placeholder="Select currency"
                error={Boolean(errors.companyInvestmentCurrency)}
              />
            </Field>
            <Field
              label="Expected investment amount"
              htmlFor="companyExpectedInvestment"
              error={errors.companyExpectedInvestment}
            >
              <CustomSelect
                id="companyExpectedInvestment"
                value={form.company.expectedInvestment}
                onChange={(value) => updateCompany("expectedInvestment", value)}
                options={INVESTMENT_AMOUNT_OPTIONS}
                placeholder="Select investment range"
                error={Boolean(errors.companyExpectedInvestment)}
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}
