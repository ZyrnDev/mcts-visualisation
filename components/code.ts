import { useState } from "react";
import { log } from "@/components/common";

export type CodeHook = [
  string,
  (newCode: string) => void,
  actions: {
    save: (newCode: string) => void,
    load: () => void,
    reset: () => void
  }
];

export function useCode(defaultCode: string): CodeHook {
  const [code, setCode] = useState<string>(defaultCode);


  const save = log("Saving code...", (newCode: string) => {
    localStorage.setItem("code", newCode);
  });

  const load = () => log("Loading code...", () => {
    const savedCode = localStorage.getItem("code");
    
    if (savedCode) {
      setCode(savedCode);
    }
  });

  const reset = log("Resetting code...", () => {
    localStorage.removeItem("code");
    setCode(defaultCode);
  });

  return [code, setCode, { save, load, reset }];
}