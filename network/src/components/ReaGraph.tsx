import React, { useEffect, useRef, useState } from "react";
import sbom_data from "../assets/sbom_dep2.json";

import { GraphCanvas, GraphCanvasRef, useSelection, darkTheme } from "reagraph";

const ReaGraph = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const [nodes, setNodes] = useState<any>([]);
  const [edges, setEdges] = useState<any>([]);

  useEffect(() => {
    const dependencies: { ref: string; dependsOn: string[] }[] =
      sbom_data.dependencies;

    //TODO, decreased by 2 because the graph is too big
    for (let i = 0; i < dependencies.length / 2; i++) {
      const dependency = dependencies[i];
      const ref = dependency.ref;

      const component = sbom_data.components.find(
        (element) => element["bom-ref"] === ref
      );
      const vulnerabilities = sbom_data.vulnerabilities;
      const vuln = vulnerabilities.find((element) => {
        return element.affects.find((element) => element["ref"] === ref);
      });

      const node = {
        id: dependency.ref,
        label: component ? component.name : dependency.ref,
        fill: vuln ? "red" : "green",
      };
      setNodes((prevNodes: any) => [...prevNodes, node]);
      for (let j = 0; j < dependency.dependsOn.length; j++) {
        const dependsOn = dependency.dependsOn[j];
        const edge = {
          id: `${dependency.ref}->${dependsOn}`,
          source: dependency.ref,
          target: dependsOn,
        };
        setEdges((prevEdges: any) => [...prevEdges, edge]);
      }
    }
  }, []);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut,
  } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    pathSelectionType: "out",
  });
  return (
    <GraphCanvas
      layoutType="forceDirected2d"
      nodes={nodes}
      labelType="all"
      edges={edges}
      sizingType="pagerank"
      draggable
      ref={graphRef}
      selections={selections}
      actives={actives}
      onNodeClick={onNodeClick}
      onCanvasClick={onCanvasClick}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
      theme={darkTheme}
    />
  );
};

export default ReaGraph;
