import hljs from "highlight.js";
import { FC, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Node } from "@/components/graphs/node";
import { GraphConfigProvider, useGraphConfig } from "@/components/graphConfig";
import Hierarchy from "@/components/graphs/Hierarchy";
import Treemap from "@/components/graphs/Treemap";
import Sunburst from "@/components/graphs/Sunburst";
import { GraphProps } from "@/components/graphs/common";
import { SelectionInput } from "./input";

export type Metric = "visits" | "score" | "expected_value";
export const METRICS: Metric[] = [ "visits", "score", "expected_value" ];

export type DisplayType = "json" | "hierarchy" | "treemap" | "sunburst";
export const DISPLAY_TYPES: DisplayType[] = [ "json", "hierarchy", "treemap", "sunburst" ];

export type PythonExecutionResult = [Error | null, any];

export interface ResultsProps {
    results: PythonExecutionResult;
}
export function Results({ results: [error, result] }: ResultsProps): ReactNode {
    const [displayType, setDisplayType] = useState<DisplayType>("json");
    const [metric, setMetric] = useState<Metric>("visits");
    const [isVertical, setVertical] = useState<boolean>(true);

    const controlBarRef = useRef<HTMLDivElement | null>(null);
    const [controlBarHeight, setControlBarHeight] = useState(0);

    useLayoutEffect(() => {
        if (controlBarRef.current) {
            const { height } = controlBarRef.current.getBoundingClientRect();
            setControlBarHeight(height);
        }
    }, [controlBarRef, displayType]);

    useEffect(() => {
        if (displayType === "treemap" && metric === "expected_value")
            setMetric("visits");
    }, [displayType, metric]);
  
    let InnerResult: () => JSX.Element = () => <></>;
  
    if (error) {
      const Error = () => <ResultsError error={error} />;
      InnerResult = Error;
    } else if (result) {
      const Success = () => <ResultsSuccess result={result} />;
      InnerResult = Success;
    } else {
      const Placeholder = () => (
        <div className="flex items-center justify-center h-full">
          <p className="whitespace-pre-wrap word-wrap break-word overflow-auto p-4">
            Press &apos;Run&apos; or Press <kbd>Control</kbd> + <kbd>R</kbd> to see your results...
          </p>
        </div>
      );
      InnerResult = Placeholder;
    }
  
    return (
      <div className="w-[50vw] h-full overflow-auto">
        <div ref={controlBarRef}>
            <DisplayTypeSelector displayType={displayType} setDisplayType={setDisplayType} />
            <GraphControls displayType={displayType} metric={metric} setMetric={setMetric} isVertical={isVertical} setVertical={setVertical} />
        </div>
        <pre className="w-full" style={{ height: `calc(100% - ${controlBarHeight}px)` }}>
            <GraphConfigProvider metric={metric} displayType={displayType} isVertical={isVertical}>
                <InnerResult />
            </GraphConfigProvider>
        </pre>
      </div>
    );
}

interface DisplayTypeSelectorProps {
    displayType: DisplayType;
    setDisplayType: (type: DisplayType) => void;
}
function DisplayTypeSelector({ displayType, setDisplayType }: DisplayTypeSelectorProps): ReactNode {
    const isActive = (type: DisplayType) => displayType === type;
  
    return (
      <nav className="flex items-center justify-around">
        {DISPLAY_TYPES.map((type) => (
          <button key={type}
            className={`${isActive(type) ? "bg-purple-600" : "bg-purple-800"} p-2 border-black border-b-2 border-r-2`}
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

interface GraphControlsProps {
    displayType: DisplayType;
    metric: Metric;
    setMetric: (metric: Metric) => void;
    isVertical: boolean;
    setVertical: (isVertical: boolean) => void;
}
function GraphControls({ displayType, metric, setMetric, isVertical, setVertical }: GraphControlsProps): ReactNode {
    if (displayType === "json") return (<></>);

    const numItems = displayType === "hierarchy" ? 2 : 1;
    const width = numItems === 1 ? "w-full" : `w-1/${numItems}`;
    const selectorClasses = "border-black border-b-2 border-r-2 " + width;

    return (
        <div className="flex items-center justify-around bg-black">
            <SelectionInput 
                label="Metric"
                value={metric}
                options={METRICS.filter((m) => m !== "expected_value" || displayType !== "treemap")}
                onChange={(metric) => setMetric(metric as Metric)}
                className={selectorClasses}
            />
            {displayType === "hierarchy" &&
                <SelectionInput
                    label="Orientation"
                    value={isVertical ? "Vertical" : "Horizontal"}
                    options={["Vertical", "Horizontal"]}
                    onChange={(value) => setVertical(value === "Vertical")}
                    className={selectorClasses}
                />
            }
        </div>
    );
}

interface ResultsErrorProps {
    error: Error;
}
function ResultsError({ error }: ResultsErrorProps): ReactNode {
    return (
      <code className="text-red-500 block min-w-full overflow-x-auto p-4">{error.message}</code>
    );
}

interface ResultsSuccessProps {
    result: any;
}
function ResultsSuccess({ result }: ResultsSuccessProps): ReactNode {
    const { displayType } = useGraphConfig();

    if (displayType === "json")
        return <ResultsJSON result={result} />;
    
    return <ResultsGraph result={result} />;
}

interface ResultsJSONProps {
    result: any;
}
function ResultsJSON({ result }: ResultsJSONProps): ReactNode {
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
    }, [result, codeRef, highlightSyntax]);
  
    return (
      <code ref={codeRef} className="language-json w-full h-full">
        {JSON.stringify(result, null, 2)}
      </code>
    );
}

interface ResultsGraphProps {
    result: any;
}
function ResultsGraph({ result }: ResultsGraphProps): ReactNode {
    const { metric, displayType: type, isVertical } = useGraphConfig();

    const ref = useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  
  
    const root: Node = useMemo(() => {
      // Depth-first search to convert the JSON object into a tree
      const visit = (node: any, depth: number = 0) => {
        const name = node.action ?? "Root";
        // const expectedValue = node.score / node.visits;
        const children = node.children.map((child: any) => visit(child, depth + 1));
  
        let value: number = NaN;
        switch (metric) {
          case "visits":
            value = node.visits;
            break;
          case "score":
            value = node.score;
            break;
          case "expected_value":
            value = node.expected_value;
            break;
          default:
            throw new Error(`Unknown metric: ${metric}`);
        }
  
        const newNode = new Node(name, value, children);
  
        return newNode;
      };
  
      return visit(result.tree);
    }, [result, metric]);
  
    useEffect(() => {
      if (!ref.current) {
        console.warn("ref is null");
        return;
      }
  
      // get the dimensions of the parent element
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }, [ref]);
  
    let Graph: FC<GraphProps>;
  
    switch (type) {
      case "hierarchy":
        const DirectionalHierarchy = (props: GraphProps) => <Hierarchy {...props} isVertical={isVertical} />;
        Graph = DirectionalHierarchy;
        break;
      case "treemap":
        Graph = Treemap;
        break;
      case "sunburst":
        Graph = Sunburst;
        break;
      default:
        throw new Error(`Unknown graph type: ${type}`);
    }
  
    return (
      <div className="w-full min-h-full text-black bg-white" ref={ref}>
        <Graph root={root} width={dimensions.width} height={dimensions.height} />
      </div>
    );
}