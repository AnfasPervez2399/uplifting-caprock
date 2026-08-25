import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { isAtLeastAge } from "../../components/ui/DatePicker";
import { useLoader } from "../../components/ui/LoaderProvider";
import { APPLICATION_OPTIONS, BANK_CURRENCY_OPTIONS, getRequiredEntityDocuments, getStepsForApplication } from "./config";
import {
  createEmptyBank,
  emptyAdviserDraft,
  emptyJointDraft,
  initialFormState,
} from "./initialState";
import type {
  AddressDocumentType,
  ApplicationType,
  AdviserDraft,
  AssessmentNature,
  BankAccount,
  BusinessState,
  CompanyDirector,
  CompanyShareholder,
  CompanyState,
  DocumentPreview,
  FormState,
  JointApplicant,
  JointApplicantDraft,
  PersonalState,
  PhotoIdType,
  ProofFileField,
  SignatureState,
  StepId,
  TrustParty,
  TrustState,
  UploadedDocument,
  YesNo,
} from "./types";
import {
  displayNameFromEmail,
  documentFromFile,
  formatApplicantName,
  hasCompleteApplicantProof,
  isCompleteJointPersonal,
  isJointType,
  isValidEmail,
  usesSharedAddress,
} from "./utils";
import {
  hasCompletePercentageLayer,
  isBeneficiariesComplete,
  isCompanyApplication,
  isCompanyBusinessComplete,
  isCompanyDirectorsComplete,
  isCompanyProfileComplete,
  isCompanyShareholdersComplete,
  isCompleteShareholder,
  isIndividualApplication,
  isShareholderApplicationComplete,
  isTrustApplication,
  isTrustBusinessComplete,
  isTrustProfileComplete,
  isTrusteesComplete,
  percentageTotal,
  requiresShareholderApplication,
} from "./applicationLogic";

export function useOnboardingController() {
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [loggedUserEmail] = useState(() => sessionStorage.getItem("caprockUserEmail") || "alex.morgan@example.com");
  const loggedUserName = displayNameFromEmail(loggedUserEmail);
  const loggedUserRole = "Applicant";
  const loggedUserInitials = loggedUserName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [activeStepId, setActiveStepId] = useState<StepId>("application");
  const [applicationTypeConfirmed, setApplicationTypeConfirmed] = useState(false);
  const [jointDraft, setJointDraft] = useState<JointApplicantDraft>(emptyJointDraft);
  const [showJointComposer, setShowJointComposer] = useState(false);
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [lookupVerifiedAt, setLookupVerifiedAt] = useState("");
  const lookupRequestRef = useRef(0);
  const [bankDraft, setBankDraft] = useState<BankAccount | null>(createEmptyBank());
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<DocumentPreview | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const previewDialogRef = useRef<HTMLDivElement>(null);
  const previewCloseButtonRef = useRef<HTMLButtonElement>(null);
  const previewReturnFocusRef = useRef<HTMLElement | null>(null);
  const [showAdviserInvite, setShowAdviserInvite] = useState(false);
  const [adviserDraft, setAdviserDraft] = useState<AdviserDraft>(emptyAdviserDraft);
  const [adviserError, setAdviserError] = useState("");
  const adviserDialogRef = useRef<HTMLDivElement>(null);
  const adviserNameInputRef = useRef<HTMLInputElement>(null);
  const adviserReturnFocusRef = useRef<HTMLElement | null>(null);
  const [isInvitingAdviser, setIsInvitingAdviser] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const isSaving = draftStatus === "saving";
  const draftRequestRef = useRef(false);
  const draftSaveTimerRef = useRef<number | null>(null);
  const draftResetTimerRef = useRef<number | null>(null);
  const previousFormRef = useRef(form);
  const latestFormRef = useRef(form);
  latestFormRef.current = form;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRequestRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionConfirmationOpen, setSubmissionConfirmationOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const applicationType = form.personal.applicationType;
  const isJoint = isJointType(applicationType);
  const sharedAddress = usesSharedAddress(applicationType);
  const isSoleTrader = applicationType === "sole-trader";
  const isCompany = isCompanyApplication(applicationType);
  const isTrust = isTrustApplication(applicationType);
  const isIndividual = isIndividualApplication(applicationType);
  const isPublicCompany = isCompany && form.company.companyType === "public";
  const applicationSteps = useMemo(
    () => getStepsForApplication(applicationType).filter((step) => !(isPublicCompany && step.id === "shareholders")),
    [applicationType, isPublicCompany],
  );
  const visibleSteps = useMemo(
    () => applicationTypeConfirmed ? applicationSteps : getStepsForApplication(""),
    [applicationSteps, applicationTypeConfirmed],
  );
  const activeStepIndex = visibleSteps.findIndex((step) => step.id === activeStepId);
  const mainApplicantFullName = formatApplicantName(form.personal);
  const selectedApplicationOption = APPLICATION_OPTIONS.find((option) => option.value === applicationType);
  const selectedApplicationType = selectedApplicationOption?.label || "Not selected";
  const applicationHeaderTitle = selectedApplicationOption?.headerTitle || "Choose application type";
  const proofApplicantProfiles = useMemo(
    () => [
      { key: "main", label: "Main applicant", name: mainApplicantFullName || "Main applicant", country: form.personal.applicantCountry },
      ...(isJoint
        ? form.jointApplicants.map((applicant, index) => ({
            key: applicant.id,
            label: `Joint applicant ${index + 1}`,
            name: applicant.firstName || `Joint applicant ${index + 1}`,
            country: applicant.applicantCountry || form.personal.applicantCountry,
          }))
        : []),
    ],
    [form.jointApplicants, form.personal.applicantCountry, isJoint, mainApplicantFullName],
  );

  const personalComplete = useMemo(() => {
    if (!isIndividual) return true;
    const mainApplicantComplete = Boolean(
      form.personal.applicantCountry && form.personal.firstName.trim() && form.personal.lastName.trim() &&
      form.personal.formerNames.trim() && isAtLeastAge(form.personal.dateOfBirth, 18) &&
      form.personal.residentialAddress.trim() && form.personal.investmentCurrency && form.personal.expectedInvestment,
    );
    if (!mainApplicantComplete) return false;
    if (!isJoint) return true;
    return form.jointApplicants.length > 0 && form.jointApplicants.every((applicant) => isCompleteJointPersonal(applicant, sharedAddress));
  }, [form.jointApplicants, form.personal, isIndividual, isJoint, sharedAddress]);

  const foreignSoleTraderComplete = useMemo(() => {
    if (!isSoleTrader || form.business.assessmentNature !== "foreign") return true;
    const isUnitedStates = form.business.foreignBusinessCountry === "United States";
    return Boolean(
      form.business.foreignBusinessCountry && form.business.investorClassification && form.business.businessActivity &&
      (form.business.businessActivity !== "Other" || form.business.businessActivityOther.trim()) &&
      form.business.sourceOfFunds.trim() && form.business.intendedTransactions.trim() && form.business.beneficialOwnership.trim() &&
      (!isUnitedStates || (form.business.usCitizen &&
        (form.business.usCitizen !== "yes" || form.business.socialSecurityNumber.trim()) &&
        form.business.usTaxResident &&
        (form.business.usTaxResident !== "yes" || form.business.taxIdentificationNumber.trim()))),
    );
  }, [form.business, isSoleTrader]);

  const businessComplete = useMemo(() => {
    if (isCompany) return isCompanyBusinessComplete(applicationType, form.company);
    if (isTrust) return isTrustBusinessComplete(applicationType, form.trust);
    if (!isSoleTrader) return true;
    return Boolean(
      form.business.assessmentNature && form.business.businessName.trim() && form.business.principalBusinessAddress.trim() &&
      (form.business.assessmentNature !== "australian" || form.business.abn.trim()) && foreignSoleTraderComplete,
    );
  }, [applicationType, form.business, form.company, form.trust, foreignSoleTraderComplete, isCompany, isSoleTrader, isTrust]);

  const companyProfileComplete = isCompanyProfileComplete(applicationType, form.company);
  const directorsComplete = !isCompany || isCompanyDirectorsComplete(form.company, form.directors);
  const shareholderPercentageTotal = percentageTotal(form.shareholders);
  const canConfirmShareholders = hasCompletePercentageLayer(form.shareholders) &&
    form.shareholders.every(isCompleteShareholder);
  const shareholdersComplete = !isCompany || isPublicCompany || isCompanyShareholdersComplete(form.company, form.shareholders);
  const trustProfileComplete = isTrustProfileComplete(applicationType, form.trust);
  const trusteesComplete = !isTrust || isTrusteesComplete(form.trust, form.trustees);
  const beneficiariesComplete = !isTrust || isBeneficiariesComplete(form.trust, form.beneficiaries);
  const identityComplete = !isIndividual || Boolean(form.identity.selfie);
  const bankComplete = form.bankAccounts.length > 0 && form.bankAccounts.every((account) => Boolean(
    account.bankName.trim() && account.swiftCode.trim() && account.bankAddress.trim() &&
    account.accountNumber.trim() && account.currency && account.verificationDocument,
  ));
  const cashAccountsComplete = form.cashAccounts.length > 0 && new Set(form.cashAccounts).size === form.cashAccounts.length;
  const signatureComplete = Boolean(
    form.signature.name.trim() && isValidEmail(form.signature.email) && form.signature.phone.trim() && isAtLeastAge(form.signature.dateOfBirth, 18),
  );
  const requiredEntityDocuments = getRequiredEntityDocuments(applicationType, form.company.companyType);
  const documentsComplete = isIndividual
    ? proofApplicantProfiles.every((applicant) => hasCompleteApplicantProof(form.documents[applicant.key], applicant.country))
    : requiredEntityDocuments.length > 0 && requiredEntityDocuments.every((document) => Boolean(form.entityDocuments[document.key]));

  const sectionCompletion: Omit<Record<StepId, boolean>, "review"> = {
    application: Boolean(applicationType && applicationTypeConfirmed),
    personal: personalComplete,
    entity: companyProfileComplete,
    trust: trustProfileComplete,
    business: businessComplete,
    directors: directorsComplete,
    shareholders: shareholdersComplete,
    trustees: trusteesComplete,
    beneficiaries: beneficiariesComplete,
    identity: identityComplete,
    bank: bankComplete,
    cash: cashAccountsComplete,
    documents: documentsComplete,
    signature: signatureComplete,
  };
  const allApplicationSectionsComplete = visibleSteps
    .filter((step) => step.id !== "review")
    .every((step) => sectionCompletion[step.id as Exclude<StepId, "review">]);
  const completion: Record<StepId, boolean> = {
    ...sectionCompletion,
    review: allApplicationSectionsComplete && form.agreements.accurate && form.agreements.consent,
  };
  const applicationSectionCount = visibleSteps.filter((step) => step.id !== "review").length;
  const completedSectionCount = visibleSteps.filter((step) => step.id !== "review" && completion[step.id]).length;
  const progressPercent = Math.round((completedSectionCount / Math.max(1, applicationSectionCount)) * 100);
  const sectionEyebrow = (stepId: StepId) => `Section ${visibleSteps.findIndex((step) => step.id === stepId) + 1} of ${visibleSteps.length}`;

  useEffect(() => {
    const formChanged = previousFormRef.current !== form;
    previousFormRef.current = form;
    if (formChanged && draftStatus === "saved") setDraftStatus("idle");
  }, [draftStatus, form]);

  useEffect(() => () => {
    if (draftSaveTimerRef.current) window.clearTimeout(draftSaveTimerRef.current);
    if (draftResetTimerRef.current) window.clearTimeout(draftResetTimerRef.current);
    draftRequestRef.current = false;
    submissionRequestRef.current = false;
  }, []);

  const openDocumentPreview = (uploadedDocument: UploadedDocument, label: string) => {
    previewReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDocumentPreview({ document: uploadedDocument, label });
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("caprockUserEmail");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!notificationsOpen && !userMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationsOpen && !notificationsRef.current?.contains(target)) setNotificationsOpen(false);
      if (userMenuOpen && !userMenuRef.current?.contains(target)) setUserMenuOpen(false);
    };
    const handlePopoverKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNotificationsOpen(false);
      setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handlePopoverKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handlePopoverKeyDown);
    };
  }, [notificationsOpen, userMenuOpen]);

  useEffect(() => {
    if (!documentPreview) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => previewCloseButtonRef.current?.focus());

    const handlePreviewKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDocumentPreview(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        previewDialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], iframe, [tabindex]:not([tabindex="-1"])',
        ) || [],
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handlePreviewKeyDown);
    return () => {
      document.removeEventListener("keydown", handlePreviewKeyDown);
      document.body.style.overflow = previousOverflow;
      previewReturnFocusRef.current?.focus();
    };
  }, [documentPreview]);

  useEffect(() => {
    if (visibleSteps.some((step) => step.id === activeStepId)) return;
    setActiveStepId(visibleSteps[0]?.id || "application");
  }, [activeStepId, visibleSteps]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrors({});
    setNotice("");
    setSuccessNotice("");
  }, [activeStepId]);

  useEffect(() => {
    if (!showAdviserInvite) return;

    adviserReturnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => adviserNameInputRef.current?.focus());

    const handleDialogKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowAdviserInvite(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        adviserDialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ) || [],
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      adviserReturnFocusRef.current?.focus();
    };
  }, [showAdviserInvite]);

  const updatePersonal = <K extends keyof PersonalState>(key: K, value: PersonalState[K]) => {
    setForm((current) => ({
      ...current,
      personal: { ...current.personal, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const updateCompany = <K extends keyof CompanyState>(key: K, value: CompanyState[K]) => {
    setForm((current) => ({ ...current, company: { ...current.company, [key]: value } }));
    setErrors((current) => ({ ...current, [key]: "", entity: "", business: "" }));
  };

  const updateTrust = <K extends keyof TrustState>(key: K, value: TrustState[K]) => {
    setForm((current) => ({ ...current, trust: { ...current.trust, [key]: value } }));
    setErrors((current) => ({ ...current, [key]: "", trust: "", business: "" }));
  };

  const handleCompanyUsRegisteredChange = (value: string) => {
    const usRegistered = value as YesNo;
    setForm((current) => ({
      ...current,
      company: {
        ...current.company,
        usRegistered,
        usTaxId: usRegistered === "yes" ? current.company.usTaxId : "",
      },
    }));
    setErrors((current) => ({ ...current, usRegistered: "", usTaxId: "" }));
  };

  const addDirector = (director: CompanyDirector) => {
    setForm((current) => {
      const directors = [...current.directors, director];
      return {
        ...current,
        directors,
        company: { ...current.company, directorCount: String(directors.length) },
      };
    });
    setErrors((current) => ({ ...current, directors: "", directorCount: "", defaultDirector: "" }));
  };

  const removeDirector = (id: string) => {
    setForm((current) => {
      const directors = current.directors.filter((director) => director.id !== id);
      return {
        ...current,
        directors,
        company: {
          ...current.company,
          directorCount: String(directors.length),
          defaultRecipientId: current.company.defaultRecipientId === id ? "" : current.company.defaultRecipientId,
        },
      };
    });
  };

  const addShareholder = (shareholder: CompanyShareholder) => {
    setForm((current) => {
      const shareholders = [...current.shareholders, shareholder];
      return {
        ...current,
        shareholders,
        company: {
          ...current.company,
          shareholderCount: String(shareholders.length),
          shareholdersConfirmed: false,
        },
      };
    });
    setErrors((current) => ({ ...current, shareholders: "", shareholderCount: "", shareholderTotal: "" }));
  };

  const updateShareholder = (shareholder: CompanyShareholder) => {
    setForm((current) => ({
      ...current,
      shareholders: current.shareholders.map((saved) => saved.id === shareholder.id ? shareholder : saved),
    }));
    setErrors((current) => ({ ...current, shareholders: "" }));
  };

  const removeShareholder = (id: string) => {
    setForm((current) => {
      const shareholders = current.shareholders.filter((shareholder) => shareholder.id !== id);
      return {
        ...current,
        shareholders,
        company: {
          ...current.company,
          shareholderCount: String(shareholders.length),
          shareholdersConfirmed: false,
        },
      };
    });
    setErrors((current) => ({ ...current, shareholders: "", shareholderTotal: "" }));
  };

  const confirmAllShareholders = () => {
    if (!canConfirmShareholders) {
      const totalComplete = hasCompletePercentageLayer(form.shareholders);
      setErrors((current) => ({
        ...current,
        shareholders: totalComplete
          ? "Complete every shareholder record before saving the ownership structure."
          : "Shareholder ownership must total exactly 100% before all shareholders can be saved.",
        shareholderTotal: totalComplete ? "" : "Adjust ownership so the total equals exactly 100%.",
      }));
      setSuccessNotice("");
      setNotice(totalComplete
        ? "Complete every shareholder’s type and contact details before saving."
        : `The current shareholder total is ${shareholderPercentageTotal.toFixed(2).replace(/\.00$/, "")}% and must equal 100%.`);
      return;
    }
    setForm((current) => ({
      ...current,
      company: { ...current.company, shareholdersConfirmed: true },
    }));
    setErrors((current) => ({ ...current, shareholders: "", shareholderTotal: "" }));
    setNotice("");
    setSuccessNotice("The 100% direct ownership structure is saved. Shareholder applications and interconnection layers are now available.");
  };

  const addTrustParty = (kind: "trustees" | "beneficiaries", party: TrustParty) => {
    setForm((current) => {
      const parties = [...current[kind], party];
      return {
        ...current,
        [kind]: parties,
        trust: {
          ...current.trust,
          [kind === "trustees" ? "trusteeCount" : "beneficiaryCount"]: String(parties.length),
        },
      };
    });
    const countErrorKey = kind === "trustees" ? "trusteeCount" : "beneficiaryCount";
    setErrors((current) => ({ ...current, [kind]: "", [countErrorKey]: "", defaultTrustee: "" }));
  };

  const removeTrustParty = (kind: "trustees" | "beneficiaries", id: string) => {
    setForm((current) => {
      const parties = current[kind].filter((party) => party.id !== id);
      return {
        ...current,
        [kind]: parties,
        trust: {
          ...current.trust,
          [kind === "trustees" ? "trusteeCount" : "beneficiaryCount"]: String(parties.length),
          defaultRecipientId: kind === "trustees" && current.trust.defaultRecipientId === id
            ? ""
            : current.trust.defaultRecipientId,
        },
      };
    });
  };

  const updateEntityDocument = (key: string, file?: File) => {
    setForm((current) => ({
      ...current,
      entityDocuments: { ...current.entityDocuments, [key]: documentFromFile(file) },
    }));
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const updateCashAccounts = (currencies: string[]) => {
    const allowedCurrencies = new Set(BANK_CURRENCY_OPTIONS.map((option) => option.value));
    const uniqueCurrencies = [...new Set(currencies)].filter((currency) => allowedCurrencies.has(currency));
    setForm((current) => ({ ...current, cashAccounts: uniqueCurrencies }));
    setErrors((current) => ({ ...current, cashAccounts: "" }));
  };

  const updateBusiness = <K extends keyof BusinessState>(key: K, value: BusinessState[K]) => {
    setForm((current) => ({
      ...current,
      business: { ...current.business, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleAssessmentNatureChange = (value: string) => {
    const assessmentNature = value as AssessmentNature;
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        assessmentNature,
        ...(assessmentNature === "australian"
          ? {
              foreignBusinessCountry: "",
              investorClassification: "",
              businessActivity: "",
              businessActivityOther: "",
              sourceOfFunds: "",
              intendedTransactions: "",
              beneficialOwnership: "",
              usCitizen: "" as YesNo,
              socialSecurityNumber: "",
              usTaxResident: "" as YesNo,
              taxIdentificationNumber: "",
            }
          : { abn: "" }),
      },
    }));
    setErrors((current) => ({
      ...current,
      assessmentNature: "",
      abn: "",
      foreignBusinessCountry: "",
      investorClassification: "",
      businessActivity: "",
      businessActivityOther: "",
      sourceOfFunds: "",
      intendedTransactions: "",
      beneficialOwnership: "",
      usCitizen: "",
      socialSecurityNumber: "",
      usTaxResident: "",
      taxIdentificationNumber: "",
    }));
  };

  const handleForeignBusinessCountryChange = (value: string) => {
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        foreignBusinessCountry: value,
        ...(value === "United States"
          ? {}
          : {
              usCitizen: "" as YesNo,
              socialSecurityNumber: "",
              usTaxResident: "" as YesNo,
              taxIdentificationNumber: "",
            }),
      },
    }));
    setErrors((current) => ({
      ...current,
      foreignBusinessCountry: "",
      usCitizen: "",
      socialSecurityNumber: "",
      usTaxResident: "",
      taxIdentificationNumber: "",
    }));
  };

  const handleBusinessActivityChange = (value: string) => {
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        businessActivity: value,
        businessActivityOther: value === "Other" ? current.business.businessActivityOther : "",
      },
    }));
    setErrors((current) => ({ ...current, businessActivity: "", businessActivityOther: "" }));
  };

  const handleUsCitizenChange = (value: string) => {
    const usCitizen = value as YesNo;
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        usCitizen,
        socialSecurityNumber: usCitizen === "yes" ? current.business.socialSecurityNumber : "",
      },
    }));
    setErrors((current) => ({ ...current, usCitizen: "", socialSecurityNumber: "" }));
  };

  const handleUsTaxResidentChange = (value: string) => {
    const usTaxResident = value as YesNo;
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        usTaxResident,
        taxIdentificationNumber: usTaxResident === "yes" ? current.business.taxIdentificationNumber : "",
      },
    }));
    setErrors((current) => ({ ...current, usTaxResident: "", taxIdentificationNumber: "" }));
  };

  const updateSignature = <K extends keyof SignatureState>(key: K, value: SignatureState[K]) => {
    setForm((current) => ({
      ...current,
      signature: { ...current.signature, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleApplicationTypeChange = (value: string) => {
    const nextType = value as ApplicationType;
    setApplicationTypeConfirmed(false);
    setForm((current) => ({
      ...current,
      personal: { ...current.personal, applicationType: nextType },
      company: nextType === current.personal.applicationType
        ? current.company
        : { ...current.company, companyType: "" },
      jointApplicants: isJointType(nextType) ? current.jointApplicants : [],
      documents: { main: current.documents.main || {} },
    }));
    setErrors((current) => ({ ...current, applicationType: "", jointApplicants: "" }));
    if (!isJointType(nextType)) {
      lookupRequestRef.current += 1;
      setShowJointComposer(false);
      setJointDraft(emptyJointDraft);
      setLookupState("idle");
      setLookupVerifiedAt("");
    }
  };

  const updateJointDraft = (key: keyof JointApplicantDraft, value: string) => {
    setJointDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, jointApplicants: "" }));
    if (key === "clientId") {
      lookupRequestRef.current += 1;
      setLookupState("idle");
      setLookupVerifiedAt("");
    }
  };

  const beginJointApplicant = () => {
    lookupRequestRef.current += 1;
    setJointDraft(emptyJointDraft);
    setLookupState("idle");
    setLookupVerifiedAt("");
    setShowJointComposer(true);
  };

  const handleLookupClient = () => {
    const requestId = ++lookupRequestRef.current;
    if (jointDraft.clientId.trim().length < 5) {
      setLookupState("error");
      setLookupVerifiedAt("");
      return;
    }
    setLookupState("loading");
    setLookupVerifiedAt("");
    window.setTimeout(() => {
      if (lookupRequestRef.current !== requestId) return;
      setJointDraft((current) => ({
        ...current,
        applicantCountry: current.applicantCountry || form.personal.applicantCountry || "Australia",
      }));
      setLookupState("found");
      setLookupVerifiedAt(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }, 700);
  };

  const saveJointApplicant = () => {
    const isExisting = jointDraft.method === "existing";
    const invitationName = jointDraft.firstName.trim();
    const invitationEmail = jointDraft.email.trim();
    const separateAddress = jointDraft.residentialAddress.trim();
    const valid = isExisting
      ? lookupState === "found" && Boolean(jointDraft.clientId.trim())
      : Boolean(
          invitationName &&
            isValidEmail(invitationEmail) &&
            (sharedAddress || separateAddress),
        );

    if (!valid) {
      setErrors((current) => ({
        ...current,
        jointApplicants: isExisting
          ? "Verify the Caprock client ID before adding this applicant."
          : sharedAddress
            ? "Enter the applicant’s full name and a valid email address."
            : "Enter the applicant’s full name, a valid email address and residential address.",
      }));
      return;
    }

    const applicant: JointApplicant = {
      id: `joint-${Date.now()}`,
      method: jointDraft.method,
      clientId: isExisting ? jointDraft.clientId.trim() : "",
      firstName: isExisting ? `Verified client · ${jointDraft.clientId.trim().toUpperCase()}` : invitationName,
      middleName: "",
      lastName: "",
      formerNames: isExisting ? "Verified on file" : "",
      email: isExisting ? "" : invitationEmail,
      dateOfBirth: "",
      applicantCountry: form.personal.applicantCountry,
      residentialAddress: isExisting
        ? "Verified on file"
        : sharedAddress
          ? ""
          : separateAddress,
      confirmed: true,
    };

    setForm((current) => ({ ...current, jointApplicants: [...current.jointApplicants, applicant] }));
    setJointDraft(emptyJointDraft);
    setLookupState("idle");
    setLookupVerifiedAt("");
    setShowJointComposer(false);
    setErrors((current) => ({ ...current, jointApplicants: "" }));
    setNotice("");
    setSuccessNotice(
      isExisting
        ? "Verified client added to the joint application."
        : `Invitation added for ${invitationName}.`,
    );
  };

  const removeJointApplicant = (id: string) => {
    setForm((current) => {
      const nextDocuments = { ...current.documents };
      delete nextDocuments[id];
      return {
        ...current,
        jointApplicants: current.jointApplicants.filter((applicant) => applicant.id !== id),
        documents: nextDocuments,
      };
    });
  };

  const updateBankDraft = <K extends keyof BankAccount>(key: K, value: BankAccount[K]) => {
    setBankDraft((current) => (current ? { ...current, [key]: value } : current));
    setErrors((current) => ({ ...current, bankDraft: "" }));
  };

  const saveBankAccount = () => {
    if (!bankDraft) return;
    const complete = Boolean(
      bankDraft.bankName.trim() &&
        bankDraft.swiftCode.trim() &&
        bankDraft.bankAddress.trim() &&
        bankDraft.accountNumber.trim() &&
        bankDraft.currency &&
        bankDraft.verificationDocument,
    );
    if (!complete) {
      setErrors((current) => ({
        ...current,
        bankDraft: "Complete every required bank field and attach verification evidence.",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      bankAccounts: editingBankId
        ? current.bankAccounts.map((account) => (account.id === editingBankId ? bankDraft : account))
        : [...current.bankAccounts, bankDraft],
    }));
    setEditingBankId(null);
    setBankDraft(null);
    setErrors((current) => ({ ...current, bank: "", bankDraft: "" }));
  };

  const editBankAccount = (account: BankAccount) => {
    setBankDraft({ ...account });
    setEditingBankId(account.id);
  };

  const removeBankAccount = (id: string) => {
    setForm((current) => ({
      ...current,
      bankAccounts: current.bankAccounts.filter((account) => account.id !== id),
    }));
    if (editingBankId === id) {
      setEditingBankId(null);
      setBankDraft(null);
    }
  };

  const updateSelfie = (file?: File) => {
    if (!file) {
      setForm((current) => ({ ...current, identity: {} }));
      setErrors((current) => ({ ...current, identity: "" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, identity: "Choose a JPG, PNG, HEIC or other image file." }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((current) => ({ ...current, identity: "The selfie must be 10 MB or smaller." }));
      return;
    }

    setForm((current) => ({
      ...current,
      identity: { selfie: documentFromFile(file) },
    }));
    setErrors((current) => ({ ...current, identity: "" }));
  };

  const updateApplicantDocument = (applicantKey: string, field: ProofFileField, file?: File) => {
    setForm((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [applicantKey]: {
          ...current.documents[applicantKey],
          [field]: documentFromFile(file),
        },
      },
    }));
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const updatePhotoIdType = (applicantKey: string, photoIdType: PhotoIdType) => {
    setForm((current) => {
      const currentDocuments = current.documents[applicantKey] || {};
      const clearsDuplicateSecondary = currentDocuments.secondaryPhotoIdType === photoIdType;
      return {
        ...current,
        documents: {
          ...current.documents,
          [applicantKey]: {
            ...currentDocuments,
            photoIdType,
            photoIdFront: undefined,
            photoIdBack: undefined,
            ...(clearsDuplicateSecondary
              ? {
                  secondaryPhotoIdType: "" as PhotoIdType,
                  secondaryPhotoIdFront: undefined,
                  secondaryPhotoIdBack: undefined,
                }
              : {}),
            ...(photoIdType === "driving-licence"
              ? { addressDocumentType: "" as AddressDocumentType, addressDocument: undefined }
              : {}),
          },
        },
      };
    });
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const updateSecondaryPhotoIdType = (applicantKey: string, requestedType: PhotoIdType) => {
    setForm((current) => {
      const currentDocuments = current.documents[applicantKey] || {};
      const secondaryPhotoIdType = requestedType === currentDocuments.photoIdType ? "" : requestedType;
      return {
        ...current,
        documents: {
          ...current.documents,
          [applicantKey]: {
            ...currentDocuments,
            secondaryPhotoIdType,
            secondaryPhotoIdFront: undefined,
            secondaryPhotoIdBack: undefined,
            ...(secondaryPhotoIdType === "driving-licence"
              ? { addressDocumentType: "" as AddressDocumentType, addressDocument: undefined }
              : {}),
          },
        },
      };
    });
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const updateAddressDocumentType = (applicantKey: string, addressDocumentType: AddressDocumentType) => {
    setForm((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [applicantKey]: {
          ...current.documents[applicantKey],
          addressDocumentType,
          addressDocument: undefined,
        },
      },
    }));
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const updateApplicantWebsite = (applicantKey: string, websiteUrl: string) => {
    setForm((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [applicantKey]: { ...current.documents[applicantKey], websiteUrl },
      },
    }));
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const validateStep = (stepId: StepId) => {
    const nextErrors: Record<string, string> = {};

    if (stepId === "application" && !applicationType) {
      nextErrors.applicationType = "Select an application type to begin.";
    }

    if (stepId === "entity" && !companyProfileComplete) {
      if (!form.company.name.trim()) nextErrors.companyName = "Enter the registered company name.";
      if (form.company.website.trim() && !/^https?:\/\//i.test(form.company.website.trim()) && !/^[a-z0-9.-]+\.[a-z]{2,}/i.test(form.company.website.trim())) nextErrors.companyWebsite = "Enter a valid website address.";
      if (!form.company.investmentCurrency) nextErrors.companyInvestmentCurrency = "Select an investment currency.";
      if (!form.company.expectedInvestment) nextErrors.companyExpectedInvestment = "Select the expected investment amount.";
      if (applicationType === "australian-company") {
        if (!form.company.registrationNumber.trim()) nextErrors.companyRegistrationNumber = "Enter the company registration number.";
        if (!form.company.stateOrTerritory) nextErrors.companyState = "Select the state or territory.";
        if (!form.company.companyType) nextErrors.companyType = "Select the company type.";
        if (!form.company.incorporationDate) nextErrors.companyIncorporationDate = "Enter the incorporation date.";
      } else if (applicationType === "asic-non-australian-company" && !form.company.arbn.trim()) {
        nextErrors.companyArbn = "Enter the Australian Registered Body Number.";
      } else if (applicationType === "non-australian-company" && !form.company.registrationNumber.trim()) {
        nextErrors.companyRegistrationNumber = "Enter the company registration number.";
      }
      nextErrors.entity = "Complete all required company-profile fields.";
    }

    if (stepId === "trust" && !trustProfileComplete) {
      if (!form.trust.name.trim()) nextErrors.trustName = "Enter the full name of the trust.";
      if (!form.trust.trusteeBusinessName.trim()) nextErrors.trustBusinessName = "Enter the trustee business name.";
      if (!form.trust.establishedCountry) nextErrors.trustEstablishedCountry = "Select the establishment country.";
      nextErrors.trust = "Complete all required trust-profile fields.";
    }

    if (stepId === "personal") {
      if (!form.personal.applicationType) nextErrors.applicationType = "Select an application type.";
      if (!form.personal.applicantCountry) nextErrors.applicantCountry = "Select the applicant country.";
      if (!form.personal.firstName.trim()) nextErrors.firstName = "Enter the applicant’s first name.";
      if (!form.personal.lastName.trim()) nextErrors.lastName = "Enter the applicant’s last name.";
      if (!form.personal.formerNames.trim()) nextErrors.formerNames = "Enter former names, or “None” if not applicable.";
      if (!form.personal.dateOfBirth) {
        nextErrors.dateOfBirth = "Enter the applicant’s date of birth.";
      } else if (!isAtLeastAge(form.personal.dateOfBirth, 18)) {
        nextErrors.dateOfBirth = "The applicant must be at least 18 years old.";
      }
      if (!form.personal.residentialAddress.trim()) nextErrors.residentialAddress = "Enter the residential address.";
      if (!form.personal.investmentCurrency) nextErrors.investmentCurrency = "Select an investment currency.";
      if (!form.personal.expectedInvestment) nextErrors.expectedInvestment = "Select the expected investment amount.";
      if (
        isJoint &&
        (form.jointApplicants.length === 0 ||
          form.jointApplicants.some((applicant) => !isCompleteJointPersonal(applicant, sharedAddress)))
      ) {
        nextErrors.jointApplicants = "Add at least one complete joint applicant invitation.";
      }
    }

    if (stepId === "business" && isSoleTrader) {
      if (!form.business.assessmentNature) nextErrors.assessmentNature = "Select the individual assessment nature.";
      if (!form.business.businessName.trim()) nextErrors.businessName = "Enter the business name.";
      if (!form.business.principalBusinessAddress.trim()) {
        nextErrors.principalBusinessAddress = "Enter the principal place of business.";
      }
      if (form.business.assessmentNature === "australian" && !form.business.abn.trim()) {
        nextErrors.abn = "Enter the Australian Business Number.";
      }
      if (form.business.assessmentNature === "foreign") {
        if (!form.business.foreignBusinessCountry) {
          nextErrors.foreignBusinessCountry = "Select the country of foreign business.";
        }
        if (!form.business.investorClassification) nextErrors.investorClassification = "Select the major business nature.";
        if (!form.business.businessActivity) nextErrors.businessActivity = "Select the business activity.";
        if (form.business.businessActivity === "Other" && !form.business.businessActivityOther.trim()) {
          nextErrors.businessActivityOther = "Describe the business activity.";
        }
        if (!form.business.sourceOfFunds.trim()) nextErrors.sourceOfFunds = "Describe the source and origin of funds.";
        if (!form.business.intendedTransactions.trim()) {
          nextErrors.intendedTransactions = "Describe the intended transaction behaviour.";
        }
        if (!form.business.beneficialOwnership.trim()) {
          nextErrors.beneficialOwnership = "Describe the beneficial ownership of the funds.";
        }
        if (form.business.foreignBusinessCountry === "United States") {
          if (!form.business.usCitizen) nextErrors.usCitizen = "Confirm U.S. citizenship status.";
          if (form.business.usCitizen === "yes" && !form.business.socialSecurityNumber.trim()) {
            nextErrors.socialSecurityNumber = "Enter the Social Security Number.";
          }
          if (!form.business.usTaxResident) nextErrors.usTaxResident = "Confirm U.S. tax residency status.";
          if (form.business.usTaxResident === "yes" && !form.business.taxIdentificationNumber.trim()) {
            nextErrors.taxIdentificationNumber = "Enter the tax identification number.";
          }
        }
      }
    }

    if (stepId === "business" && isCompany && !businessComplete) {
      if (!form.company.registeredAddress.trim()) nextErrors.companyRegisteredAddress = "Enter the registered address.";
      if (applicationType === "australian-company") {
        if (!form.company.registrationType) nextErrors.companyRegistrationType = "Select the ASIC registration type.";
        if (!form.company.acn.trim()) nextErrors.companyAcn = "Enter the Australian Company Number.";
        if (!form.company.amlActivity.trim()) nextErrors.companyAmlActivity = "Provide the compliance disclosure, or enter “None”.";
      } else {
        if (!form.company.companyType) nextErrors.companyType = "Select the company type.";
        if (!form.company.incorporationDate) nextErrors.companyIncorporationDate = "Enter the incorporation date.";
        if (!form.company.country) nextErrors.companyCountry = "Select the country of formation.";
        if (!form.company.principalAddress.trim()) nextErrors.companyPrincipalAddress = "Enter the principal business address.";
        if (!form.company.usRegistered) nextErrors.companyUsRegistered = "Confirm U.S. registration status.";
        if (form.company.usRegistered === "yes" && !form.company.usTaxId.trim()) nextErrors.companyUsTaxId = "Enter the U.S. Tax ID.";
        if (applicationType === "asic-non-australian-company" && !form.company.registeredByRelevantBody) nextErrors.companyRegisteredByRelevantBody = "Confirm registration with the relevant body.";
        if (applicationType === "non-australian-company") {
          if (!form.company.identificationNumber.trim()) nextErrors.companyIdentificationNumber = "Enter the registration-body identification number.";
          if (!form.company.domicileCountry) nextErrors.companyDomicileCountry = "Select the domicile country.";
        }
      }
      nextErrors.business = "Complete every required business, registration, address and tax field for this company type.";
    }
    if (stepId === "business" && isTrust && !businessComplete) {
      if (!form.trust.investmentCurrency) nextErrors.trustInvestmentCurrency = "Select an investment currency.";
      if (!form.trust.expectedInvestment) nextErrors.trustExpectedInvestment = "Select the expected investment amount.";
      if (!form.trust.establishedCountry) nextErrors.trustEstablishedCountry = "Select the establishment country.";
      if (!form.trust.settlorName.trim()) nextErrors.trustSettlor = "Enter the settlor’s full name.";
      if (!form.trust.address.trim()) nextErrors.trustAddress = "Enter the trust address.";
      if (!form.trust.applicantCountry) nextErrors.trustApplicantCountry = "Select the applicant country.";
      if (applicationType !== "regulated-trust" && !form.trust.afsLicenseNumber.trim()) nextErrors.trustAfsLicense = "Enter the Australian Financial Services Licence number.";
      nextErrors.business = "Complete every required trust investment, settlor, address and licence field.";
    }
    if (stepId === "directors" && !directorsComplete) {
      if (!form.directors.length) nextErrors.directorCount = "Add at least one director or partner.";
      if (!form.company.defaultRecipientId) nextErrors.defaultDirector = "Select a default communication recipient.";
      nextErrors.directors = "Add at least one complete director or partner and select a default communication recipient.";
    }
    if (stepId === "shareholders" && !shareholdersComplete) {
      if (!form.shareholders.length) nextErrors.shareholderCount = "Add at least one shareholder.";
      if (!hasCompletePercentageLayer(form.shareholders)) {
        nextErrors.shareholderTotal = "Direct shareholder ownership must total exactly 100%.";
      } else if (!form.company.shareholdersConfirmed) {
        nextErrors.shareholderTotal = "Select Save all shareholders to confirm the complete ownership structure.";
      }
      nextErrors.shareholders = form.company.shareholdersConfirmed
        ? "Complete every required shareholder application and each recursively disclosed 100% ownership layer."
        : "Complete the shareholder records, bring direct ownership to exactly 100%, then select Save all shareholders.";
    }
    if (stepId === "trustees" && !trusteesComplete) {
      if (!form.trustees.length) nextErrors.trusteeCount = "Add at least one trustee.";
      if (!form.trust.defaultRecipientId) nextErrors.defaultTrustee = "Select a default communication recipient.";
      nextErrors.trustees = "Add at least one complete trustee and select a default communication recipient.";
    }
    if (stepId === "beneficiaries" && !beneficiariesComplete) {
      if (!form.beneficiaries.length) nextErrors.beneficiaryCount = "Add at least one beneficiary.";
      nextErrors.beneficiaries = "Add at least one complete beneficiary record.";
    }

    if (stepId === "identity" && !identityComplete) {
      nextErrors.identity = "Take a selfie or choose a clear selfie image from your device.";
    }

    if (stepId === "bank" && !bankComplete) {
      nextErrors.bank = "Add at least one complete, verified external bank account.";
    }

    if (stepId === "cash" && !cashAccountsComplete) {
      nextErrors.cashAccounts = "Select at least one currency for a cash account.";
    }

    if (stepId === "signature") {
      if (!form.signature.name.trim()) nextErrors.signatureName = "Enter the authorised signatory’s name.";
      if (!isValidEmail(form.signature.email)) nextErrors.signatureEmail = "Enter a valid email address.";
      if (!form.signature.phone.trim()) nextErrors.signaturePhone = "Enter a phone number.";
      if (!form.signature.dateOfBirth) {
        nextErrors.signatureDateOfBirth = "Enter the signatory’s date of birth.";
      } else if (!isAtLeastAge(form.signature.dateOfBirth, 18)) {
        nextErrors.signatureDateOfBirth = "The authorised signatory must be at least 18 years old.";
      }
    }

    if (stepId === "documents" && !documentsComplete) {
      nextErrors.documents = isIndividual
        ? "Complete the main applicant’s proof requirements. Non-Australian applicants need two different photo IDs, address evidence where applicable, and either a CV or website."
        : `Upload all ${requiredEntityDocuments.length} required entity document${requiredEntityDocuments.length === 1 ? "" : "s"}.`;
    }

    if (stepId === "review") {
      if (!allApplicationSectionsComplete) nextErrors.review = "Complete every application section before submitting.";
      if (!form.agreements.accurate || !form.agreements.consent) {
        nextErrors.agreements = "Confirm both declarations before submitting.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSuccessNotice("");
      setNotice(Object.values(nextErrors)[0] || "Please review the highlighted information before continuing.");
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const feedback = document.getElementById("application-error-summary");
          feedback?.scrollIntoView({ behavior: "smooth", block: "center" });
          feedback?.focus({ preventScroll: true });
        });
      });
      return false;
    }
    setNotice("");
    return true;
  };

  const goToStep = (stepId: StepId) => {
    if (stepId === "application") setApplicationTypeConfirmed(false);
    setActiveStepId(stepId);
    setMobileNavOpen(false);
  };

  const goBack = () => {
    if (activeStepIndex > 0) goToStep(visibleSteps[activeStepIndex - 1].id);
  };

  const goNext = () => {
    if (isSubmitting || submissionRequestRef.current || (activeStepId === "review" && submitted)) return;
    if (activeStepId === "application") {
      if (!validateStep("application")) return;
      const firstTailoredStep = applicationSteps[1];
      if (!firstTailoredStep) return;
      setApplicationTypeConfirmed(true);
      setActiveStepId(firstTailoredStep.id);
      setMobileNavOpen(false);
      return;
    }
    if (activeStepId === "review") {
      void submitApplication();
      return;
    }
    if (!validateStep(activeStepId)) return;
    goToStep(visibleSteps[Math.min(activeStepIndex + 1, visibleSteps.length - 1)].id);
  };

  const openAdviserInvite = () => {
    setAdviserDraft(
      form.adviserAccess
        ? { name: form.adviserAccess.name, email: form.adviserAccess.email }
        : emptyAdviserDraft,
    );
    setAdviserError("");
    setShowAdviserInvite(true);
  };

  const inviteAdviser = () => {
    if (!adviserDraft.name.trim()) {
      setAdviserError("Enter the adviser’s name.");
      return;
    }
    if (!isValidEmail(adviserDraft.email)) {
      setAdviserError("Enter a valid adviser email address.");
      return;
    }

    setIsInvitingAdviser(true);
    window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        adviserAccess: {
          name: adviserDraft.name.trim(),
          email: adviserDraft.email.trim(),
          invitedAt: new Date().toISOString(),
        },
      }));
      setIsInvitingAdviser(false);
      setShowAdviserInvite(false);
      setSuccessNotice("Adviser invitation sent. They can help complete any section of this application on your behalf.");
    }, 700);
  };

  const revokeAdviserAccess = () => {
    setForm((current) => ({ ...current, adviserAccess: undefined }));
    setAdviserDraft(emptyAdviserDraft);
    setShowAdviserInvite(false);
    setSuccessNotice("Adviser access has been revoked.");
  };

  const saveDraft = () => {
    if (draftRequestRef.current || submitted) return;
    draftRequestRef.current = true;
    if (draftSaveTimerRef.current) window.clearTimeout(draftSaveTimerRef.current);
    if (draftResetTimerRef.current) window.clearTimeout(draftResetTimerRef.current);
    setDraftStatus("saving");
    setNotice("");
    setSuccessNotice("");

    // Replace this timeout and session record with the draft-saving API request.
    draftSaveTimerRef.current = window.setTimeout(() => {
      try {
        sessionStorage.setItem(
          "caprockOnboardingDraft",
          JSON.stringify({ savedAt: new Date().toISOString(), form: latestFormRef.current }),
        );
        setDraftStatus("saved");
        setSuccessNotice("Draft saved. Your latest application changes have been recorded.");
        draftResetTimerRef.current = window.setTimeout(() => {
          setDraftStatus((current) => (current === "saved" ? "idle" : current));
          draftResetTimerRef.current = null;
        }, 2200);
      } catch {
        setDraftStatus("idle");
        setNotice("We could not save this draft. Your entries remain on this page—please try again.");
      } finally {
        draftRequestRef.current = false;
        draftSaveTimerRef.current = null;
      }
    }, 550);
  };

  const submitApplication = async () => {
    if (submissionRequestRef.current || submitted || !validateStep("review")) return;
    submissionRequestRef.current = true;
    setIsSubmitting(true);
    setNotice("");
    setSuccessNotice("");

    try {
      await withLoader(
        () => new Promise<void>((resolve) => window.setTimeout(resolve, 1250)),
        {
          message: "Submitting securely",
          detail: "Encrypting and sending your application to Caprock.",
          minimumDuration: 900,
        },
      );
      setSubmitted(true);
      setSubmissionConfirmationOpen(true);
    } catch {
      setNotice("We could not submit your application. Your progress is safe—please try again.");
    } finally {
      submissionRequestRef.current = false;
      setIsSubmitting(false);
    }
  };

  return {
    navigate,
    loggedUserEmail,
    loggedUserName,
    loggedUserRole,
    loggedUserInitials,
    form,
    setForm,
    activeStepId,
    setActiveStepId,
    applicationTypeConfirmed,
    setApplicationTypeConfirmed,
    jointDraft,
    setJointDraft,
    showJointComposer,
    setShowJointComposer,
    lookupState,
    setLookupState,
    lookupVerifiedAt,
    setLookupVerifiedAt,
    lookupRequestRef,
    bankDraft,
    setBankDraft,
    editingBankId,
    setEditingBankId,
    errors,
    setErrors,
    notice,
    setNotice,
    successNotice,
    setSuccessNotice,
    mobileNavOpen,
    setMobileNavOpen,
    notificationsOpen,
    setNotificationsOpen,
    notificationsSeen,
    setNotificationsSeen,
    userMenuOpen,
    setUserMenuOpen,
    documentPreview,
    setDocumentPreview,
    notificationsRef,
    userMenuRef,
    previewDialogRef,
    previewCloseButtonRef,
    previewReturnFocusRef,
    showAdviserInvite,
    setShowAdviserInvite,
    adviserDraft,
    setAdviserDraft,
    adviserError,
    setAdviserError,
    adviserDialogRef,
    adviserNameInputRef,
    adviserReturnFocusRef,
    isInvitingAdviser,
    setIsInvitingAdviser,
    draftStatus,
    setDraftStatus,
    isSaving,
    isSubmitting,
    setIsSubmitting,
    submitted,
    submissionConfirmationOpen,
    setSubmissionConfirmationOpen,
    assistantOpen,
    setAssistantOpen,
    isJoint,
    sharedAddress,
    isSoleTrader,
    isCompany,
    isTrust,
    isIndividual,
    isPublicCompany,
    visibleSteps,
    activeStepIndex,
    mainApplicantFullName,
    selectedApplicationOption,
    selectedApplicationType,
    applicationHeaderTitle,
    proofApplicantProfiles,
    personalComplete,
    foreignSoleTraderComplete,
    businessComplete,
    companyProfileComplete,
    directorsComplete,
    shareholdersComplete,
    shareholderPercentageTotal,
    canConfirmShareholders,
    trustProfileComplete,
    trusteesComplete,
    beneficiariesComplete,
    identityComplete,
    bankComplete,
    cashAccountsComplete,
    signatureComplete,
    documentsComplete,
    requiredEntityDocuments,
    allApplicationSectionsComplete,
    completion,
    applicationSectionCount,
    completedSectionCount,
    progressPercent,
    sectionEyebrow,
    openDocumentPreview,
    handleLogout,
    updatePersonal,
    updateCompany,
    updateTrust,
    handleCompanyUsRegisteredChange,
    addDirector,
    removeDirector,
    addShareholder,
    updateShareholder,
    removeShareholder,
    confirmAllShareholders,
    addTrustParty,
    removeTrustParty,
    updateEntityDocument,
    updateCashAccounts,
    updateBusiness,
    handleAssessmentNatureChange,
    handleForeignBusinessCountryChange,
    handleBusinessActivityChange,
    handleUsCitizenChange,
    handleUsTaxResidentChange,
    updateSignature,
    handleApplicationTypeChange,
    updateJointDraft,
    beginJointApplicant,
    handleLookupClient,
    saveJointApplicant,
    removeJointApplicant,
    updateBankDraft,
    saveBankAccount,
    editBankAccount,
    removeBankAccount,
    updateSelfie,
    updateApplicantDocument,
    updatePhotoIdType,
    updateSecondaryPhotoIdType,
    updateAddressDocumentType,
    updateApplicantWebsite,
    validateStep,
    goToStep,
    goBack,
    goNext,
    openAdviserInvite,
    inviteAdviser,
    revokeAdviserAccess,
    saveDraft,
    submitApplication,
  };
}

export type OnboardingController = ReturnType<typeof useOnboardingController>;
