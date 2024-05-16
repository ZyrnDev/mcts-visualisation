import { FC, PropsWithChildren, ReactNode, createContext, useContext } from "react";

import { DisplayType, Metric } from "@/components/results";

export type GraphConfig = {
    metric: Metric,
    displayType: DisplayType,
    isVertical: boolean,
};

const DEFAULT_GRAPH_CONFIG: GraphConfig = {
    metric: "visits",
    displayType: "json",
    isVertical: true,
};
export const GraphConfigContext = createContext<GraphConfig>(DEFAULT_GRAPH_CONFIG);

export function useGraphConfig(): GraphConfig {
    return useContext(GraphConfigContext);
}

export function GraphConfigProvider({ metric, displayType, isVertical, children }: PropsWithChildren<GraphConfig>): ReactNode {
    return (
        <GraphConfigContext.Provider value={{ metric, displayType, isVertical }}>
            {children}
        </GraphConfigContext.Provider>
    );
}
