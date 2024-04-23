
import { usePyodide } from "@/components/pyodide";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import hljs from "highlight.js";
import Editor from "@monaco-editor/react";
import Example from "@/components/graph";

import default_code from "@/python/default.py";

type PythonExecutionResult = [Error | null, any];

const DEFAULT_CODE = default_code.trim();

export default function Home() {
  const pyodide = usePyodide();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [results, setResult] = useState<PythonExecutionResult>([null, null]);

  const evaluate = useCallback((code: string) => {
    console.info("Evaluating code...");
    pyodide.evaluate(code)
      .then(result => setResult([null, result]))
      .catch(err => setResult([err, null])); 
  }, [pyodide, setResult]);

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
      />
      <Editor 
        defaultLanguage="python" theme="vs-dark"
        height="100%" width="55vw"
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

type Fn = () => void;
function ControlBar({ onRun, onSave, onLoad, onClear }: { onRun: Fn, onSave: Fn, onLoad: Fn, onClear: Fn }) {
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
    <div className="w-[35vw] h-full overflow-auto">
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
    const visit = (node: any, parent: any) => {
      const name = node.action ? node.action.description : "All";
      const expectedValue = node.score / node.visits;
      const newNode = { 
        name: `${name} (${expectedValue.toFixed(3)}/${node.visits})`,
        children: node.children
          .filter((child: any) => child.visits > 0)
          .map((child: any) => visit(child, node)),
      };

      return newNode;
    };

    return visit(result.tree, null);
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

// function PyodideExample() {
//   const pyodide = usePyodide();

//   const { ready, reason } = pyodide.getStatus();
//   if (!ready) {
//     return <p>Pyodide is not ready because: {reason}</p>;
//   }

//   const result = useMemo(() => {
//     const status = pyodide.getStatus();
//     if (!status.ready) {
//       return `Pyodide is not ready because: ${status.reason}`;
//     }

//     try {
//       return pyodide.runJSON(code);
//     }
//     catch (err) {
//       return `Error: ${err}`;
//     }
//   }, [pyodide]);

//   return <LabelledCodeBlock label="Result:" code={JSON.stringify(result, null, 2)} />
// }

// function TextEditor({ code, onCodeChange, language }: { code: string, onCodeChange: (codeode: string) => void, language?: string }) {
//   const codeRef = useRef<HTMLElement | null>(null);

//   const languageClass = language ? `language-${language}` : "";
//   useEffect(() => {
//     if (!codeRef.current) {
//       console.warn("codeRef is null");
//       return;
//     }

//     if (codeRef.current) {
//       hljs.highlightBlock(codeRef.current);
//     }
//   }, [code, codeRef]);

//   return (
//     <div className="">
//       <pre>
//         <code className={languageClass} ref={codeRef}>
//           <input type="text" value={code} onChange={(e) => onCodeChange(e.target.value)} />
//         </code>
//       </pre>
//     </div>
//   );
// }