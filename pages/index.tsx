
import { usePyodide } from "@/components/pyodide";
import { useCallback, useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import Editor from "@monaco-editor/react";
import Example from "@/components/graph";

type PythonExecutionResult = [Error | null, any];

const DEFAULT_CODE = `
# Your Python code should produce a single JSON-serializable result
import json

json.dumps({
    "hello": "world",
    "key": {
        "nested": "value",
        "number": 1,
        "bool": True,
        "nonce": None,
        "array": [1, 2, 3]
    }
})

`.trimStart();

export default function Home() {
  const pyodide = usePyodide();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [results, setResult] = useState<PythonExecutionResult>([null, null]);

  const evaluate = useCallback((code: string) => {
    pyodide.evaluate(code)
      .then(result => setResult([null, result]))
      .catch(err => setResult([err, null])); 
  }, [pyodide, setResult]);

  const onKeyPress = (e) => {
    if (e.key === "s" && e.ctrlKey) {
      evaluate(code);
      e.preventDefault();
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, [onKeyPress]);

  return (
    <main className="flex flex-row h-screen">
      <ControlBar onRun={() => evaluate(code)} />
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
function ControlBar({ onRun }: { onRun: Fn }) {
  const buttons = [
    { label: "Run", onClick: onRun },
  ];

  return (
    <div className="flex flex-col w-[10vw] h-full bg-gray-800">
      {buttons.map(({ label, onClick }) => (
        <button key={label} className="h-10 bg-purple-700 m-3" onClick={onClick}>{label}</button>
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
          Press 'Run' or Press <kbd>Control</kbd> + <kbd>S</kbd> to see your results...
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
      hljs.highlightBlock(codeRef.current);
    }
  }, [codeRef]);
  useEffect(() => highlightSyntax(100), [result, highlightSyntax]);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightBlock(codeRef.current);
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
      <Example width={dimensions.width} height={dimensions.height} />
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