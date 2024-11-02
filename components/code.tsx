import { FC, PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
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

export class ExportConfig {
  problem: string;
  graph: string;
  metrics: string;
  update: (newConfig: ExportConfig) => void;

  constructor(problem: string, graph: string, metrics: string, update: (newConfig: ExportConfig) => void) {
    this.problem = problem;
    this.graph = graph;
    this.metrics = metrics;
    this.update = update;
  }

  filename(): string {

    return ((this.graph !== "json" && this.graph !== "hierarchy") ?
      [this.problem, this.graph, this.metrics] :
      [this.problem, this.graph])
      .map(s => s?.replace(/ /g, "").toLowerCase())
      .join("_");
  }

  setProblem(problem: string) {
    this.problem = problem;
    this.update(this);
  }

  setGraph(graph: string) {
    this.graph = graph;
    this.update(this);
  }

  setMetrics(metrics: string) {
    this.metrics = metrics;
    this.update(this);
  }
}

const ExportContext = createContext<ExportConfig>(new ExportConfig("", "", "", () => {}));
export const useExportConfig = () => useContext(ExportContext);
export const ExportConfigProvider: FC<PropsWithChildren<{
  problem: string,
  graph: string,
  metrics: string
}>> = ({ children, problem, graph, metrics }) => {
  const [config, setConfig] = useState<ExportConfig>(new ExportConfig(problem, graph, metrics, () => {}));

  useEffect(() => {
    setConfig(new ExportConfig(problem, graph, metrics, setConfig));
  }, []);

  return (
    <ExportContext.Provider value={config}>
      {children}
    </ExportContext.Provider>
  );
};
