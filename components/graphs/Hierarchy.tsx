import React, { ReactNode, useContext, useState } from 'react';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { Node } from '@/components/graphs/node';
import { BaseGraph, GraphProps, TooltipContext } from '@/components/graphs/common';
import { LinkHorizontalStep, LinkVerticalStep } from '@visx/shape';
import { HierarchyNode } from '@visx/hierarchy/lib/types';

export function VerticalHierarchy(args: GraphProps<Node>) {
  return <Hierarchy {...args} isVertical />;
}

export function HorizontalHierarchy(args: GraphProps<Node>) {
  return <Hierarchy {...args} />;
}

interface HierarchyProps extends GraphProps<Node> {
  isVertical?: boolean;
}
export default function Hierarchy({
  root,
  width,
  height,
  isVertical = false,
}: HierarchyProps) {
  const LinkComponent = isVertical ? LinkVerticalStep : LinkHorizontalStep;

  const padding = 15;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const treeRoot = hierarchy<Node>(root, (node) => node.children);

  const [subtreeRoot, setSubtreeRoot] = useState<HierarchyNode<Node>>(treeRoot);
  const updateSubtree = (newRoot: HierarchyNode<Node>) => setSubtreeRoot(newRoot);
  const resetSubtree = () => setSubtreeRoot(treeRoot);

  return (
    <BaseGraph width={width} height={height}>
      <Group top={padding} left={padding}>
        <Tree
          root={subtreeRoot}
          size={[innerWidth, innerHeight]}
          separation={(a, b) => (a.parent === b.parent ? 1 : 0.5) / a.depth}
        >
          {(tree) => (
            <Group>
              {tree.links().map((link, i) => (
                <LinkComponent
                  key={i}
                  data={link}
                  percent={0.5}
                  stroke="rgb(0,0,0,0.6)"
                  strokeWidth="1"
                  fill="none"
                />
              ))}

              {tree.descendants().map((node, key) => (
                <TreeNode key={`node-${key}`}
                  node={node}
                  x={isVertical ? node.x : node.y}
                  y={isVertical ? node.y : node.x}
                  onClick={(node) => node === subtreeRoot ? resetSubtree() : updateSubtree(node)}
                />
              ))}
            </Group>
          )}
        </Tree>
      </Group>
    </BaseGraph>
  );
}

interface TreeNodeProps {
  node: HierarchyNode<Node>;
  x: number;
  y: number;
  onClick?: (node: HierarchyNode<Node>) => void;
}
function TreeNode({ node, x, y, onClick }: TreeNodeProps): ReactNode {
  const { showTooltip, hideTooltip } = useContext(TooltipContext);

  const depth = node.ancestors().length - 1;

  const root = node.ancestors().toReversed()[0];
  const maxDepth = root.height + 1;

  const width = 20;
  const height = 20;

  return (
    <Group top={y} left={x}>
      <rect
        width={width}
        height={height}
        x={-width / 2}
        y={-height / 2}
        data-depth={depth}
        data-max-depth={maxDepth}
        data-root={root.data.label}
        fill={`hsl(${ depth / maxDepth * 360}, 70%, 50%)`}
        stroke='black'
        onClick={() => onClick && onClick(node)}
        onMouseMove={showTooltip(node)}
        onMouseLeave={hideTooltip}
      />
    </Group>
  );
}