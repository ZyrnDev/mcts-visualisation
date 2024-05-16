"use client"

import { usePyodide } from "@/components/pyodide";
import { useCallback, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

import PYTHON_TIC_TAC_TOE from "@/python/tic_tac_toe.py";

import PYTHON_PROBLEM_1 from "@/python/scenarios/ucb_initial_weight.py";
import PYTHON_PROBLEM_2 from "@/python/scenarios/opposing_action_selection.py";
import PYTHON_PROBLEM_3 from "@/python/scenarios/invalid_terminal_state.py";

import BASE_SOLUTION from "@/python/base.py";
import { NumberInput, SelectionInput } from "@/components/input";
import { useCode } from "@/components/code";
import { registerKeyboardEvents } from "@/components/common";
import { PythonExecutionResult, Results } from "@/components/results";

type Fn = () => void;
type State<T> = {
  value: T,
  update: (value: T) => void,
};
const useStateObject = <T,>(initial_value: T): State<T> => {
  const [value, setValue] = useState<T>(initial_value);
  return { value, update: setValue };
}

type Problem = {
  name: string;
  description: string;
  code: string;
  hide: boolean;
};
const PROBLEMS: Problem[] = [
  {
    name: "Solution",
    description: "Play a game of Tic Tac Toe against the computer.",
    code: PYTHON_TIC_TAC_TOE,
    hide: true,
  },
  {
    name: "Problem 1",
    description: "Solve the issue with the UCB initial weight being too low for unvisited nodes.",
    code: PYTHON_PROBLEM_1,
    hide: false,
  },
  {
    name: "Problem 2",
    description: "Solve the issue with the opposing player choosing moves that help the AI beat them.",
    code: PYTHON_PROBLEM_2,
    hide: false,
  },
  {
    name: "Problem 3",
    description: "Solve the issue where all games end at 9 moves, because the winning states still have valid moves.",
    code: PYTHON_PROBLEM_3,
    hide: false,
  },
];

export default function Home() {
  const pyodide = usePyodide();

  const problem = useStateObject(PROBLEMS[0]); // Code to load into the editor window
  const maxRuntime = useStateObject(0.25); // Max runtime in seconds should be a quarter of a second
  const maxIterations = useStateObject(100_000); // Max iterations should be 100k

  const [code, setCode, actions] = useCode(problem.value.code);
  useEffect(() => setCode(problem.value.code), [problem, setCode]);
  const [results, setResult] = useState<PythonExecutionResult>([null, null]);

  const evaluate = useCallback((code: string) => {
    console.info("Evaluating code...");
    pyodide.evaluate(BASE_SOLUTION) // Run the template code first
      .then(() => pyodide.evaluate(code)) // Then run the user's code
      .then(() => pyodide.evaluate(`mcts_json(max_iterations=${maxIterations.value}, max_runtime=${maxRuntime.value})`)) // Finally, run the mcts_json function
      .then(result => setResult([null, result])) // If successful, set the result
      .catch(err => setResult([err, null])); // If there's an error, set the error
  }, [pyodide, setResult, maxIterations.value, maxRuntime.value]);

  useEffect(() =>{
    const keybinds = {
      "r": () => evaluate(code),
      "s": () => actions.save(code),
      "l": actions.load,
      "d": actions.reset,
    };

    registerKeyboardEvents(keybinds)
  }, [actions, evaluate, code]);

  return (
    <main className="flex flex-row h-screen">
      <ControlBar 
        actions={[
          { label: "Run", keybind: ["Control", "R"], onClick: () => evaluate(code) },
          { label: "Save", keybind: ["Control", "S"], onClick: () => actions.save(code) },
          { label: "Load", keybind: ["Control", "L"], onClick: () => actions.load() },
          { label: "Reset", keybind: ["Control", "D"], onClick: () => actions.reset() },
        ]}
        problem={problem}
        maxRuntime={maxRuntime}
        maxIterations={maxIterations}
      />
      <Editor 
        defaultLanguage="python" theme="vs-dark"
        height="100%" width="40vw"
        value={problem.value.hide ? "# Code is hidden for this problem." : code}
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

interface ControlBarAction {
  label: string;
  keybind: string[];
  onClick: Fn;
}
interface ControlBarProps {
  actions: ControlBarAction[];
  problem: State<Problem>;
  maxRuntime: State<number>;
  maxIterations: State<number>;
}
function ControlBar({ actions, maxRuntime, maxIterations, problem }: ControlBarProps) {
  return (
    <div className="flex flex-col w-[10vw] h-full bg-gray-800">
      {actions.map(({ label, keybind, onClick }) => (
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
      <SelectionInput
        label="Problem"
        value={problem.value.name}
        options={PROBLEMS.map(p => p.name)}
        onChange={(selection) => problem.update(PROBLEMS.find(p => p.name === selection) ?? problem.value)}
        className="m-3 mb-0"
      />
      <hr className="m-3 mb-0 border-t-[0.25rem] border-gray-700" />
      <NumberInput
        label="Max Runtime (s)"
        value={maxRuntime.value}
        onChange={maxRuntime.update}
        className="m-3 mb-0"
      />
      <NumberInput
        label="Max Iterations (cycles)"
        value={maxIterations.value}
        onChange={maxIterations.update}
        className="m-3 mb-0"
      />
    </div>
  );
}
