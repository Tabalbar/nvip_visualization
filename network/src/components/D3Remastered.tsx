import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import sbom_data from "../assets/sbom_dep2.json";
import SideMenu from "./SideMenu";

import useContextMenu from "../hooks/useContextMenu";
import "../App.css";

import * as d3 from "d3";

// Colors without dim
export const isVulnerableByDependencyColor = "#CDC832";
export const isNotVulnerableLibrary = "#80807F";
const vulnerabilityColorGrad1 = [180, 2, 6] as [number, number, number];
const vulnerabilityColorGrad2 = [255, 240, 240] as [number, number, number];

// Colors when dimmed
const dimmedIsVulnerableByDependencyColor = "#444325";
const dimmedIsNotVulnerableLibrary = "#353535";
const dimmedVulnerabilityColorGrad1 = [57, 18, 20] as [number, number, number];
const dimmedVulnerabilityColorGrad2 = [145, 137, 145] as [
  number,
  number,
  number
];

const checkIfVulnerableByDependency = (node: any) => {
  const dependencies = sbom_data.dependencies;
  let dependenciesToSearch: any = [];
  const nodeInQuestion = dependencies.find((c) => c.ref === node["bom-ref"]);
  dependenciesToSearch.push(nodeInQuestion?.dependsOn);
  dependenciesToSearch = dependenciesToSearch.flat();
  while (dependenciesToSearch.length !== 0) {
    const node = dependenciesToSearch.shift();

    if (
      sbom_data.vulnerabilities.find((vuln) =>
        vuln.affects.find((affect) => affect["ref"] === node)
      )
    ) {
      return true;
    }
    const searchForMoreNodes = dependencies.find((c) => c.ref === node);
    dependenciesToSearch.push(searchForMoreNodes?.dependsOn);
    dependenciesToSearch = dependenciesToSearch.flat();
  }
  // dependencies.find((c) => c.ref === node.name);
};

// Gradient function that aaccepts two color and a value between 0 and 1
function graidentColor(
  color1: [number, number, number],
  color2: [number, number, number],
  weight: number
): string {
  const w1 = weight;
  const w2 = 1 - w1;
  const rgb = [
    Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2),
  ];
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const D3Remastered = () => {
  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState<any>([]);

  const linkRef = useRef<any>(null);
  const svgRef = useRef(null);

  const simulation = useRef<any>();

  const [nodeClicked, setNodeClicked] = useState(null);

  const selectedLinks: any[] = [];

  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const numberOfLayers = useRef(1);
  const [reactNumLayers, setReactNumLayers] = useState(1);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const k = useRef<any>(1);

  const [isSizedByIngoing, setIsSizedByIngoing] = useState(true);

  useEffect(() => {
    const tmpNodes: any = [];
    const tmpLinks: any = [];
    const components = sbom_data.components;
    const vulnerabilities = sbom_data.vulnerabilities;
    const dependencies = sbom_data.dependencies;
    let color = "";
    let dimmedColor = "";
    let outgoingSize = 2;
    let ingoingSize = 2;

    // Trying to normalize the vulnerability score
    let vulScores = vulnerabilities.map((vuln) => {
      // @ts-ignore
      return vuln.ratings[0].score;
    });
    vulScores = vulScores.filter((vuln) => vuln !== undefined);
    const minVulScore = Math.min(...vulScores);
    const maxVulScore = Math.max(...vulScores);

    for (let i = 0; i < components.length; i++) {
      const component = components[i];

      // If the library is a vulnerability, grab the vulnerability info
      // Else is undefined
      const vulnerabilityInfo: any = vulnerabilities.find((vuln) =>
        vuln.affects.find(
          (affect) => affect["ref"] === sbom_data.components[i]["bom-ref"]
        )
      );

      const isVulnerableByDependency = checkIfVulnerableByDependency(component);

      // Setting the sizes of the nodes
      for (let j = 0; j < dependencies.length; j++) {
        if (dependencies[j]["ref"] === component["bom-ref"]) {
          // Ingoing
          ingoingSize =
            dependencies[j]["dependsOn"].length < ingoingSize
              ? 4
              : dependencies[j]["dependsOn"].length;
        }

        for (let k = 0; k < dependencies[j]["dependsOn"].length; k++) {
          if (dependencies[j]["dependsOn"][k] === component["bom-ref"]) {
            // Outgoing
            outgoingSize++;
          }
        }
      }

      color = isNotVulnerableLibrary;
      dimmedColor = dimmedIsNotVulnerableLibrary;

      if (vulnerabilityInfo) {
        // normalize severity score
        const normalizedSeverityScore =
          (vulnerabilityInfo.ratings[0].score - minVulScore) /
          (maxVulScore - minVulScore);
        color = graidentColor(
          vulnerabilityColorGrad1,
          vulnerabilityColorGrad2,
          // @ts-ignore
          normalizedSeverityScore
        );
        dimmedColor = graidentColor(
          dimmedVulnerabilityColorGrad1,
          dimmedVulnerabilityColorGrad2,
          // @ts-ignore
          normalizedSeverityScore
        );
      } else if (isVulnerableByDependency) {
        color = isVulnerableByDependencyColor;
        dimmedColor = dimmedIsVulnerableByDependencyColor;
      }

      // Node info
      tmpNodes.push({
        name: component["bom-ref"],
        isComponent: false,
        info: component,
        type: "library",
        vulnerabilityInfo: vulnerabilityInfo ? vulnerabilityInfo : false,
        ingoingSize: ingoingSize,
        outgoingSize: outgoingSize,
        nodeIsClicked: false,
        color,
        isVulnerableByDependency: isVulnerableByDependency,
        dimmedColor: dimmedColor,
      });
    }

    // Setting the links
    for (let i = 0; i < dependencies.length; i++) {
      const dependency = dependencies[i];
      for (let j = 0; j < dependency["dependsOn"].length; j++) {
        const target = dependency["ref"];
        const source = dependency["dependsOn"][j];
        tmpLinks.push({
          source: source,
          target: target,
        });
      }
    }

    setNodes(tmpNodes);
    setLinks(tmpLinks);
    linkRef.current = tmpLinks;
  }, []);

  // +/- for updating the number of layers
  useEffect(() => {
    document.addEventListener(
      "keypress",
      (event) => {
        // Used to stop firing twice
        event.stopImmediatePropagation();

        const name = event.key;

        if (name === "-") {
          decreaseNumberOfLayers();
        }
        if (name === "=") {
          increaseNumberOfLayers();
        }
      },
      false
    );
    return () => {
      document.removeEventListener(
        "keypress",
        (event) => {
          const name = event.key;

          if (name === "-") {
            decreaseNumberOfLayers();
          }
          if (name === "=") {
            // increaseNumberOfLayers();
          }
        },
        false
      );
    };
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    simulation.current = d3
      .forceSimulation(nodes)
      .force(
        "charge",
        d3
          .forceCollide()
          .radius((d: any) => d.ingoingSize + 2)
          .iterations(1)
      )
      .force(
        "r",
        d3
          .forceRadial(
            (d: any) =>
              d.vulnerabilityInfo
                ? 100
                : d.isVulnerableByDependency
                ? 400
                : 700,
            width / 2.7,
            height / 2
          )
          .strength(3.5)
      )
      .on("tick", ticked)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.name)
          .distance(10)
          // .strength(0.8) // Make the blue links longer
          .strength((link: any) => {
            const areTheSameTypes =
              (link.source.vulnerabilityInfo &&
                link.target.vulnerabilityInfo) ||
              (!link.source.vulnerabilityInfo &&
                !link.target.vulnerabilityInfo) ||
              (link.source.isVulnerableByDependency &&
                link.target.isVulnerableByDependency);
            const areVulnerableAndDependency =
              (link.source.vulnerabilityInfo &&
                link.target.isVulnerableByDependency) ||
              (link.source.isVulnerableByDependency &&
                link.target.vulnerabilityInfo);

            if (areTheSameTypes) {
              return 3;
            } else if (areVulnerableAndDependency) {
              return 2;
            } else {
              return 0.1;
            }
          })
      );

    const link: any = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("refX", 17)
      .attr("refY", 6)
      .attr("stroke-width", 1)
      .attr("class", "flowDashedLine");

    const squareSize = 2;

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("z-index", 1)
      .attr("r", (d: any, i) => {
        // If want to size the nodes according to the CVSSv2 score
        return d.ingoingSize;
      })
      .attr("fill", (d: any, i) => d.color)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .on("mouseenter", function (event, d) {
        const linksToFind = findAssociatedLinks(d);
        turnOnTheseLinks(linksToFind);
      })
      .on("mouseout", (e, d: any) => {
        resetLinks();
        console.log(selectedLinks);
      })
      .on("click", (e, d: any) => {
        const linksToFind = findAssociatedLinks(d);
        let found = false;
        for (let i = 0; i < selectedLinks.length; i++) {
          if (JSON.stringify(selectedLinks[i]) == JSON.stringify(linksToFind)) {
            found = true;
            selectedLinks.splice(i, 1);
          }
        }
        if (!found) {
          selectedLinks.push(linksToFind);

          d3.selectAll("rect")
            .filter((rect: any) => {
              return rect.name === d.name;
            })
            .attr("stroke-width", 1);
        } else {
          d3.selectAll("circle")
            .filter((node: any) => {
              return d.name === node.name;
            })
            .attr("stroke-width", 0.5)
            .attr("stroke", "black");

          d3.selectAll("rect")
            .filter((rect: any) => {
              return rect.name === d.name;
            })
            .attr("stroke-width", 0);
        }
        setNodeClicked(d);
      });

    const targetSquare = svg
      .append("g")
      .attr("class", "rect")
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("width", (d: any) => {
        return (d.ingoingSize + squareSize) * 2;
      })
      .attr("height", (d: any) => {
        return (d.ingoingSize + squareSize) * 2;
      })
      .attr("stroke", "#00FFF0")
      .attr("fill-opacity", 0)
      .attr("stroke-width", 0)
      .attr("z-index", -1)
      .attr("class", "targetDashedLine")
      .attr("pointer-events", "none")
      .attr("user-select", "none");

    const text = svg
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .text((d: any) => d.info.name)
      .attr("fill", "white")
      .attr("user-select", "none")
      .attr("pointer-events", "none")
      .attr("font-size", 0);

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      text.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      targetSquare.attr(
        "transform",
        (d: any) =>
          `translate(${d.x - ((d.ingoingSize + squareSize) * 2) / 2},${
            d.y - ((d.ingoingSize + squareSize) * 2) / 2
          })`
      );
    }
  }, [nodes, links, width, height]);

  const increaseNumberOfLayers = () => {
    numberOfLayers.current++;
    setReactNumLayers((prev) => prev + 1);
  };

  const decreaseNumberOfLayers = () => {
    numberOfLayers.current--;
    setReactNumLayers((prev) => prev - 1);
  };
  function findAssociatedLinks(selectedNode: any) {
    const tmpAssociatedLinks: any = [];
    const tmpLinks = [...linkRef.current];
    const findLinks = (nodes: any, iterationNumber: number) => {
      const newNodesToSearch = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < tmpLinks.length; j++) {
          // Find all nodes that depends on the "nodes" array
          if (nodes[i].name === tmpLinks[j].source.name) {
            newNodesToSearch.push(tmpLinks[j].target);
            tmpAssociatedLinks.push(tmpLinks[j]);
          }
          // Find all nodes that the "nodes" array depends on
          if (nodes[i].name === tmpLinks[j].target.name) {
            newNodesToSearch.push(tmpLinks[j].source);
            tmpAssociatedLinks.push(tmpLinks[j]);
          }
          // I remove the node from the array so it does not count itself twice
          if (
            nodes[i].name === tmpLinks[j].source.name ||
            nodes[i].name === tmpLinks[j].target.name
          ) {
            tmpLinks.splice(j, 1);
            j -= 1;
          }
        }
      }
      iterationNumber++;

      // Only go "numberOfLayers" deep
      if (iterationNumber < numberOfLayers.current) {
        findLinks(newNodesToSearch, iterationNumber);
      } else {
        return;
      }
    };

    findLinks([selectedNode], 0);

    return tmpAssociatedLinks;
  }

  const turnOnTheseLinks = (links: any[]) => {
    d3.selectAll("line")
      .filter((l: any) => {
        return links.includes(l);
      })
      .style("stroke", "#FEFEFE")
      .style("stroke-width", 2);

    d3.selectAll("circle")
      .filter((d: any) => {
        if (
          links.find(
            (l: any) => l.source.name === d.name || l.target.name === d.name
          )
        ) {
          return false;
        } else {
          return true;
        }
      })
      .attr("fill", (d: any) => d.dimmedColor);
  };

  const resetLinks = () => {
    d3.selectAll("line")
      .filter((l: any) => {
        // This is checking if the links are IN the selectedLinks array
        for (let i = 0; i < selectedLinks.length; i++) {
          if (selectedLinks[i].includes(l)) {
            return false;
          }
        }

        return true;
      })
      .style("stroke", "none"); // Initially, turn off all links

    d3.selectAll("line")
      .filter((l) => {
        for (let i = 0; i < selectedLinks.length; i++) {
          if (selectedLinks[i].includes(l)) {
            return true;
          }
        }
        return false;
      })
      .style("stroke", "#FEFEFE")
      .style("stroke-width", 0.2);

    d3.selectAll("circle").attr("fill", (d: any) => d.color);
  };

  const handleChangeToIngoingLinks = () => {
    d3.selectAll("circle").attr("r", (d: any) => d.ingoingSize);
    setIsSizedByIngoing(true);
  };
  const handleChangeToOutgoingLinks = () => {
    d3.selectAll("circle").attr("r", (d: any) => d.outgoingSize);
    setIsSizedByIngoing(false);
  };

  return (
    <div
      style={{ backgroundColor: "#222222" }}
      onContextMenu={(e) => {
        e.preventDefault();
        setClicked(true);
        setPoints({
          x: e.pageX,
          y: e.pageY,
        });
        console.log("Right Click", e.pageX, e.pageY);
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          background: "#F3F3F3",
          padding: "0.5rem",
          color: "black",
          borderRadius: "5px",
        }}
      >
        <p style={{ fontSize: 30, margin: "1rem" }}>
          <label>Number of Layers to Show:</label>
          &nbsp;{reactNumLayers}
        </p>
        <button
          style={{
            marginRight: "1rem",
            background: isSizedByIngoing ? "#326FCD" : "#848484",
          }}
          onClick={handleChangeToIngoingLinks}
        >
          Size By # Ingoing Links
        </button>
        <button
          style={{ background: isSizedByIngoing ? "#848484" : "#326FCD" }}
          onClick={handleChangeToOutgoingLinks}
        >
          Size By # Outgoing Links
        </button>
      </div>
      <ZoomableSVG width={width} height={height} newK={k}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          overflow={"hidden"}
        ></svg>
      </ZoomableSVG>
      <SideMenu nodeInfo={nodeClicked} />
      {clicked && <ContextMenu top={points.y} left={points.x}></ContextMenu>}
    </div>
  );
};

export default D3Remastered;

function ZoomableSVG({ children, width, height, newK }: any) {
  const svgRef = useRef<any>();
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const { x, y, k } = event.transform;
      newK.current = k;
      setX(x);
      setY(y);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);
  return (
    <svg ref={svgRef} width={width} height={height}>
      <g transform={`translate(${x},${y})scale(${newK.current})`}>{children}</g>
    </svg>
  );
}

const ContextMenu = (props: { top: number; left: number }) => {
  return (
    <div
      style={{
        position: "absolute",
        width: 200,
        backgroundColor: "#383838",
        borderRadius: "5px",
        boxSizing: "border-box",
        top: props.top,
        left: props.left,
      }}
    >
      <ul
        style={{
          boxSizing: "border-box",
          padding: "10px",
          margin: 0,
          listStyle: "none",
        }}
      >
        <li style={{ padding: "18px 12px" }}>Mark as Vulnerable</li>
        <li style={{ padding: "18px 12px" }}>Mark as Safe</li>
        <li style={{ padding: "18px 12px" }}>3</li>
      </ul>
    </div>
  );
};
