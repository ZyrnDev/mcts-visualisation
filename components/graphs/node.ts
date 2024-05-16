type DepthNode = [number, Node];
type NodeVisitor = (node: Node, depth: number) => void;

// Note: This class is designed for Trees that are wider than they are deep
export class Node {
    label: string;
    value: number;
    children: Node[];

    constructor(label: string, value: number, children: Node[] = []) {
        this.label = label;
        this.value = value;
        this.children = children;
    }

    get breadth(): number {
       return Math.max.apply(null, this.breadths);
    }

    get breadths(): number[] {
        const levels: Record<number, number> = {};

        const visitNode = (_: Node, depth: number) => levels[depth] = (levels[depth] ?? 0) + 1;

        this.depthFirstTraversal(visitNode);

        // Convert the levels object into an array
        const maxDepth = Math.max(...Object.keys(levels).map(Number)) + 1;

        const breadths = new Array(maxDepth).fill(0);
        for (let i = 0; i < maxDepth; i++) {
            breadths[i] = levels[i] ?? 0;
        }

        breadths.shift(); // Remove the '0' index which is always 0

        return breadths;
    }

    get depth(): number {
        let maxDepth = 0;

        const visitNode = (_: Node, depth: number) => maxDepth = Math.max(maxDepth, depth);

        this.depthFirstTraversal(visitNode);

        return maxDepth;
    }

    breadthFirstTraversal(onVisit: NodeVisitor) {
        const queue: DepthNode[] = [[1, this]];

        while (queue.length > 0) {
            // TypeScript doesn't know that queue.length > 0 implies that queue.shift() is not null
            const [depth, current] = queue.shift() as DepthNode;

            onVisit(current, depth);
            
            for (const child of current.children) {
                queue.push([depth + 1, child]);
            }
        }
    }

    depthFirstTraversal(onVisit: NodeVisitor) {
        const stack: DepthNode[] = [[1, this]];

        while (stack.length > 0) {
            // TypeScript doesn't know that stack.length > 0 implies that stack.pop() is not null
            const [depth, current] = stack.pop() as DepthNode;

            onVisit(current, depth);

            for (const child of current.children) {
                stack.push([depth + 1, child]);
            }
        }
    }
}