import React, { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const randomNumberGenerator = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const SelectedNode = (props: { nodeInfo: any; selectedLinks: any }) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const tmpElements = [];
    if (props.nodeInfo === null) {
      setElements([]);
      return;
    }
    for (let i = 0; i < props.selectedLinks.length; i++) {
      const source = props.selectedLinks[i].source;
      if (!source) return;
      const target = props.selectedLinks[i].target;
      const x1 = randomNumberGenerator(20, 200);
      const y1 = randomNumberGenerator(20, 200);

      const selectedNodeName = props.nodeInfo.name;

      if (
        elements.find((e: any) => {
          return e.data.id === source.name;
        }) === undefined
      ) {
        tmpElements.push({
          data: { id: source.name, label: source.info.name },
          position: { x: x1, y: y1 },
          selected: selectedNodeName === source.name,
        });
      }
      const x2 = randomNumberGenerator(20, 200);
      const y2 = randomNumberGenerator(20, 200);
      if (elements.find((e: any) => e.data.id === target.name) === undefined) {
        tmpElements.push({
          data: { id: target.name, label: target.info.name },
          position: { x: x2, y: y2 },
          selected: selectedNodeName === target.name,
        });
      }
      tmpElements.push({
        data: {
          source: source.name,
          target: target.name,
          label: props.selectedLinks[i].label,
        },
      });
    }
    setElements(tmpElements);
  }, [props.selectedLinks]);
  return (
    <div
      style={{
        position: "fixed",
        height: "300px",
        bottom: "2rem",
        right: "2rem",

        border: "1px solid black",
        width: "350px",
        display: "flex",

        flexDirection: "column",
        textAlign: "left",
        backgroundColor: "#DDDDDD",
        boxShadow: "5px 5px  black",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "rgb(35, 169, 220)",
            width: "100%",
            textAlign: "center",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
              paddingTop: "0.3rem",
              height: "2rem",
            }}
          >
            Selected Node Tree
          </h1>
        </div>
        <CytoscapeComponent
          elements={elements}
          style={{ width: "350px", height: "310px" }}
        />
      </div>
    </div>
  );
};

export default SelectedNode;
