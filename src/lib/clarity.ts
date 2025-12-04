declare global {
  interface Window {
    clarity?: ClarityCommand;
  }
}

export type ClarityCommand = ((
  command: string,
  ...args: Array<string | number | boolean | Record<string, unknown>>
) => void) & {
  q?: unknown[];
};

let clarityInitialized = false;

export const initClarity = () => {
  if (clarityInitialized) return;

  const clarityId = import.meta.env.VITE_CLARITY_ID;
  if (!clarityId) {
    if (import.meta.env.DEV) {
      console.info('[Clarity] VITE_CLARITY_ID tanımlı değil, script yüklenmeyecek.');
    }
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[data-clarity-id="${clarityId}"]`
  );
  if (existingScript) {
    clarityInitialized = true;
    return;
  }

  const clarityWindow = window as Window & { clarity?: ClarityCommand };
  clarityWindow.clarity =
    clarityWindow.clarity ||
    (function (...args: Parameters<ClarityCommand>): void {
      (clarityWindow.clarity!.q = clarityWindow.clarity!.q || []).push(args);
    } as ClarityCommand);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${clarityId}`;
  script.setAttribute('data-clarity-id', clarityId);
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);

  clarityInitialized = true;
};
