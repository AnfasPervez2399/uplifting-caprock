import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  LifeBuoy,
  MessageCircle,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  checkAssistantService,
  requestAssistantAnswer,
  type AssistantServiceMode,
} from "../assistantApi";
import {
  ASSISTANT_STEP_NAMES,
  findRequestedStep,
  getMissingItems,
  getStepGuidance,
  getWhyGuidance,
} from "../assistantKnowledge";
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
  source?: "ai" | "grounded";
}

interface AssistantResponse {
  text: string;
  actions?: AssistantAction[];
}

const createMessageId = () =>
  `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const asksForMissingInformation = (query: string) =>
  /still|left|missing|incomplete|need to complete|not complete|progress/.test(
    query,
  );
const asksForNavigation = (query: string) =>
  /go to|open|take me|navigate|jump|show me|visit|redirect|section/.test(query);

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
      text: "Hi, I’m the Caprock onboarding assistant. Ask me a question in your own words—I can explain requirements, check what is missing, help you decide what to do next, and take you to any available section.",
      source: "grounded",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(true);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [serviceMode, setServiceMode] =
    useState<AssistantServiceMode>("checking");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const lastTopicRef = useRef<StepId | undefined>(undefined);

  const activeStep = visibleSteps.find((step) => step.id === activeStepId);
  const incompleteSteps = visibleSteps.filter(
    (step) => step.id !== "review" && !completion[step.id],
  );
  const isCurrentStepComplete = Boolean(completion[activeStepId]);
  const activeStepName = ASSISTANT_STEP_NAMES[activeStepId];

  const quickPrompts = useMemo(() => {
    if (activeStepId === "application")
      return [
        "Which application type should I choose?",
        "Show application requirements",
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

  useEffect(() => {
    if (!assistantOpen) return;
    const statusRequest = new AbortController();
    setServiceMode("checking");
    void checkAssistantService(statusRequest.signal).then((mode) => {
      if (!statusRequest.signal.aborted) setServiceMode(mode);
    });
    return () => statusRequest.abort();
  }, [assistantOpen]);

  useEffect(() => () => requestRef.current?.abort(), []);

  const stepAction = (stepId: StepId, prefix = "Open"): AssistantAction => ({
    label: `${prefix} ${ASSISTANT_STEP_NAMES[stepId]}`,
    kind: "step",
    stepId,
  });

  const missingResponse = (stepId: StepId): AssistantResponse => {
    const missing = getMissingItems(controller, stepId);
    const label = ASSISTANT_STEP_NAMES[stepId];
    const available = visibleSteps.some((step) => step.id === stepId);
    const actions = available
      ? [stepAction(stepId)]
      : [stepAction("application", "Return to")];

    if (!available) {
      return {
        text: `${label} is not part of the currently available flow. Select an application type first, or choose a structure whose section list includes ${label}.`,
        actions,
      };
    }
    if (!missing.length) {
      return {
        text: `${label} is complete. No required items are currently missing from this section.`,
        actions,
      };
    }

    const visibleMissing = missing.slice(0, 10);
    const additionalCount = missing.length - visibleMissing.length;
    return {
      text: `${label} still needs ${missing.length} item${missing.length === 1 ? "" : "s"}:\n• ${visibleMissing.join("\n• ")}${additionalCount > 0 ? `\n• And ${additionalCount} more` : ""}`,
      actions,
    };
  };

  const documentResponse = (): AssistantResponse => {
    const missing = getMissingItems(controller, "documents");
    const available = visibleSteps.some((step) => step.id === "documents");
    if (!available) {
      return {
        text: "Upload Proof becomes available after you select an application type. Its checklist changes according to applicant country, entity subtype and company structure.",
        actions: [stepAction("application", "Return to")],
      };
    }
    if (!missing.length) {
      return {
        text: `All proof currently required for this ${selectedApplicationType} application has been supplied. Uploaded entries can be opened from Upload Proof or Review and Submit.`,
        actions: [stepAction("documents")],
      };
    }
    const requirementSummary = getStepGuidance(controller, "documents");
    const names = controller.isIndividual
      ? missing
      : requiredEntityDocuments
          .filter((document) => !form.entityDocuments[document.key])
          .map((document) => document.title);
    return {
      text: `${requirementSummary}\n\nStill missing:\n• ${names.join("\n• ")}`,
      actions: [stepAction("documents")],
    };
  };

  const createResponse = (question: string): AssistantResponse => {
    const query = question.toLowerCase().replace(/\s+/g, " ").trim();
    const explicitStep = findRequestedStep(query);
    const refersToCurrentStep =
      /\b(here|this section|current section|current page)\b/.test(query);
    const contextualFollowUp =
      /^(why|why is that|what does that mean|tell me more|open it|go there|take me there|show me|what about that|is it complete)[?.!]*$/.test(
        query,
      );
    const requestedStep =
      explicitStep ||
      (refersToCurrentStep
        ? activeStepId
        : contextualFollowUp
          ? lastTopicRef.current
          : undefined);
    const asksWhy = query.includes("why") || query.includes("reason");

    if (
      /^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/.test(
        query,
      )
    ) {
      return {
        text: `Hello. I can see that you’re currently in ${activeStepName}. Ask me what is required, what is missing, why a field is needed, or what you should complete next.`,
        actions: [stepAction(activeStepId, "Open")],
      };
    }

    if (/\b(thank you|thanks|cheers)\b/.test(query)) {
      return {
        text: "You’re welcome. I’m here if you want me to check your progress or explain another part of the application.",
      };
    }

    if (/\b(fill|complete|submit)\b.*\b(for me|on my behalf)\b/.test(query)) {
      return {
        text: "I can explain each field, identify missing requirements and take you to the right section, but I cannot invent, approve or submit information on your behalf. You or an authorised adviser must enter and review the application details.",
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
      /\b(next|what should i do|where should i start|what now)\b/.test(query)
    ) {
      const nextStep = incompleteSteps[0];
      if (!nextStep) {
        return submitted
          ? {
              text: "Your application is under review, so there is nothing else to complete right now.",
            }
          : {
              text: "Every required section is complete. Review the summaries and declarations before submitting securely.",
              actions: [stepAction("review", "Go to")],
            };
      }
      lastTopicRef.current = nextStep.id;
      const missing = getMissingItems(controller, nextStep.id);
      return {
        text: `Complete ${ASSISTANT_STEP_NAMES[nextStep.id]} next. ${missing.length ? `The first outstanding item is: ${missing[0]}.` : getStepGuidance(controller, nextStep.id)}`,
        actions: [stepAction(nextStep.id, "Continue to")],
      };
    }

    if (requestedStep) {
      lastTopicRef.current = requestedStep;
      const available = visibleSteps.some((step) => step.id === requestedStep);
      if (!available) {
        return {
          text: `${ASSISTANT_STEP_NAMES[requestedStep]} is not available in the current section list. Select an application type first; the onboarding flow will then display only the sections required for that legal structure.`,
          actions: [stepAction("application", "Return to")],
        };
      }
      if (asksForMissingInformation(query))
        return missingResponse(requestedStep);
      if (requestedStep === "documents" && !asksWhy) return documentResponse();
      if (asksWhy) {
        return {
          text: `${getWhyGuidance(requestedStep)}\n\n${getStepGuidance(controller, requestedStep)}`,
          actions: [stepAction(requestedStep)],
        };
      }
      if (asksForNavigation(query) || query.length <= 48) {
        return {
          text: `${getStepGuidance(controller, requestedStep)}\n\nSelect the button below to go directly to ${ASSISTANT_STEP_NAMES[requestedStep]}.`,
          actions: [stepAction(requestedStep, "Go to")],
        };
      }
      return {
        text: `${getStepGuidance(controller, requestedStep)}\n\nCurrent status: ${completion[requestedStep] ? "Complete" : "Incomplete"}.`,
        actions: [stepAction(requestedStep)],
      };
    }

    if (asksForMissingInformation(query)) {
      if (!incompleteSteps.length) {
        return {
          text: submitted
            ? "Your application has been submitted and is under review. No further action is currently required."
            : "Every application section is complete. Review the summaries, confirm both final declarations and submit securely.",
          actions: submitted ? undefined : [stepAction("review", "Go to")],
        };
      }
      return {
        text: `You have ${incompleteSteps.length} incomplete section${incompleteSteps.length === 1 ? "" : "s"}. Each button below opens that exact section:\n• ${incompleteSteps.map((step) => ASSISTANT_STEP_NAMES[step.id]).join("\n• ")}`,
        actions: incompleteSteps.map((step) => stepAction(step.id, "Go to")),
      };
    }

    if (
      query.includes("document") ||
      query.includes("upload") ||
      query.includes("file") ||
      query.includes("proof") ||
      query.includes("cv")
    ) {
      if (query.includes("type") || query.includes("format")) {
        return {
          text: "Standard proof uploads accept PDF, PNG, JPG and JPEG. The CV field accepts PDF, DOC and DOCX. Selfies and profile images accept image files. Use a clear, complete file; after upload, click its file entry to open the document viewer.",
          actions: visibleSteps.some((step) => step.id === "documents")
            ? [stepAction("documents")]
            : undefined,
        };
      }
      return documentResponse();
    }

    if (
      query.includes("application type") ||
      query.includes("which type") ||
      query.includes("legal owner") ||
      query.includes("structure")
    ) {
      return {
        text: getStepGuidance(controller, "application"),
        actions: [stepAction("application", "View")],
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
          ? `${form.adviserAccess.name} currently has access to help with every application section. You remain responsible for reviewing and approving the final application.`
          : "You can invite a trusted adviser using their full name and email. Adviser access applies to every application section, is recorded, and can be revoked later.",
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
        text: "Save draft records the current application changes so you can continue later.",
        actions: [{ label: "Save my draft", kind: "save" }],
      };
    }

    if (
      query.includes("abn") ||
      query.includes("acn") ||
      query.includes("arbn") ||
      query.includes("tax") ||
      query.includes("source of funds")
    ) {
      const target: StepId = query.includes("arbn") ? "entity" : "business";
      return {
        text: getStepGuidance(controller, target),
        actions: visibleSteps.some((step) => step.id === target)
          ? [stepAction(target)]
          : [stepAction("application", "Return to")],
      };
    }

    if (
      query.includes("date of birth") ||
      query.includes("dob") ||
      query.includes("age")
    ) {
      const target: StepId =
        activeStepId === "signature" ? "signature" : "personal";
      return {
        text:
          target === "signature"
            ? "The authorised signatory’s date of birth is required and must show they are at least 18. Use the date control to navigate directly by month and year."
            : "The main applicant’s date of birth is required and must show they are at least 18. Use the date control to navigate directly by month and year.",
        actions: visibleSteps.some((step) => step.id === target)
          ? [stepAction(target)]
          : undefined,
      };
    }

    if (
      query.includes("invitation") ||
      query.includes("invite") ||
      query.includes("party")
    ) {
      return {
        text: "Joint applicants can be added using a verified Caprock client ID or invited with full name and email; a separate address is required only for the different-address joint structure. Company and trust party invitations are queued while drafting and sent after entity submission. Corporate trustees and beneficiaries also require a company structure and at least one complete nested director.",
      };
    }

    if (
      query.includes("after submission") ||
      query.includes("after submit") ||
      query.includes("what happens")
    ) {
      return {
        text: "After secure submission, a confirmation appears over Review and Submit. When dismissed, the same Review screen remains visible with an Under review status. Caprock will contact the applicant if more information is needed.",
      };
    }

    if (
      query.includes("change") ||
      query.includes("edit") ||
      query.includes("mistake")
    ) {
      return {
        text: submitted
          ? "The application is already under review. Contact your Caprock relationship contact if submitted information needs correction."
          : "Open the section list above, select the section you want to change, and save the draft after making the correction. Review and Submit also includes Edit actions.",
      };
    }

    if (
      query.includes("secure") ||
      query.includes("privacy") ||
      query.includes("safe")
    ) {
      return {
        text: "Identity, banking and compliance details are collected for onboarding and verification. Avoid entering passwords, one-time codes or unrelated sensitive information in this assistant.",
      };
    }

    if (query.includes("why") || query.includes("required")) {
      return {
        text: `${getWhyGuidance(activeStepId)}\n\n${getStepGuidance(controller, activeStepId)}`,
      };
    }

    if (
      query.includes("what do i need") ||
      query.includes("help here") ||
      query.includes("this section") ||
      query.includes("current")
    ) {
      const missing = getMissingItems(controller, activeStepId);
      return {
        text: `${getStepGuidance(controller, activeStepId)}\n\nCurrent status: ${isCurrentStepComplete ? "Complete" : "Incomplete"}.${missing.length ? `\nStill missing: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` and ${missing.length - 5} more` : ""}.` : ""}`,
        actions: [stepAction(activeStepId)],
      };
    }

    const structureNote =
      selectedApplicationType === "Not selected"
        ? "Start by selecting the legal application type."
        : `You’re completing a ${selectedApplicationType} application.`;
    return {
      text: `${structureNote}\n\nFor ${activeStepName}: ${getStepGuidance(controller, activeStepId)}\n\nAsk what is missing, name a section such as “Personal Information”, or open the section list above to navigate directly.`,
      actions: [stepAction(activeStepId)],
    };
  };

  const sendMessage = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || isTyping) return;

    const groundedResponse = createResponse(text);
    const requestController = new AbortController();
    requestRef.current?.abort();
    requestRef.current = requestController;
    const recentHistory = messages
      .slice(-8)
      .map(({ role, text: historyText }) => ({ role, text: historyText }));
    const minimumThinkingTime = new Promise((resolve) =>
      window.setTimeout(resolve, 280),
    );

    setMessages((current) => [
      ...current,
      { id: createMessageId(), role: "user", text },
    ]);
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "40px";
    setIsTyping(true);

    let responseText = groundedResponse.text;
    let responseSource: "ai" | "grounded" = "grounded";
    if (serviceMode !== "grounded") {
      try {
        responseText = await requestAssistantAnswer(
          {
            message: text,
            groundedAnswer: groundedResponse.text,
            history: recentHistory,
            context: {
              applicationType: selectedApplicationType,
              activeStepId,
              activeStepName,
              activeStepComplete: isCurrentStepComplete,
              submitted,
              incompleteSections: incompleteSteps.map(
                (step) => ASSISTANT_STEP_NAMES[step.id],
              ),
            },
          },
          requestController.signal,
        );
        responseSource = "ai";
        setServiceMode("ai");
      } catch {
        if (requestController.signal.aborted) return;
        setServiceMode("grounded");
      }
    }

    await minimumThinkingTime;
    if (requestController.signal.aborted) return;
    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: "assistant",
        ...groundedResponse,
        text: responseText,
        source: responseSource,
      },
    ]);
    setIsTyping(false);
    if (requestRef.current === requestController) requestRef.current = null;
  };

  const submitDraft = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const handleComposerKeyDown = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    void sendMessage(draft);
  };

  const runAction = (action: AssistantAction) => {
    if (action.kind === "adviser") {
      setAssistantOpen(false);
      window.setTimeout(openAdviserInvite, 100);
      return;
    }
    if (action.kind === "save") {
      if (submitted) {
        setMessages((current) => [
          ...current,
          {
            id: createMessageId(),
            role: "assistant",
            text: "This application has already been submitted and is under review, so a new draft cannot be saved.",
          },
        ]);
        return;
      }
      saveDraft();
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          text: "Your draft is being saved. The application will show confirmation when the save is complete.",
        },
      ]);
      return;
    }
    if (action.stepId) {
      const available = visibleSteps.some((step) => step.id === action.stepId);
      goToStep(available ? action.stepId : "application");
      setSectionsOpen(false);
      setAssistantOpen(false);
    }
  };

  const resetConversation = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    lastTopicRef.current = undefined;
    setIsTyping(false);
    setMessages([
      {
        id: createMessageId(),
        role: "assistant",
        text: "Conversation cleared. Ask me anything about the current requirements, your progress, or what to complete next.",
        source: "grounded",
      },
    ]);
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "40px";
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
            className="pointer-events-auto flex h-[min(92vh,780px)] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] sm:h-[min(80vh,720px)] sm:w-[440px] sm:rounded-3xl"
          >
            <header className="shrink-0 border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#003478] text-white">
                  <Bot className="h-5 w-5" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${serviceMode === "ai" ? "bg-emerald-500" : serviceMode === "checking" ? "animate-pulse bg-amber-400" : "bg-[#8aa9c7]"}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2
                      id="onboarding-assistant-title"
                      className="truncate text-sm font-semibold text-slate-950"
                    >
                      Caprock AI assistant
                    </h2>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-slate-500">
                    Live help with {activeStepName}
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
                  {selectedApplicationType} · {activeStepName}
                </span>
                <span
                  className={`ml-auto shrink-0 font-bold ${isCurrentStepComplete ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {isCurrentStepComplete ? "Complete" : "In progress"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSectionsOpen((current) => !current)}
                aria-expanded={sectionsOpen}
                aria-controls="assistant-section-navigation"
                className="mt-2 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-[#b8cadc] hover:bg-[#f8fafc]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Jump to a section
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-semibold text-slate-800">
                    {activeStepName}
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {visibleSteps.length} sections
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition ${sectionsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {sectionsOpen ? (
                <nav
                  id="assistant-section-navigation"
                  aria-label="Application sections"
                  className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-[#f8fafc] p-2"
                >
                  <div className="grid gap-1 sm:grid-cols-2">
                    {visibleSteps.map((step) => {
                      const active = step.id === activeStepId;
                      const complete = Boolean(completion[step.id]);
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() =>
                            runAction(stepAction(step.id, "Go to"))
                          }
                          aria-current={active ? "step" : undefined}
                          className={`flex min-h-10 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold transition ${active ? "bg-[#dce7f2] text-[#0f172a]" : "bg-white text-slate-600 hover:bg-[#edf3f8] hover:text-[#003478]"}`}
                        >
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${complete ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-400"}`}
                          >
                            {complete ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {ASSISTANT_STEP_NAMES[step.id]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </nav>
              ) : null}
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
                      {message.role === "assistant" && message.source ? (
                        <div className="mt-1.5 flex items-center gap-1 px-1 text-[9px] font-medium text-slate-400">
                          {message.source === "ai" ? (
                            <Wifi className="h-2.5 w-2.5" />
                          ) : (
                            <ShieldCheck className="h-2.5 w-2.5" />
                          )}
                          {message.source === "ai"
                            ? "AI response · verified against this application"
                            : "Verified application guidance"}
                        </div>
                      ) : null}
                      {message.actions?.length ? (
                        <div className="mt-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                          {message.actions.map((action) => (
                            <button
                              key={`${message.id}-${action.label}`}
                              type="button"
                              onClick={() => runAction(action)}
                              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[#c9d8e7] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#003478] transition hover:bg-[#edf3f8]"
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
                    onClick={() => {
                      void sendMessage(prompt);
                    }}
                    disabled={isTyping}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-[#b8cadc] hover:bg-[#f6f9fc] hover:text-[#003478] disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form
                onSubmit={submitDraft}
                className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm focus-within:border-[#9eb6cf] focus-within:ring-4 focus-within:ring-[#003478]/5"
              >
                <textarea
                  ref={inputRef}
                  value={draft}
                  rows={1}
                  maxLength={1200}
                  onChange={(event) => setDraft(event.target.value)}
                  onInput={(event) => {
                    event.currentTarget.style.height = "40px";
                    event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 96)}px`;
                  }}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Ask anything about your application…"
                  aria-label="Message the onboarding assistant"
                  className="min-h-10 max-h-24 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2.5 py-2.5 text-xs leading-5 text-slate-800 outline-none placeholder:text-slate-400"
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
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[9px] leading-4 text-slate-400">
                <LifeBuoy className="h-3 w-3 shrink-0" />
                Application guidance only. Don’t enter passwords, security codes
                or full ID numbers.
              </p>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
