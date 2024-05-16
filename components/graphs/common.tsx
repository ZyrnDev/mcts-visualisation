import { localPoint } from "@visx/event";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { PropsWithChildren, ReactNode, createContext } from "react";

import { Node } from "@/components/graphs/node";
import { HierarchyNode } from "@visx/hierarchy/lib/types";

export interface GraphProps<NodeType = Node> {
  root: NodeType;
  width: number;
  height: number;
}

type TooltipFunctions = {
  showTooltip: (node: HierarchyNode<Node>) => (event: React.MouseEvent) => void,
  hideTooltip: (event: React.MouseEvent) => void,
};
export const TooltipContext = createContext<TooltipFunctions>({
  showTooltip: (node: HierarchyNode<Node>) => () => console.error("Tooltip not initialised", node),
  hideTooltip: ()                                => console.error("Tooltip not initialised"),
});

export interface BaseGraphProps {
  width: number;
  height: number;
}
export function BaseGraph({ width, height, children }: PropsWithChildren<BaseGraphProps>): ReactNode { 
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip: showTooltipRaw,
    hideTooltip,
  } = useTooltip<HierarchyNode<Node>>();
    
  const {
    containerRef,
    TooltipInPortal
  } = useTooltipInPortal({
    scroll: true,
    detectBounds: true
  });

  const showTooltip = (node: HierarchyNode<Node>) => {
    const eventHandler = (event: React.MouseEvent) => {
      const coords = localPoint(event);

      showTooltipRaw({
        tooltipLeft: coords?.x ?? 0,
        tooltipTop: coords?.y ?? 0,
        tooltipData: node,
      });
    };

    return eventHandler;
  };
    
  return (
    <>
      <svg ref={containerRef} width={width} height={height}>
        <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
          {children}
        </TooltipContext.Provider>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          className="text-white bg-black bg-opacity-70 p-2 rounded-md shadow-md"
          unstyled={true}
          applyPositionStyle={true}
        >
          <Tooltip node={tooltipData} />
        </TooltipInPortal>
      )}
    </>
  );
}

interface TooltipProps {
  node: HierarchyNode<Node>;
}
function Tooltip({ node }: TooltipProps): ReactNode {
  const board = boardState(node);

  return (
    <div className="flex flex-row gap-4 ">
      <p>
          <label className="font-bold text-lg">
            Board:
          </label>
          <br />
          <pre className="inline-block text-white bg-black bg-opacity-50 p-2 rounded-md leading-none font-mono">
            {board}
          </pre>
      </p>
      <div className="flex flex-col justify-around">
        <p>
          <label className="font-bold text-lg">Action:</label>
          <pre>{node.data.label}</pre>
        </p>
        <p>
          <label className="font-bold text-lg">Value:</label>
          <pre>{node.data.value}</pre>
        </p>
      </div>
    </div>
  );
}

export function colour(h: number, s: number, l: number, a: number = 1): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

class Action {
  player: string;
  position: [number, number];

  constructor(action: string) {
    const player = action[0];

    const position = action
      .slice(2, action.length - 1)
      .split(",")
      .map((s) => s.trim())
      .map(Number) as [number, number];

    this.player = player;
    this.position = position
  }
}

function generateActionSequence(node: HierarchyNode<Node>): Action[] {
  return node.ancestors()
    .filter(n => n.data.label !== "None")
    .map((n) => new Action(n.data.label));
}

function boardState(node: HierarchyNode<Node>): string {
  const actions = generateActionSequence(node);

  const boardSize = 3;

  const board = Array(boardSize).fill(0).map(() => Array(boardSize).fill(" "));
  actions.forEach((action, i) => {
    const [x, y] = action.position;
    board[x][y] = action.player;
  });

  const horizontalLine = "-".repeat(boardSize * 2 - 1);

  return board.map((row) => row.join("|")).join("\n" + horizontalLine + "\n");
}