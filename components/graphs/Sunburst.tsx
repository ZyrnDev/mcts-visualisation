import { ReactNode, useContext, useEffect, useState } from 'react';

import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { PieArcDatum, ProvidedProps } from '@visx/shape/lib/shapes/Pie';

import { Node } from '@/components/graphs/node';
import { BaseGraph, GraphProps, TooltipContext } from '@/components/graphs/common';
import { hierarchy } from '@visx/hierarchy';
import { HierarchyNode } from '@visx/hierarchy/lib/types';

interface TextBoxProps {
  lines: string[];
  x: number;
  y: number;
}
function TextBox({ lines, x, y, }: TextBoxProps): ReactNode {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {lines.map((line, i) => (
        <text key={i} dy={`${i + 1}em`}>{line}</text>
      ))}
    </g>
  );
}

// Hue, Saturation & Lightness are percentages represented as a number between 0 and 1
// Returns a CSS hsl colour string
function colour(hue: number, saturation: number = 0.7, lightness: number = 0.5): string {
  return `hsl(${hue * 360}, ${saturation * 100}%, ${lightness * 100}%)`;
}

function radiansToPercentage(radians: number): number {
  return radians / Math.PI / 2;
}

export default function Sunburst({
  root,
  width,
  height
}: GraphProps) {
  // root.breadthFirstTraversal((node: Node, depth: number) => { if (depth > 2) node.children = []; });

  const breadth = root.breadth;
  const depth = root.depth;

  const margin = 5;
  const maxRadius = Math.min(width, height) / 2 - margin;

  return (
    <BaseGraph width={width} height={height}>
      <TextBox lines={[`breadth: ${breadth}`, `depth: ${depth}`]} x={10} y={10} />
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        <SunburstRoot
          root={root}
          radius={maxRadius}
        />
      </g>
    </BaseGraph>
  )
}

interface SunburstRootProps {
  root: Node;
  radius: number;
}
function SunburstRoot({ root, radius }: SunburstRootProps): ReactNode {
  const treeRoot = hierarchy<Node>(root, (node) => node.children);

  const [subtreeRoot, setSubtreeRoot] = useState<HierarchyNode<Node>>(treeRoot);
  const updateSubtree = (newRoot: HierarchyNode<Node>) => setSubtreeRoot(newRoot);
  const resetSubtree = () => setSubtreeRoot(treeRoot);

  const depth = treeRoot.height;

  return (
    <Segment
      node={{ children: [subtreeRoot] } as HierarchyNode<Node>}
      startAngle={0}
      endAngle={Math.PI * 2}
      depth={0}
      maxDepth={depth}
      radius={radius}
      onClick={(node) => node === subtreeRoot ? resetSubtree() : updateSubtree(node)}
    />
  );
}

interface SegmentProps {
  node: HierarchyNode<Node>
  startAngle: number;
  endAngle: number;
  depth: number;
  maxDepth: number;
  radius: number;
  onClick?: (node: HierarchyNode<Node>) => void;
}
function Segment({ node, startAngle, endAngle, depth, maxDepth, radius, onClick }: SegmentProps): ReactNode {
  return (
    <g>
      <Pie
        children={(props) => 
          <SegmentCustomPieChildren
            {...props}
            depth={depth}
            maxDepth={maxDepth}
            radius={radius}
            onClick={onClick}
          />
        }
        data={node.children}
        pieValue={(node) => node.data.value}
        innerRadius={depth / maxDepth * radius}
        outerRadius={(depth + 1) / maxDepth * radius}
        startAngle={startAngle}
        endAngle={endAngle}
      />
    </g>
  );
}

type SegmentCustomPieChildrenProps = ProvidedProps<HierarchyNode<Node>> & {
  depth: number;
  maxDepth: number;
  radius: number;
  onClick?: (node: HierarchyNode<Node>) => void;
}
function SegmentCustomPieChildren({ path, arcs, pie, depth, maxDepth, radius, onClick }: SegmentCustomPieChildrenProps): ReactNode {
  return (
    <Group className="custom-pie-arcs-group">
      {arcs.map((arc, i) => (
        <>
          <PieSegment
            key={`custom-pie-arc-${i}`}
            arc={arc}
            path={path}
            fill={colour(radiansToPercentage(arc.startAngle), 0.7, depth / (maxDepth - 1) * .6 + 0.2)}
            text={depth < 2}
            onClick={onClick}
          />
          <Segment
            node={arc.data}
            startAngle={arc.startAngle}
            endAngle={arc.endAngle}
            depth={depth + 1}
            maxDepth={maxDepth}
            radius={radius}
            onClick={onClick}
          />
        </>
      ))}
    </Group>
  );
}

interface PieSegmentProps {
  arc: PieArcDatum<HierarchyNode<Node>>;
  path: ProvidedProps<HierarchyNode<Node>>['path'];
  fill?: string | ((arc: PieArcDatum<HierarchyNode<Node>>) => string);
  text: boolean,
  onClick?: (node: HierarchyNode<Node>) => void;
}
function PieSegment({ arc, path, fill, text, onClick }: PieSegmentProps): React.ReactNode {
  const { showTooltip, hideTooltip } = useContext(TooltipContext);

  return (
    <g>
      <path
        d={path(arc) ?? ''}
        fill={fill == null || typeof fill === 'string' ? fill : fill(arc)}
        stroke='rgba(0, 0, 0, 0.33)'
        onMouseMove={showTooltip(arc.data)}
        onMouseLeave={hideTooltip}
        onClick={(event) => onClick && onClick(arc.data)}
      />
    </g>
  )
}