
import { usePyodide } from "@/components/pyodide";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import hljs from "highlight.js";
import Editor from "@monaco-editor/react";
import Example from "@/components/graph";

import TIC_TAC_TOE_SOLUTION from "@/python/tic_tac_toe.py";
import BASE_SOLUTION from "@/python/base.py";
import { NumberInput } from "@/components/input";

type Fn = () => void;
type State<T> = {
  value: T,
  update: (value: T) => void,
};
const createState = <T,>(initial_value: T): State<T> => {
  const [value, setValue] = useState<T>(initial_value);
  return { value, update: setValue };
}

type PythonExecutionResult = [Error | null, any];

const DEFAULT_CODE = TIC_TAC_TOE_SOLUTION.trim();

export default function Home() {
  const pyodide = usePyodide();

  const [code, setCode] = useState(DEFAULT_CODE);
  const [results, setResult] = useState<PythonExecutionResult>([null, null]);

  const max_runtime = createState(0.25); // Max runtime in seconds should be a quarter of a second
  const max_iterations = createState(100_000); // Max iterations should be 100k


  const evaluate = useCallback((code: string) => {
    console.info("Evaluating code...");
    pyodide.evaluate(BASE_SOLUTION) // Run the template code first
      .then(() => pyodide.evaluate(code)) // Then run the user's code
      .then(() => pyodide.evaluate(`mcts_json(max_iterations=${max_iterations.value}, max_runtime=${max_runtime.value})`)) // Finally, run the mcts_json function
      .then(result => setResult([null, result])) // If successful, set the result
      .catch(err => setResult([err, null])); // If there's an error, set the error
  }, [pyodide, setResult, max_iterations.value, max_runtime.value]);

  const save = useCallback((code: string) => {
    console.info("Saving code...");
    localStorage.setItem("code", code);
  }, []);
  
  const load = useCallback(() => {
    console.info("Loading code...");
    const code = localStorage.getItem("code");
    if (code) {
      setCode(code);
    }
  }, []);

  const clear = useCallback(() => {
    console.info("Clearing code...");
    localStorage.removeItem("code");
    setCode(DEFAULT_CODE);
  }, []);

  const onKeyDown = (e) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case "r":
          evaluate(code);
          e.preventDefault();
          break;
        case "s":
          save(code);
          e.preventDefault();
          break;
        case "l":
          load();
          e.preventDefault();
          break;
        case "d":
          clear();
          e.preventDefault();
          break;
      }
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onKeyDown]);

  return (
    <main className="flex flex-row h-screen">
      <ControlBar 
        onRun={() => evaluate(code)}
        onSave={() => save(code)}
        onLoad={load}
        onClear={clear}
        max_runtime={max_runtime}
        max_iterations={max_iterations}
      />
      <Editor 
        defaultLanguage="python" theme="vs-dark"
        height="100%" width="40vw"
        value={code}
        onChange={(value) => {
          if (typeof value === "string") {
            setCode(value);
          } else {
            console.warn("value is not a string:", value);
          }
        }}
        />
      <Results results={results} />
    </main>
  );
}

function ControlBar({ onRun, onSave, onLoad, onClear, max_runtime, max_iterations }: { onRun: Fn, onSave: Fn, onLoad: Fn, onClear: Fn, max_runtime: State<number>, max_iterations: State<number> }) {
  const buttons = [
    { label: "Run", keybind: ["Control", "R"], onClick: onRun },
    { label: "Save", keybind: ["Control", "S"], onClick: onSave },
    { label: "Load", keybind: ["Control", "L"], onClick: onLoad },
    { label: "Clear", keybind: ["Control", "D"], onClick: onClear },
  ];

  return (
    <div className="flex flex-col w-[10vw] h-full bg-gray-800">
      {buttons.map(({ label, keybind, onClick }) => (
        <button 
          key={label}
          className="h-10 bg-purple-700 m-3 mb-0"
          title={`${keybind.join(" + ")}`}
          onClick={onClick}
        >
          {label}
        </button>
      ))}
      <hr className="m-3 mb-0 border-t-[0.25rem] border-gray-700" />
      <NumberInput label="Max Runtime (s)" value={max_runtime.value} onChange={max_runtime.update} className="h-10 m-3 mb-0 p-3" />
      <NumberInput label="Max Iterations (cycles)" value={max_iterations.value} onChange={max_iterations.update} className="h-10 m-3 mb-0 p-3" />
    </div>
  );
}

function Results({ results: [error, result] }: { results: PythonExecutionResult }) {
  const [displayType, setDisplayType] = useState<DisplayType>("json");

  let InnerResult: () => JSX.Element = () => <></>;

  if (error) {
    InnerResult = () => <ResultsError error={error} />;
  } else if (result) {
    InnerResult = () => <ResultsSuccess result={result} displayType={displayType} />;
  } else {
    InnerResult = () => 
      <div className="flex items-center justify-center h-full">
        <p className="whitespace-pre-wrap word-wrap break-word overflow-auto p-4">
          Press 'Run' or Press <kbd>Control</kbd> + <kbd>R</kbd> to see your results...
        </p>
      </div>;
  }

  return (
    <div className="w-[50vw] h-full overflow-auto">
      <DisplayTypeSelector displayType={displayType} setDisplayType={setDisplayType} />
      <pre className="w-full h-full">
        <InnerResult />
      </pre>
    </div>
  );
}


type DisplayType = "json" | "graph";
const DISPLAY_TYPES: DisplayType[] = [ "json", "graph" ];

function DisplayTypeSelector({ displayType, setDisplayType }: { displayType: DisplayType, setDisplayType: (type: DisplayType) => void }) {
  const isActive = (type: DisplayType) => displayType === type;

  return (
    <nav className="flex items-center justify-around">
      {DISPLAY_TYPES.map((type) => (
        <button key={type}
          className={`${isActive(type) ? "bg-purple-600" : "bg-purple-700"} p-2`}
          disabled={isActive(type)}
          style={{ width: `${(100 / (DISPLAY_TYPES.length)).toFixed(0)}%` }}
          onClick={() => setDisplayType(type)}
        >
          {type.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}

function ResultsError({ error }: { error: Error }) {
  return (
    <code className="text-red-500 block min-w-full overflow-x-auto p-4">{error.message}</code>
  );
}

function ResultsJSON({ result }: { result: any }) {
  const maxHighlightDelay = 5000; // in ms
  const codeRef = useRef<HTMLElement | null>(null);

  const highlightSyntax = useCallback((retryDelay: number) => {
    if (!codeRef.current) {
      if (retryDelay < maxHighlightDelay) {
        console.warn(`Unable to syntax highlight the results, trying again in ${retryDelay}ms`);
        setTimeout(highlightSyntax, retryDelay, retryDelay * 2);
      } else {
        console.error(`Unable to syntax highlight the results, giving up since retryDelay (${retryDelay}) exceeded the maximum (${maxHighlightDelay})`);
      }
      return;
    }
    
    if (codeRef.current) {
      delete codeRef.current.dataset.highlighted
      hljs.highlightElement(codeRef.current);
    }
  }, [codeRef]);

  useEffect(() => {
    if (codeRef.current) {
      highlightSyntax(100);
    }
  }, [result, codeRef]);

  return (
    <code ref={codeRef} className="language-json w-full h-full">
      {JSON.stringify(result, null, 2)}
    </code>
  );
}

function ResultsGraph({ result }: { result: any }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });


  const root = useMemo(() => {
    // Depth-first search to convert the JSON object into a tree
    const visit = (node: any, depth: number = 0) => {
      const name = node.action ?? "All";
      const expectedValue = node.score / node.visits;
      const newNode = { 
        name: `${name} (${expectedValue.toFixed(3)}/${node.visits})`,
        children: node.children
          .filter((child: any) => child.visits > 0)
          .map((child: any) => visit(child, depth + 1)),
        isExpanded: depth <= 1,
      };

      return newNode;
    };

    return visit(result.tree);
  }, [result]);

  useEffect(() => {
    if (!ref.current) {
      console.warn("ref is null");
      return;
    }

    // get the dimensions of the parent element
    const { width, height } = ref.current.getBoundingClientRect();
    setDimensions({ width, height });
  }, [ref]);

  return (
    <div className="w-full h-full text-black bg-white" ref={ref}>
      <Example root={root} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

function ResultsSuccess({ result, displayType }: { result: any, displayType: DisplayType }) {
  switch (displayType) {
    case "json":
      return <ResultsJSON result={result} />;
    case "graph":
      return <ResultsGraph result={result} />;
  }
}