//@ts-nocheck
import React, { useCallback, useEffect } from "react";
import sbom_data from "../assets/sbom_dep2.json";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "reactflow";

import "reactflow/dist/style.css";

const initialNodes: Node<any, string | undefined>[] = [];
const initialEdges: any = [];

const ReactFlowGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useNodesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((es: Edge) => addEdge(params, es)),
    []
  );

  useEffect(() => {
    const dependencies: { ref: string; dependsOn: string[] }[] =
      sbom_data.dependencies;
    for (let i = 0; i < dependencies.length; i++) {
      const dependency = dependencies[i];
      const node = {
        id: dependency.ref,
        position: { x: 0 + i * 200, y: 0 + i * 50 },
        data: { label: dependency.ref },
      };
      setNodes((prevNodes) => [...prevNodes, node]);
      for (let j = 0; j < dependency.dependsOn.length; j++) {
        const dependsOn = dependency.dependsOn[j];
        const edge = {
          id: `${dependency.ref}-${dependsOn}`,
          source: dependency.ref,
          target: dependsOn,
        };
        setEdges((prevEdges) => [...prevEdges, edge]);
      }
    }
  }, []);
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>{" "}
    </div>
  );
};

export default ReactFlowGraph;
