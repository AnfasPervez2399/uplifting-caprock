import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAtLeastAge } from "../../components/ui/DatePicker";
import { useLoader } from "../../components/ui/LoaderProvider";
import { APPLICATION_OPTIONS, BANK_CURRENCY_OPTIONS, allSteps } from "./config";
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
  DocumentPreview,
  FormState,
  JointApplicant,
  JointApplicantDraft,
  PersonalState,
  PhotoIdType,
  ProofFileField,
  SignatureState,
  StepId,
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

export function useOnboardingController() {
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [loggedUserEmail] = useState(
    () =>
      sessionStorage.getItem("caprockUserEmail") || "alex.morgan@example.com",
  );
  const loggedUserName = displayNameFromEmail(loggedUserEmail);
  const loggedUserRole = "Applicant";
  const loggedUserInitials = loggedUserName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [activeStepId, setActiveStepId] = useState<StepId>("personal");
  const [jointDraft, setJointDraft] =
    useState<JointApplicantDraft>(emptyJointDraft);
  const [showJointComposer, setShowJointComposer] = useState(false);
  const [lookupState, setLookupState] = useState<
    "idle" | "loading" | "found" | "error"
  >("idle");
  const [lookupVerifiedAt, setLookupVerifiedAt] = useState("");
  const lookupRequestRef = useRef(0);
  const [bankDraft, setBankDraft] = useState<BankAccount | null>(
    createEmptyBank(),
  );
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [documentPreview, setDocumentPreview] =
    useState<DocumentPreview | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const previewDialogRef = useRef<HTMLDivElement>(null);
  const previewCloseButtonRef = useRef<HTMLButtonElement>(null);
  const previewReturnFocusRef = useRef<HTMLElement | null>(null);
  const [showAdviserInvite, setShowAdviserInvite] = useState(false);
  const [adviserDraft, setAdviserDraft] =
    useState<AdviserDraft>(emptyAdviserDraft);
  const [adviserError, setAdviserError] = useState("");
  const adviserDialogRef = useRef<HTMLDivElement>(null);
  const adviserNameInputRef = useRef<HTMLInputElement>(null);
  const adviserReturnFocusRef = useRef<HTMLElement | null>(null);
  const [isInvitingAdviser, setIsInvitingAdviser] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const isSaving = draftStatus === "saving";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isJoint = isJointType(form.personal.applicationType);
  const sharedAddress = usesSharedAddress(form.personal.applicationType);
  const isSoleTrader = form.personal.applicationType === "sole-trader";
  const visibleSteps = useMemo(
    () =>
      isSoleTrader
        ? allSteps
        : allSteps.filter((step) => step.id !== "business"),
    [isSoleTrader],
  );
  const activeStepIndex = visibleSteps.findIndex(
    (step) => step.id === activeStepId,
  );
  const mainApplicantFullName = formatApplicantName(form.personal);
  const selectedApplicationOption = APPLICATION_OPTIONS.find(
    (option) => option.value === form.personal.applicationType,
  );
  const selectedApplicationType =
    selectedApplicationOption?.label || "Not selected";
  const applicationHeader = {
    title: selectedApplicationOption?.headerTitle || "Investment application",
    subtitle: selectedApplicationOption?.headerSubtitle || "Caprock onboarding",
  };
  const applicantProfiles = useMemo(
    () => [
      {
        key: "main",
        label: "Main applicant",
        name: mainApplicantFullName || "Main applicant",
        country: form.personal.applicantCountry,
      },
      ...form.jointApplicants.map((applicant, index) => ({
        key: applicant.id,
        label: `Joint applicant ${index + 1}`,
        name: formatApplicantName(applicant) || `Joint applicant ${index + 1}`,
        country: applicant.applicantCountry || form.personal.applicantCountry,
      })),
    ],
    [
      form.jointApplicants,
      form.personal.applicantCountry,
      mainApplicantFullName,
    ],
  );

  const personalComplete = useMemo(() => {
    const mainApplicantComplete = Boolean(
      form.personal.applicationType &&
      form.personal.applicantCountry &&
      form.personal.firstName.trim() &&
      form.personal.lastName.trim() &&
      form.personal.formerNames.trim() &&
      isAtLeastAge(form.personal.dateOfBirth, 18) &&
      form.personal.residentialAddress.trim() &&
      form.personal.investmentCurrency &&
      form.personal.expectedInvestment,
    );
    if (!mainApplicantComplete) return false;
    if (!isJoint) return true;
    return (
      form.jointApplicants.length > 0 &&
      form.jointApplicants.every((applicant) =>
        isCompleteJointPersonal(applicant, sharedAddress),
      )
    );
  }, [form.jointApplicants, form.personal, isJoint, sharedAddress]);

  const foreignSoleTraderComplete = useMemo(() => {
    if (!isSoleTrader || form.business.assessmentNature !== "foreign")
      return true;
    const isUnitedStates =
      form.business.foreignBusinessCountry === "United States";
    return Boolean(
      form.business.foreignBusinessCountry &&
      form.business.investorClassification &&
      form.business.businessActivity &&
      (form.business.businessActivity !== "Other" ||
        form.business.businessActivityOther.trim()) &&
      form.business.sourceOfFunds.trim() &&
      form.business.intendedTransactions.trim() &&
      form.business.beneficialOwnership.trim() &&
      (!isUnitedStates ||
        (form.business.usCitizen &&
          (form.business.usCitizen !== "yes" ||
            form.business.socialSecurityNumber.trim()) &&
          form.business.usTaxResident &&
          (form.business.usTaxResident !== "yes" ||
            form.business.taxIdentificationNumber.trim()))),
    );
  }, [form.business, isSoleTrader]);

  const businessComplete = useMemo(() => {
    if (!isSoleTrader) return true;
    if (!form.business.assessmentNature) return false;
    if (
      !form.business.businessName.trim() ||
      !form.business.principalBusinessAddress.trim() ||
      (form.business.assessmentNature === "australian" &&
        !form.business.abn.trim())
    ) {
      return false;
    }
    return foreignSoleTraderComplete;
  }, [form.business, foreignSoleTraderComplete, isSoleTrader]);

  const identityComplete = Boolean(form.identity.selfie);

  const bankComplete = useMemo(
    () =>
      form.bankAccounts.length > 0 &&
      form.bankAccounts.every((account) =>
        Boolean(
          account.bankName.trim() &&
          account.swiftCode.trim() &&
          account.bankAddress.trim() &&
          account.accountNumber.trim() &&
          account.currency &&
          account.verificationDocument,
        ),
      ),
    [form.bankAccounts],
  );

  const cashAccountsComplete =
    form.cashAccounts.length > 0 &&
    new Set(form.cashAccounts).size === form.cashAccounts.length;

  const signatureComplete = useMemo(
    () =>
      Boolean(
        form.signature.name.trim() &&
        isValidEmail(form.signature.email) &&
        form.signature.phone.trim() &&
        isAtLeastAge(form.signature.dateOfBirth, 18),
      ),
    [form.signature],
  );

  const documentsComplete = useMemo(
    () =>
      applicantProfiles.every((applicant) =>
        hasCompleteApplicantProof(
          form.documents[applicant.key],
          applicant.country,
        ),
      ),
    [applicantProfiles, form.documents],
  );

  const allApplicationSectionsComplete =
    personalComplete &&
    businessComplete &&
    identityComplete &&
    bankComplete &&
    cashAccountsComplete &&
    signatureComplete &&
    documentsComplete;

  const completion: Record<StepId, boolean> = {
    personal: personalComplete,
    business: businessComplete,
    identity: identityComplete,
    bank: bankComplete,
    cash: cashAccountsComplete,
    signature: signatureComplete,
    documents: documentsComplete,
    review:
      allApplicationSectionsComplete &&
      form.agreements.accurate &&
      form.agreements.consent,
  };

  const applicationSectionCount = visibleSteps.length - 1;
  const completedSectionCount = visibleSteps
    .slice(0, -1)
    .filter((step) => completion[step.id]).length;
  const progressPercent = Math.round(
    (completedSectionCount / Math.max(1, applicationSectionCount)) * 100,
  );
  const sectionEyebrow = (stepId: StepId) =>
    `Section ${visibleSteps.findIndex((step) => step.id === stepId) + 1} of ${visibleSteps.length}`;

  const openDocumentPreview = (
    uploadedDocument: UploadedDocument,
    label: string,
  ) => {
    previewReturnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
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
      if (notificationsOpen && !notificationsRef.current?.contains(target))
        setNotificationsOpen(false);
      if (userMenuOpen && !userMenuRef.current?.contains(target))
        setUserMenuOpen(false);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrors({});
    setNotice("");
    setSuccessNotice("");
  }, [activeStepId]);

  useEffect(() => {
    if (!showAdviserInvite) return;

    adviserReturnFocusRef.current =
      document.activeElement instanceof HTMLElement
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

  const updatePersonal = <K extends keyof PersonalState>(
    key: K,
    value: PersonalState[K],
  ) => {
    setForm((current) => ({
      ...current,
      personal: { ...current.personal, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const updateCashAccounts = (currencies: string[]) => {
    const allowedCurrencies = new Set(
      BANK_CURRENCY_OPTIONS.map((option) => option.value),
    );
    const uniqueCurrencies = [...new Set(currencies)].filter((currency) =>
      allowedCurrencies.has(currency),
    );
    setForm((current) => ({ ...current, cashAccounts: uniqueCurrencies }));
    setErrors((current) => ({ ...current, cashAccounts: "" }));
  };

  const updateBusiness = <K extends keyof BusinessState>(
    key: K,
    value: BusinessState[K],
  ) => {
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
        businessActivityOther:
          value === "Other" ? current.business.businessActivityOther : "",
      },
    }));
    setErrors((current) => ({
      ...current,
      businessActivity: "",
      businessActivityOther: "",
    }));
  };

  const handleUsCitizenChange = (value: string) => {
    const usCitizen = value as YesNo;
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        usCitizen,
        socialSecurityNumber:
          usCitizen === "yes" ? current.business.socialSecurityNumber : "",
      },
    }));
    setErrors((current) => ({
      ...current,
      usCitizen: "",
      socialSecurityNumber: "",
    }));
  };

  const handleUsTaxResidentChange = (value: string) => {
    const usTaxResident = value as YesNo;
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        usTaxResident,
        taxIdentificationNumber:
          usTaxResident === "yes"
            ? current.business.taxIdentificationNumber
            : "",
      },
    }));
    setErrors((current) => ({
      ...current,
      usTaxResident: "",
      taxIdentificationNumber: "",
    }));
  };

  const updateSignature = <K extends keyof SignatureState>(
    key: K,
    value: SignatureState[K],
  ) => {
    setForm((current) => ({
      ...current,
      signature: { ...current.signature, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleApplicationTypeChange = (value: string) => {
    const applicationType = value as ApplicationType;
    setForm((current) => ({
      ...current,
      personal: { ...current.personal, applicationType },
      jointApplicants: isJointType(applicationType)
        ? current.jointApplicants
        : [],
      documents: isJointType(applicationType)
        ? current.documents
        : { main: current.documents.main || {} },
    }));
    setErrors((current) => ({ ...current, applicationType: "" }));
    if (!isJointType(applicationType)) {
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
        applicantCountry:
          current.applicantCountry ||
          form.personal.applicantCountry ||
          "Australia",
      }));
      setLookupState("found");
      setLookupVerifiedAt(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 700);
  };

  const saveJointApplicant = () => {
    const isExisting = jointDraft.method === "existing";
    const address = sharedAddress
      ? form.personal.residentialAddress
      : jointDraft.residentialAddress;
    const valid = isExisting
      ? lookupState === "found" && jointDraft.clientId.trim()
      : jointDraft.firstName.trim() &&
        isValidEmail(jointDraft.email) &&
        address.trim();

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
      firstName: isExisting
        ? `Verified client · ${jointDraft.clientId.trim().toUpperCase()}`
        : jointDraft.firstName.trim(),
      middleName: "",
      lastName: "",
      formerNames: isExisting ? "Verified on file" : "",
      email: isExisting ? "" : jointDraft.email.trim(),
      dateOfBirth: "",
      applicantCountry: form.personal.applicantCountry,
      residentialAddress: isExisting ? "Verified on file" : address.trim(),
      confirmed: true,
    };

    setForm((current) => ({
      ...current,
      jointApplicants: [...current.jointApplicants, applicant],
    }));
    setJointDraft(emptyJointDraft);
    setLookupState("idle");
    setLookupVerifiedAt("");
    setShowJointComposer(false);
    setErrors((current) => ({ ...current, jointApplicants: "" }));
  };

  const removeJointApplicant = (id: string) => {
    setForm((current) => {
      const nextDocuments = { ...current.documents };
      delete nextDocuments[id];
      return {
        ...current,
        jointApplicants: current.jointApplicants.filter(
          (applicant) => applicant.id !== id,
        ),
        documents: nextDocuments,
      };
    });
  };

  const updateBankDraft = <K extends keyof BankAccount>(
    key: K,
    value: BankAccount[K],
  ) => {
    setBankDraft((current) =>
      current ? { ...current, [key]: value } : current,
    );
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
        bankDraft:
          "Complete every required bank field and attach verification evidence.",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      bankAccounts: editingBankId
        ? current.bankAccounts.map((account) =>
            account.id === editingBankId ? bankDraft : account,
          )
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
      setErrors((current) => ({
        ...current,
        identity: "Choose a JPG, PNG, HEIC or other image file.",
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        identity: "The selfie must be 10 MB or smaller.",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      identity: { selfie: documentFromFile(file) },
    }));
    setErrors((current) => ({ ...current, identity: "" }));
  };

  const updateApplicantDocument = (
    applicantKey: string,
    field: ProofFileField,
    file?: File,
  ) => {
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

  const updatePhotoIdType = (
    applicantKey: string,
    photoIdType: PhotoIdType,
  ) => {
    setForm((current) => {
      const currentDocuments = current.documents[applicantKey] || {};
      const clearsDuplicateSecondary =
        currentDocuments.secondaryPhotoIdType === photoIdType;
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
              ? {
                  addressDocumentType: "" as AddressDocumentType,
                  addressDocument: undefined,
                }
              : {}),
          },
        },
      };
    });
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const updateSecondaryPhotoIdType = (
    applicantKey: string,
    requestedType: PhotoIdType,
  ) => {
    setForm((current) => {
      const currentDocuments = current.documents[applicantKey] || {};
      const secondaryPhotoIdType =
        requestedType === currentDocuments.photoIdType ? "" : requestedType;
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
              ? {
                  addressDocumentType: "" as AddressDocumentType,
                  addressDocument: undefined,
                }
              : {}),
          },
        },
      };
    });
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const updateAddressDocumentType = (
    applicantKey: string,
    addressDocumentType: AddressDocumentType,
  ) => {
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

    if (stepId === "personal") {
      if (!form.personal.applicationType)
        nextErrors.applicationType = "Select an application type.";
      if (!form.personal.applicantCountry)
        nextErrors.applicantCountry = "Select the applicant country.";
      if (!form.personal.firstName.trim())
        nextErrors.firstName = "Enter the applicant’s first name.";
      if (!form.personal.lastName.trim())
        nextErrors.lastName = "Enter the applicant’s last name.";
      if (!form.personal.formerNames.trim())
        nextErrors.formerNames =
          "Enter former names, or “None” if not applicable.";
      if (!form.personal.dateOfBirth) {
        nextErrors.dateOfBirth = "Enter the applicant’s date of birth.";
      } else if (!isAtLeastAge(form.personal.dateOfBirth, 18)) {
        nextErrors.dateOfBirth = "The applicant must be at least 18 years old.";
      }
      if (!form.personal.residentialAddress.trim())
        nextErrors.residentialAddress = "Enter the residential address.";
      if (!form.personal.investmentCurrency)
        nextErrors.investmentCurrency = "Select an investment currency.";
      if (!form.personal.expectedInvestment)
        nextErrors.expectedInvestment =
          "Select the expected investment amount.";
      if (
        isJoint &&
        (form.jointApplicants.length === 0 ||
          form.jointApplicants.some(
            (applicant) => !isCompleteJointPersonal(applicant, sharedAddress),
          ))
      ) {
        nextErrors.jointApplicants =
          "Add at least one complete joint applicant invitation.";
      }
    }

    if (stepId === "business" && isSoleTrader) {
      if (!form.business.assessmentNature)
        nextErrors.assessmentNature =
          "Select the individual assessment nature.";
      if (!form.business.businessName.trim())
        nextErrors.businessName = "Enter the business name.";
      if (!form.business.principalBusinessAddress.trim()) {
        nextErrors.principalBusinessAddress =
          "Enter the principal place of business.";
      }
      if (
        form.business.assessmentNature === "australian" &&
        !form.business.abn.trim()
      ) {
        nextErrors.abn = "Enter the Australian Business Number.";
      }
      if (form.business.assessmentNature === "foreign") {
        if (!form.business.foreignBusinessCountry) {
          nextErrors.foreignBusinessCountry =
            "Select the country of foreign business.";
        }
        if (!form.business.investorClassification)
          nextErrors.investorClassification =
            "Select the major business nature.";
        if (!form.business.businessActivity)
          nextErrors.businessActivity = "Select the business activity.";
        if (
          form.business.businessActivity === "Other" &&
          !form.business.businessActivityOther.trim()
        ) {
          nextErrors.businessActivityOther = "Describe the business activity.";
        }
        if (!form.business.sourceOfFunds.trim())
          nextErrors.sourceOfFunds = "Describe the source and origin of funds.";
        if (!form.business.intendedTransactions.trim()) {
          nextErrors.intendedTransactions =
            "Describe the intended transaction behaviour.";
        }
        if (!form.business.beneficialOwnership.trim()) {
          nextErrors.beneficialOwnership =
            "Describe the beneficial ownership of the funds.";
        }
        if (form.business.foreignBusinessCountry === "United States") {
          if (!form.business.usCitizen)
            nextErrors.usCitizen = "Confirm U.S. citizenship status.";
          if (
            form.business.usCitizen === "yes" &&
            !form.business.socialSecurityNumber.trim()
          ) {
            nextErrors.socialSecurityNumber =
              "Enter the Social Security Number.";
          }
          if (!form.business.usTaxResident)
            nextErrors.usTaxResident = "Confirm U.S. tax residency status.";
          if (
            form.business.usTaxResident === "yes" &&
            !form.business.taxIdentificationNumber.trim()
          ) {
            nextErrors.taxIdentificationNumber =
              "Enter the tax identification number.";
          }
        }
      }
    }

    if (stepId === "identity" && !identityComplete) {
      nextErrors.identity =
        "Take a selfie or choose a clear selfie image from your device.";
    }

    if (stepId === "bank" && !bankComplete) {
      nextErrors.bank =
        "Add at least one complete, verified external bank account.";
    }

    if (stepId === "cash" && !cashAccountsComplete) {
      nextErrors.cashAccounts =
        "Select at least one currency for a cash account.";
    }

    if (stepId === "signature") {
      if (!form.signature.name.trim())
        nextErrors.signatureName = "Enter the authorised signatory’s name.";
      if (!isValidEmail(form.signature.email))
        nextErrors.signatureEmail = "Enter a valid email address.";
      if (!form.signature.phone.trim())
        nextErrors.signaturePhone = "Enter a phone number.";
      if (!form.signature.dateOfBirth) {
        nextErrors.signatureDateOfBirth =
          "Enter the signatory’s date of birth.";
      } else if (!isAtLeastAge(form.signature.dateOfBirth, 18)) {
        nextErrors.signatureDateOfBirth =
          "The authorised signatory must be at least 18 years old.";
      }
    }

    if (stepId === "documents" && !documentsComplete) {
      nextErrors.documents =
        "Complete every applicant’s proof requirements. Non-Australian applicants need two different photo IDs; all applicants also need address evidence where applicable and either a CV or website.";
    }

    if (stepId === "review") {
      if (!allApplicationSectionsComplete)
        nextErrors.review =
          "Complete every application section before submitting.";
      if (!form.agreements.accurate || !form.agreements.consent) {
        nextErrors.agreements = "Confirm both declarations before submitting.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please review the highlighted information before continuing.");
      return false;
    }
    setNotice("");
    return true;
  };

  const goToStep = (stepId: StepId) => {
    setActiveStepId(stepId);
    setMobileNavOpen(false);
  };

  const goBack = () => {
    if (activeStepIndex > 0) goToStep(visibleSteps[activeStepIndex - 1].id);
  };

  const goNext = () => {
    if (!validateStep(activeStepId)) return;
    if (activeStepId === "review") {
      submitApplication();
      return;
    }
    goToStep(
      visibleSteps[Math.min(activeStepIndex + 1, visibleSteps.length - 1)].id,
    );
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
      setSuccessNotice(
        "Adviser invitation sent. They can help complete any section of this application on your behalf.",
      );
    }, 700);
  };

  const revokeAdviserAccess = () => {
    setForm((current) => ({ ...current, adviserAccess: undefined }));
    setAdviserDraft(emptyAdviserDraft);
    setShowAdviserInvite(false);
    setSuccessNotice("Adviser access has been revoked.");
  };

  const saveDraft = () => {
    if (isSaving) return;
    setDraftStatus("saving");
    setSuccessNotice("");

    // Replace this timeout with the draft-saving API request.
    window.setTimeout(() => {
      setDraftStatus("saved");
      setSuccessNotice(
        "Draft saved. Your latest application changes have been recorded.",
      );
      window.setTimeout(() => {
        setDraftStatus((current) => (current === "saved" ? "idle" : current));
      }, 2200);
    }, 700);
  };

  const submitApplication = async () => {
    if (!validateStep("review")) return;
    setIsSubmitting(true);

    try {
      await withLoader(
        // Replace this promise with the secure application-submission request.
        new Promise<void>((resolve) => window.setTimeout(resolve, 1400)),
      );
      setSubmitted(true);
    } catch {
      setNotice(
        "We could not submit your application. Your progress is safe—please try again.",
      );
    } finally {
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
    setSubmitted,
    isJoint,
    sharedAddress,
    isSoleTrader,
    visibleSteps,
    activeStepIndex,
    mainApplicantFullName,
    selectedApplicationOption,
    selectedApplicationType,
    applicationHeader,
    applicantProfiles,
    personalComplete,
    foreignSoleTraderComplete,
    businessComplete,
    identityComplete,
    bankComplete,
    cashAccountsComplete,
    signatureComplete,
    documentsComplete,
    allApplicationSectionsComplete,
    completion,
    applicationSectionCount,
    completedSectionCount,
    progressPercent,
    sectionEyebrow,
    openDocumentPreview,
    handleLogout,
    updatePersonal,
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
