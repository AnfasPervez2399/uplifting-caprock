import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FullScreenLoader } from "./FullScreenLoader";

export interface LoaderOptions {
  message?: string;
  detail?: string;
}

interface WithLoaderOptions extends LoaderOptions {
  minimumDuration?: number;
}

interface LoaderContextValue {
  isLoading: boolean;
  showLoader: (options?: LoaderOptions) => void;
  hideLoader: () => void;
  withLoader: <T>(
    operation: Promise<T> | (() => Promise<T>),
    options?: WithLoaderOptions,
  ) => Promise<T>;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

const wait = (duration: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, duration));

const waitForPaint = () =>
  new Promise<void>((resolve) =>
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => resolve()),
    ),
  );

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [activeRequests, setActiveRequests] = useState(0);
  const [loaderOptions, setLoaderOptions] = useState<LoaderOptions>({});

  const showLoader = useCallback((options: LoaderOptions = {}) => {
    setLoaderOptions(options);
    setActiveRequests((current) => current + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setActiveRequests((current) => Math.max(0, current - 1));
  }, []);

  useEffect(() => {
    if (activeRequests === 0) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeRequests]);

  const withLoader = useCallback(
    async <T,>(
      operation: Promise<T> | (() => Promise<T>),
      options: WithLoaderOptions = {},
    ): Promise<T> => {
      const { minimumDuration = 0, message, detail } = options;
      const startedAt = performance.now();
      showLoader({ message, detail });

      try {
        // Give React time to commit and paint the full-screen overlay before
        // starting work that may immediately occupy the browser's main thread.
        await waitForPaint();
        return await (typeof operation === "function"
          ? operation()
          : operation);
      } finally {
        const remainingDuration =
          minimumDuration - (performance.now() - startedAt);
        if (remainingDuration > 0) await wait(remainingDuration);
        hideLoader();
      }
    },
    [hideLoader, showLoader],
  );

  const value = useMemo<LoaderContextValue>(
    () => ({
      isLoading: activeRequests > 0,
      showLoader,
      hideLoader,
      withLoader,
    }),
    [activeRequests, hideLoader, showLoader, withLoader],
  );

  const loader =
    activeRequests > 0 ? (
      <FullScreenLoader
        message={loaderOptions.message}
        detail={loaderOptions.detail}
      />
    ) : null;

  return (
    <LoaderContext.Provider value={value}>
      {children}
      {loader && typeof document !== "undefined"
        ? createPortal(loader, document.body)
        : loader}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used inside LoaderProvider.");
  }
  return context;
}

export default LoaderProvider;
