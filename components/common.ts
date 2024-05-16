type GenericFunction = (...args: any[]) => any;
export function log(message: string, fn: GenericFunction): GenericFunction {
  function logMessage(...args: any[]): any {
    console.log(message, args);
    return fn(...args);
  }

  return logMessage;
}

export function registerKeyboardEvents(handlers: Record<string, () => void>) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.ctrlKey) return;

    const handler = handlers[e.key];

    if (handler) {
      handler();
      e.preventDefault();
    }
  };


  window.addEventListener("keydown", onKeyDown, true);
  return () => window.removeEventListener("keydown", onKeyDown, true);
}