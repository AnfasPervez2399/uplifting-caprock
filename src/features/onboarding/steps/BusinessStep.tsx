import { BriefcaseBusiness } from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";

import {
  ASSESSMENT_OPTIONS,
  BUSINESS_ACTIVITY_OPTIONS,
  BUSINESS_NATURE_OPTIONS,
  COUNTRY_OPTIONS,
} from "../config";
import {
  BinaryChoice,
  Field,
  SectionIntro,
  SubsectionHeading,
  inputClass,
  textareaClass,
} from "../components/FormPrimitives";

import type { OnboardingController } from "../useOnboardingController";

interface StepProps {
  controller: OnboardingController;
}

export function BusinessStep({ controller }: StepProps) {
  const {
    form,
    errors,
    sectionEyebrow,
    updateBusiness,
    handleAssessmentNatureChange,
    handleForeignBusinessCountryChange,
    handleBusinessActivityChange,
    handleUsCitizenChange,
    handleUsTaxResidentChange,
  } = controller;

  const renderBusiness = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("business")}
        title="Business"
        description="Provide the Sole Trader assessment and business information required for this application."
        icon={BriefcaseBusiness}
      />

      <div className="space-y-8">
        <section>
          <SubsectionHeading
            title="Sole Trader assessment"
            description="Confirm whether the Sole Trader is assessed as Australian or foreign. Additional fields appear where required."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div
              className={
                form.business.assessmentNature === "foreign"
                  ? ""
                  : "sm:col-span-2"
              }
            >
              <Field
                label="Individual assessment nature"
                htmlFor="assessmentNature"
                error={errors.assessmentNature}
              >
                <CustomSelect
                  id="assessmentNature"
                  value={form.business.assessmentNature}
                  onChange={handleAssessmentNatureChange}
                  options={ASSESSMENT_OPTIONS}
                  placeholder="Select Australian or foreign"
                  error={Boolean(errors.assessmentNature)}
                />
              </Field>
            </div>
            {form.business.assessmentNature === "foreign" ? (
              <Field
                label="Country of foreign business"
                htmlFor="foreignBusinessCountry"
                error={errors.foreignBusinessCountry}
              >
                <CustomSelect
                  id="foreignBusinessCountry"
                  value={form.business.foreignBusinessCountry}
                  onChange={handleForeignBusinessCountryChange}
                  options={COUNTRY_OPTIONS}
                  placeholder="Select a country"
                  searchable
                  searchPlaceholder="Search countries"
                  error={Boolean(errors.foreignBusinessCountry)}
                />
              </Field>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[rgba(0,52,120,0.025)] p-5 sm:p-6">
          <SubsectionHeading
            title="Business details"
            description="Enter the legal business details used by the Sole Trader."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Business name"
              htmlFor="businessName"
              error={errors.businessName}
            >
              <input
                id="businessName"
                value={form.business.businessName}
                onChange={(event) =>
                  updateBusiness("businessName", event.target.value)
                }
                placeholder="Name under which the business is carried out"
                className={inputClass(Boolean(errors.businessName))}
              />
            </Field>
            {form.business.assessmentNature === "australian" ? (
              <Field
                label="Australian Business Number (ABN)"
                htmlFor="abn"
                error={errors.abn}
              >
                <input
                  id="abn"
                  value={form.business.abn}
                  onChange={(event) =>
                    updateBusiness("abn", event.target.value)
                  }
                  inputMode="numeric"
                  placeholder="11-digit ABN"
                  className={inputClass(Boolean(errors.abn))}
                />
              </Field>
            ) : null}
            <div className="sm:col-span-2">
              <Field
                label="Address of principal place of business"
                htmlFor="principalBusinessAddress"
                error={errors.principalBusinessAddress}
              >
                <textarea
                  id="principalBusinessAddress"
                  value={form.business.principalBusinessAddress}
                  onChange={(event) =>
                    updateBusiness(
                      "principalBusinessAddress",
                      event.target.value,
                    )
                  }
                  placeholder="Principal place of business"
                  className={textareaClass(
                    Boolean(errors.principalBusinessAddress),
                  )}
                />
              </Field>
            </div>
          </div>
        </section>

        {form.business.assessmentNature === "foreign" ? (
          <>
            <section>
              <SubsectionHeading
                title="Business activity and funds"
                description="Provide the major business nature, activity and intended account use documented for a foreign Sole Trader."
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Business nature (major business)"
                  htmlFor="investorClassification"
                  error={errors.investorClassification}
                >
                  <CustomSelect
                    id="investorClassification"
                    value={form.business.investorClassification}
                    onChange={(value) =>
                      updateBusiness("investorClassification", value)
                    }
                    options={BUSINESS_NATURE_OPTIONS}
                    placeholder="Select business nature"
                    error={Boolean(errors.investorClassification)}
                  />
                </Field>
                <Field
                  label="Describe the business activity"
                  htmlFor="businessActivity"
                  error={errors.businessActivity}
                >
                  <CustomSelect
                    id="businessActivity"
                    value={form.business.businessActivity}
                    onChange={handleBusinessActivityChange}
                    options={BUSINESS_ACTIVITY_OPTIONS}
                    placeholder="Select business activity"
                    error={Boolean(errors.businessActivity)}
                  />
                </Field>
                {form.business.businessActivity === "Other" ? (
                  <div className="sm:col-span-2">
                    <Field
                      label="Please specify the business activity"
                      htmlFor="businessActivityOther"
                      error={errors.businessActivityOther}
                    >
                      <input
                        id="businessActivityOther"
                        value={form.business.businessActivityOther}
                        onChange={(event) =>
                          updateBusiness(
                            "businessActivityOther",
                            event.target.value,
                          )
                        }
                        placeholder="For example, IT services"
                        className={inputClass(
                          Boolean(errors.businessActivityOther),
                        )}
                      />
                    </Field>
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <Field
                    label="Source of funds, including origin"
                    htmlFor="sourceOfFunds"
                    error={errors.sourceOfFunds}
                  >
                    <textarea
                      id="sourceOfFunds"
                      value={form.business.sourceOfFunds}
                      onChange={(event) =>
                        updateBusiness("sourceOfFunds", event.target.value)
                      }
                      placeholder="Describe where the funds came from and their origin"
                      className={textareaClass(Boolean(errors.sourceOfFunds))}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Nature and level of intended transaction behaviour"
                    htmlFor="intendedTransactions"
                    error={errors.intendedTransactions}
                  >
                    <textarea
                      id="intendedTransactions"
                      value={form.business.intendedTransactions}
                      onChange={(event) =>
                        updateBusiness(
                          "intendedTransactions",
                          event.target.value,
                        )
                      }
                      placeholder="Describe the expected type, frequency and level of transactions"
                      className={textareaClass(
                        Boolean(errors.intendedTransactions),
                      )}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Beneficial ownership of funds used by this account"
                    htmlFor="beneficialOwnership"
                    error={errors.beneficialOwnership}
                  >
                    <textarea
                      id="beneficialOwnership"
                      value={form.business.beneficialOwnership}
                      onChange={(event) =>
                        updateBusiness(
                          "beneficialOwnership",
                          event.target.value,
                        )
                      }
                      placeholder="Describe who beneficially owns the funds"
                      className={textareaClass(
                        Boolean(errors.beneficialOwnership),
                      )}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {form.business.foreignBusinessCountry === "United States" ? (
              <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
                <SubsectionHeading
                  title="U.S. tax status"
                  description="Complete the Sole Trader’s U.S. citizenship and tax-residency declarations."
                />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Are you a U.S. citizen?"
                    htmlFor="usCitizen"
                    error={errors.usCitizen}
                  >
                    <BinaryChoice
                      value={form.business.usCitizen}
                      onChange={handleUsCitizenChange}
                      ariaLabel="U.S. citizenship status"
                    />
                  </Field>
                  <Field
                    label="Are you a U.S. tax resident?"
                    htmlFor="usTaxResident"
                    error={errors.usTaxResident}
                  >
                    <BinaryChoice
                      value={form.business.usTaxResident}
                      onChange={handleUsTaxResidentChange}
                      ariaLabel="U.S. tax residency status"
                    />
                  </Field>
                  {form.business.usCitizen === "yes" ? (
                    <Field
                      label="Social Security Number"
                      htmlFor="socialSecurityNumber"
                      error={errors.socialSecurityNumber}
                    >
                      <input
                        id="socialSecurityNumber"
                        value={form.business.socialSecurityNumber}
                        onChange={(event) =>
                          updateBusiness(
                            "socialSecurityNumber",
                            event.target.value,
                          )
                        }
                        placeholder="Enter Social Security Number"
                        className={inputClass(
                          Boolean(errors.socialSecurityNumber),
                        )}
                      />
                    </Field>
                  ) : null}
                  {form.business.usTaxResident === "yes" ? (
                    <Field
                      label="U.S. tax identification number"
                      htmlFor="taxIdentificationNumber"
                      error={errors.taxIdentificationNumber}
                    >
                      <input
                        id="taxIdentificationNumber"
                        value={form.business.taxIdentificationNumber}
                        onChange={(event) =>
                          updateBusiness(
                            "taxIdentificationNumber",
                            event.target.value,
                          )
                        }
                        placeholder="Enter tax identification number"
                        className={inputClass(
                          Boolean(errors.taxIdentificationNumber),
                        )}
                      />
                    </Field>
                  ) : null}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );

  return renderBusiness();
}
