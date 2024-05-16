import { ReactNode, useContext, useEffect, useState } from "react";
import { BaseGraph, GraphProps, TooltipContext } from "@/components/graphs/common";
import { Node } from "@/components/graphs/node";
import { Treemap, hierarchy, treemapSquarify } from "@visx/hierarchy";
import { Group } from "@visx/group";
import { HierarchyRectangularNode as HierarchyNode } from "@visx/hierarchy/lib/types";

export default function MyTreemap({
  root,
  width,
  height,
}: GraphProps): ReactNode {
  const [hoveredNodes, setHoveredNodes] = useState<HierarchyNode<Node>[]>([]);
  
  const isHovered = (node: HierarchyNode<Node>) => hoveredNodes.filter((n) => n.data === node.data).length > 0;
  const nodeSortValue = (node: HierarchyNode<Node>) => (isHovered(node) ? 1 : 0) * node.ancestors().length;
  const onNodeHover = (node: HierarchyNode<Node>) => {
    const validNodes = node.ancestors();
    setHoveredNodes([...hoveredNodes, node].filter((n) => validNodes.includes(n)));
  };
  return (
    <BaseGraph width={width} height={height}>
      <Treemap<Node>
        root={hierarchy(root, (node) => node.children.filter((child) => child.value > 0))}
        size={[width, height]}
        tile={treemapSquarify}
      >
        {(treemap) => (
          <Group>
            {treemap.descendants()
              .toSorted((a, b) => nodeSortValue(a) - nodeSortValue(b))
              .map((node, i) => (
                <Tile key={`node-${i}`} node={node}
                  x={node.x0} y={node.y0}
                  width={node.x1 - node.x0} height={node.y1 - node.y0}
                  onMouseEnter={onNodeHover}
                  isHovered={isHovered(node)}
                />            
            ))}
          </Group>
        )}
      </Treemap>
    </BaseGraph>
  );
}

interface TileProps {
  node: HierarchyNode<Node>;
  x: number;
  y: number;
  width: number;
  height: number;
  onMouseEnter: (node: HierarchyNode<Node>) => void;
  isHovered: boolean;
}
function Tile({ node, x, y, width, height, onMouseEnter, isHovered }: TileProps): ReactNode {
  const { showTooltip, hideTooltip } = useContext(TooltipContext);

  const depth = node.ancestors().length - 1;

  const root = node.ancestors().toReversed()[0];
  const maxDepth = root.height;

  return (
    <Group top={y} left={x}>
      <rect
        className="treemap-tile"
        width={width}
        height={height}
        stroke={isHovered ? 'red' : "#1E1E1E"}
        strokeWidth={ isHovered ? 2 : 1 }
        fill={`rgba(0, 20, 200, ${depth / maxDepth})`}
        onMouseEnter={() => onMouseEnter(node)}
        onMouseMove={showTooltip(node)}
        onMouseLeave={hideTooltip}
      />
    </Group>
  );
}