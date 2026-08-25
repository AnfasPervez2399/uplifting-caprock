import {
  ArrowRight,
  Bot,
  LifeBuoy,
  MessageCircle,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { StepId } from "../types";
import type { OnboardingController } from "../useOnboardingController";

interface AssistantAction {
  label: string;
  kind: "step" | "adviser" | "save";
  stepId?: StepId;
}

interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  actions?: AssistantAction[];
}

interface AssistantResponse {
  text: string;
  actions?: AssistantAction[];
}

const stepGuidance: Partial<Record<StepId, string>> = {
  application:
    "Choose the legal structure that will own the account. Your choice controls the fields, people and evidence required throughout the application.",
  personal:
    "Enter the main applicant’s country, legal names, former names or “None”, date of birth, residential address and investment profile. Applicants must be at least 18.",
  entity:
    "Use the company’s official registration records for its legal name, registration identifier, incorporation details and investment profile. Optional website details must still be valid.",
  trust:
    "Enter the trust’s full legal name, trustee business name and establishment country exactly as recorded in the trust documents.",
  business:
    "Complete every visible registration, address, investment and tax field. The questions shown here are tailored to the selected application structure.",
  directors:
    "Declare the number of directors or partners, save that many complete contacts, and choose one as the default communication recipient.",
  shareholders:
    "Declare the shareholder count and save each individual or corporate shareholder with ownership percentage and complete contact details.",
  trustees:
    "Declare all trustees. Corporate trustees require their company structure and at least one complete nested director. Select a default communication recipient.",
  beneficiaries:
    "Declare all beneficiaries. Corporate beneficiaries require their company structure and at least one complete nested director.",
  identity:
    "Provide a clear, current selfie for identity matching. Make sure your face is visible and the image is not blurred or heavily edited.",
  bank: "Add at least one external bank account with bank name, SWIFT code, address, account number, currency and verification evidence.",
  cash: "Select one or more currencies. Caprock will create one cash account for each selected currency.",
  documents:
    "Upload every proof item displayed. Requirements change automatically according to applicant country, entity subtype and company structure.",
  signature:
    "Enter the authorised signatory’s legal name, valid email, phone and date of birth. The signatory must be at least 18.",
  review:
    "Review each summary, open uploaded evidence if needed, complete both declarations and submit securely. Incomplete sections remain identified in the navigation.",
};

const whyGuidance: Partial<Record<StepId, string>> = {
  application:
    "The legal structure determines who must be verified, which compliance checks apply and which documents Caprock must collect.",
  personal:
    "These details support identity, eligibility and customer due-diligence checks.",
  entity:
    "Company registration details allow Caprock to verify the entity against authoritative registers.",
  trust:
    "Trust identity details establish the legal arrangement and connect it to its trustee and governing documents.",
  business:
    "Registration, tax and activity information is required for customer risk assessment and regulatory due diligence.",
  directors:
    "Directors and controlling persons must be identified before the company account can be approved.",
  shareholders:
    "Ownership information helps establish beneficial ownership and control of the company.",
  trustees:
    "Trustees control or administer the trust and therefore require customer due-diligence checks.",
  beneficiaries:
    "Beneficiary information supports beneficial-interest and trust compliance checks.",
  identity:
    "The selfie helps confirm that the applicant matches their identity documents.",
  bank: "Bank evidence verifies the external account used for settlement and reduces payment and fraud risk.",
  cash: "Currency choices determine which cash ledgers are opened for the account.",
  documents:
    "The evidence supports independent verification of identity, registration, ownership and trust status.",
  signature:
    "The signatory details establish who is authorised to approve and electronically sign the application.",
  review:
    "Final review and declarations create a clear, auditable confirmation before submission.",
};

const createMessageId = () =>
  `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function OnboardingAssistant({
  controller,
}: {
  controller: OnboardingController;
}) {
  const {
    activeStepId,
    assistantOpen,
    setAssistantOpen,
    visibleSteps,
    completion,
    selectedApplicationType,
    form,
    isIndividual,
    isCompany,
    isTrust,
    requiredEntityDocuments,
    goToStep,
    openAdviserInvite,
    saveDraft,
    submitted,
  } = controller;
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      text: "Hi, I’m the Caprock onboarding guide. I can explain any field, identify what is still incomplete, help with document requirements, or take you to the right section.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const activeStep = visibleSteps.find((step) => step.id === activeStepId);
  const incompleteSteps = visibleSteps.filter(
    (step) => step.id !== "review" && !completion[step.id],
  );
  const isCurrentStepComplete = Boolean(completion[activeStepId]);

  const quickPrompts = useMemo(() => {
    if (activeStepId === "application")
      return [
        "Which application type should I choose?",
        "Why does the structure matter?",
        "Can my adviser help?",
      ];
    if (activeStepId === "documents")
      return [
        "Which documents are still missing?",
        "Why are these documents required?",
        "What file types can I upload?",
      ];
    if (
      ["directors", "shareholders", "trustees", "beneficiaries"].includes(
        activeStepId,
      )
    )
      return [
        "What do I need to complete here?",
        "How do party invitations work?",
        "What is still incomplete?",
      ];
    if (activeStepId === "review")
      return [
        "What is still incomplete?",
        "What happens after submission?",
        "Can I change an answer?",
      ];
    return [
      "What do I need to complete here?",
      "Why is this information required?",
      "What is still incomplete?",
    ];
  }, [activeStepId]);

  useEffect(() => {
    if (!assistantOpen) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setUnread(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setAssistantOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [assistantOpen, setAssistantOpen]);

  useEffect(() => {
    if (!assistantOpen) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [assistantOpen, isTyping, messages]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const documentResponse = (): AssistantResponse => {
    if (!isIndividual) {
      const missing = requiredEntityDocuments.filter(
        (requirement) => !form.entityDocuments[requirement.key],
      );
      if (!missing.length)
        return {
          text: "All entity documents currently required for this structure have been uploaded. You can open any file from Upload Proof or Review.",
          actions: [
            { label: "Open Upload Proof", kind: "step", stepId: "documents" },
          ],
        };
      return {
        text: `You still need ${missing.length} document${missing.length === 1 ? "" : "s"}:\n• ${missing.map((item) => item.title).join("\n• ")}\n\nAccepted formats are PDF, PNG and JPG.`,
        actions: [
          { label: "Upload documents", kind: "step", stepId: "documents" },
        ],
      };
    }
    return {
      text: "For individual applications, Upload Proof shows the exact identity evidence for each applicant. Non-Australian applicants may need two different photo IDs, address evidence, and either a CV or website. The checklist updates from the applicant country and selected ID types.",
      actions: [
        { label: "Open Upload Proof", kind: "step", stepId: "documents" },
      ],
    };
  };

  const createResponse = (question: string): AssistantResponse => {
    const query = question.toLowerCase();
    const currentLabel = activeStep?.label || "this section";

    if (
      query.includes("what is still") ||
      query.includes("what's left") ||
      query.includes("incomplete") ||
      query.includes("progress")
    ) {
      if (!incompleteSteps.length)
        return {
          text: submitted
            ? "Your application has been submitted and is under review. No further action is currently required."
            : "Every application section is complete. Review the summaries, confirm both final declarations and submit securely.",
          actions: submitted
            ? undefined
            : [{ label: "Go to Review", kind: "step", stepId: "review" }],
        };
      return {
        text: `You have ${incompleteSteps.length} incomplete section${incompleteSteps.length === 1 ? "" : "s"}:\n• ${incompleteSteps.map((step) => step.label).join("\n• ")}\n\nSelect a section below or use the application navigation.`,
        actions: incompleteSteps
          .slice(0, 4)
          .map((step) => ({
            label: step.shortLabel,
            kind: "step",
            stepId: step.id,
          })),
      };
    }

    if (
      query.includes("document") ||
      query.includes("upload") ||
      query.includes("file") ||
      query.includes("proof")
    ) {
      if (query.includes("type") || query.includes("format"))
        return {
          text: "Document uploads accept PDF, PNG, JPG and JPEG files. Profile images accept common image formats. Use a clear, complete and current copy, then click the uploaded entry to preview it.",
        };
      return documentResponse();
    }

    if (
      query.includes("application type") ||
      query.includes("which type") ||
      query.includes("structure")
    ) {
      return {
        text: "Choose the structure that will legally own the Caprock account:\n• Individual covers one person, joint applicants and Sole Traders.\n• Company covers Australian, ASIC-registered foreign and other non-Australian companies.\n• Trust covers regulated, custodian and non-custodian trusts.\n\nIf the legal owner is unclear, confirm it with your adviser before continuing; Caprock cannot choose the legal structure for you.",
        actions: [
          {
            label: "View application types",
            kind: "step",
            stepId: "application",
          },
          { label: "Invite an adviser", kind: "adviser" },
        ],
      };
    }

    if (
      query.includes("adviser") ||
      query.includes("advisor") ||
      query.includes("human") ||
      query.includes("support") ||
      query.includes("person")
    ) {
      return {
        text: form.adviserAccess
          ? `${form.adviserAccess.name} currently has access to help with every section. You remain responsible for reviewing and approving the final application.`
          : "You can invite a trusted adviser to help complete any section. Their access is recorded, applies to the whole application and can be revoked at any time.",
        actions: [
          {
            label: form.adviserAccess
              ? "Manage adviser access"
              : "Invite an adviser",
            kind: "adviser",
          },
        ],
      };
    }

    if (
      query.includes("save") ||
      query.includes("later") ||
      query.includes("draft")
    ) {
      return {
        text: "Use Save draft at any time. Your current application changes will be recorded so you can continue later.",
        actions: [{ label: "Save my draft", kind: "save" }],
      };
    }

    if (
      query.includes("bank") ||
      query.includes("swift") ||
      query.includes("settlement")
    ) {
      return {
        text: "Each external bank account needs the bank name, SWIFT code, bank address, account number, currency and a verification document. At least one complete account is required.",
        actions: [
          { label: "Open bank accounts", kind: "step", stepId: "bank" },
        ],
      };
    }

    if (
      query.includes("invitation") ||
      query.includes("invite") ||
      query.includes("party")
    ) {
      return {
        text: "Save each required party with complete contact details. Invitations are queued during the draft and sent after the entity application is submitted. Corporate trustees and beneficiaries also require at least one complete nested director before they can be saved.",
      };
    }

    if (
      query.includes("signature") ||
      query.includes("signatory") ||
      query.includes("sign")
    ) {
      return {
        text: "The authorised signatory must provide their legal name, valid email, phone and date of birth, and must be at least 18. The electronic signature request follows the compliance checks.",
        actions: [
          { label: "Open E-Signature", kind: "step", stepId: "signature" },
        ],
      };
    }

    if (
      query.includes("after submission") ||
      query.includes("after submit") ||
      query.includes("what happens")
    ) {
      return {
        text: "After secure submission, a confirmation appears over Review. The application then remains on Review with an Under review status. Caprock will contact you if additional information is required.",
      };
    }

    if (
      query.includes("change") ||
      query.includes("edit") ||
      query.includes("mistake")
    ) {
      return {
        text: submitted
          ? "The application is already under review. Use your Caprock relationship contact if submitted information needs to be corrected."
          : "You can use the left navigation or any Edit button on Review to return to a section. Save your draft after making the correction.",
      };
    }

    if (
      query.includes("secure") ||
      query.includes("privacy") ||
      query.includes("safe")
    ) {
      return {
        text: "The onboarding interface treats the application as a protected session. Identity, banking and compliance information is collected only for onboarding and verification purposes. Avoid sharing passwords or security codes in this chat.",
      };
    }

    if (query.includes("why") || query.includes("required")) {
      return {
        text: `${whyGuidance[activeStepId] || "This information supports Caprock’s onboarding and regulatory verification process."}\n\nFor ${currentLabel}, only fields marked Required must be completed; fields marked Optional can be left blank.`,
      };
    }

    if (
      query.includes("what do i need") ||
      query.includes("help here") ||
      query.includes("this section") ||
      query.includes("current")
    ) {
      return {
        text: `${stepGuidance[activeStepId] || "Complete every required field shown in this section."}\n\nCurrent status: ${isCurrentStepComplete ? "Complete" : "Incomplete"}.`,
        actions:
          isCurrentStepComplete && activeStepId !== "review"
            ? [
                {
                  label: "See what’s left",
                  kind: "step",
                  stepId: incompleteSteps[0]?.id || "review",
                },
              ]
            : undefined,
      };
    }

    const structureNote =
      selectedApplicationType === "Not selected"
        ? "Start by selecting the legal application type."
        : `You’re completing a ${selectedApplicationType} application.`;
    return {
      text: `${structureNote}\n\nFor ${currentLabel}: ${stepGuidance[activeStepId] || "complete each required field shown."}\n\nYou can ask me “What is still incomplete?”, “Which documents do I need?” or “Why is this required?”`,
    };
  };

  const sendMessage = (messageText: string) => {
    const text = messageText.trim();
    if (!text || isTyping) return;
    setMessages((current) => [
      ...current,
      { id: createMessageId(), role: "user", text },
    ]);
    setDraft("");
    setIsTyping(true);
    timerRef.current = window.setTimeout(() => {
      const response = createResponse(text);
      setMessages((current) => [
        ...current,
        { id: createMessageId(), role: "assistant", ...response },
      ]);
      setIsTyping(false);
      timerRef.current = null;
    }, 420);
  };

  const submitDraft = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const runAction = (action: AssistantAction) => {
    if (action.kind === "adviser") {
      setAssistantOpen(false);
      window.setTimeout(openAdviserInvite, 100);
      return;
    }
    if (action.kind === "save") {
      saveDraft();
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          text: "I’ve started saving your draft. You’ll see confirmation in the application when it is recorded.",
        },
      ]);
      return;
    }
    if (action.stepId) {
      goToStep(action.stepId);
      if (window.matchMedia("(max-width: 639px)").matches)
        setAssistantOpen(false);
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        id: createMessageId(),
        role: "assistant",
        text: "Conversation cleared. How can I help with your onboarding application?",
      },
    ]);
    setDraft("");
  };

  return (
    <>
      {!assistantOpen ? (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          aria-label="Open onboarding assistant"
          className="fixed bottom-5 right-4 z-[110] inline-flex h-14 items-center gap-3 rounded-2xl bg-[#003478] px-4 text-white shadow-[0_18px_45px_rgba(0,52,120,0.26)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#002b63] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/20 sm:bottom-6 sm:right-6"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-white/12 ring-1 ring-white/15">
            <MessageCircle className="h-4 w-4" />
            {unread ? (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[#003478]" />
            ) : null}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-white/65">
              Need help?
            </span>
            <span className="mt-0.5 block text-xs font-semibold">
              Ask Caprock
            </span>
          </span>
        </button>
      ) : null}

      {assistantOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-end bg-slate-950/30 p-0 backdrop-blur-[2px] sm:pointer-events-none sm:items-end sm:justify-end sm:bg-transparent sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && window.innerWidth < 640)
              setAssistantOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-assistant-title"
            className="pointer-events-auto flex h-[min(92vh,760px)] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] sm:h-[min(76vh,690px)] sm:w-[420px] sm:rounded-3xl"
          >
            <header className="shrink-0 border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#003478] text-white">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2
                      id="onboarding-assistant-title"
                      className="truncate text-sm font-semibold text-slate-950"
                    >
                      Caprock onboarding guide
                    </h2>
                    <span className="rounded-full bg-[#dce7f2] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.07em] text-[#003478]">
                      Assistant
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-slate-500">
                    Helping with {activeStep?.label || "your application"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetConversation}
                  aria-label="Clear assistant conversation"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantOpen(false)}
                  aria-label="Close onboarding assistant"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f6f8fb] px-3 py-2 text-[10px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#003478]" />
                <span className="truncate">
                  Context: {selectedApplicationType} · {activeStep?.label}
                </span>
                <span
                  className={`ml-auto shrink-0 font-bold ${isCurrentStepComplete ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {isCurrentStepComplete ? "Complete" : "In progress"}
                </span>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-4 py-5"
              aria-live="polite"
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" ? (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#dce7f2] text-[#003478]">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                    <div
                      className={`max-w-[84%] ${message.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`whitespace-pre-line rounded-2xl px-3.5 py-3 text-xs leading-5 ${message.role === "user" ? "rounded-br-md bg-[#003478] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"}`}
                      >
                        {message.text}
                      </div>
                      {message.actions?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {message.actions.map((action) => (
                            <button
                              key={`${message.id}-${action.label}`}
                              type="button"
                              onClick={() => runAction(action)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#c9d8e7] bg-white px-2.5 text-[10px] font-semibold text-[#003478] transition hover:bg-[#edf3f8]"
                            >
                              {action.label}
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {message.role === "user" ? (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-600">
                        <UserRound className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </div>
                ))}
                {isTyping ? (
                  <div className="flex items-end gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#dce7f2] text-[#003478]">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex h-10 items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 shadow-sm">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-100 bg-white p-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={isTyping}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-[#b8cadc] hover:bg-[#f6f9fc] hover:text-[#003478] disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form
                onSubmit={submitDraft}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm focus-within:border-[#9eb6cf] focus-within:ring-4 focus-within:ring-[#003478]/5"
              >
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask about your application…"
                  aria-label="Message the onboarding assistant"
                  className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isTyping}
                  aria-label="Send message"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#003478] text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[9px] leading-4 text-slate-400">
                <LifeBuoy className="h-3 w-3" />
                Guidance only—confirm legal or tax decisions with your adviser.
              </p>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
