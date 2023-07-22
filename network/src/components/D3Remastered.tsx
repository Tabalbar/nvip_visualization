import React, { useRef, useEffect, useState } from "react";
import sbom_data from "../assets/sbom_dep2.json";
import SideMenu from "./SideMenu";

import useContextMenu from "../hooks/useContextMenu";
import "../App.css";

import * as d3 from "d3";

export const isVulnerableByDependencyColor = "#CDC832";
export const isNotVulnerableLibrary = "#80807F";
const highlightedColor = "white";
const vulnerabilityColorGrad1 = [180, 2, 6] as [number, number, number];
const vulnerabilityColorGrad2 = [255, 240, 240] as [number, number, number];

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
  const [zoomLevel, setZoomLevel] = useState(1);

  const [text] = useState("");
  const [repelStrength] = useState(-200);
  const simulation = useRef<any>();

  const vulnerableStrength = 1;
  const vulnerableByDependencyStrength = 0.5;
  const regularStrength = 0.1;
  const [nodeClicked, setNodeClicked] = useState(null);

  const selectedLinks: any[] = [];

  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const numberOfLayers = useRef(1);
  const [reactNumLayers, setReactNumLayers] = useState(1);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const k = useRef<any>(1);

  useEffect(() => {
    const dependencies = sbom_data.dependencies;
    const tmpNodes: any = [];
    const tmpLinks: any = [];

    for (let i = 0; i < sbom_data.components.length; i++) {
      const component = sbom_data.components[i];
      let outgoingSize = 2;
      let ingoingSize = 2;

      const isVulnerable: any = sbom_data.vulnerabilities.find((vuln) =>
        vuln.affects.find(
          (affect) => affect["ref"] === sbom_data.components[i]["bom-ref"]
        )
      );

      let vulScores = sbom_data.vulnerabilities.map((vuln) => {
        // @ts-ignore
        return vuln.ratings[0].score;
      });
      vulScores = vulScores.filter((vuln) => vuln !== undefined);
      const minVulScore = Math.min(...vulScores);
      const maxVulScore = Math.max(...vulScores);

      const isVulnerableByDependency = checkIfVulnerableByDependency(component);

      for (let j = 0; j < sbom_data.dependencies.length; j++) {
        if (sbom_data.dependencies[j]["ref"] === component["bom-ref"]) {
          ingoingSize =
            sbom_data.dependencies[j]["dependsOn"].length < ingoingSize
              ? 3
              : sbom_data.dependencies[j]["dependsOn"].length;
        }

        for (
          let k = 0;
          k < sbom_data.dependencies[j]["dependsOn"].length;
          k++
        ) {
          if (
            sbom_data.dependencies[j]["dependsOn"][k] === component["bom-ref"]
          ) {
            outgoingSize++;
          }
        }
      }

      let color = isNotVulnerableLibrary;

      if (isVulnerable) {
        // normalize severity score
        const normalizedSeverityScore =
          (isVulnerable.ratings[0].score - minVulScore) /
          (maxVulScore - minVulScore);
        color = graidentColor(
          vulnerabilityColorGrad1,
          vulnerabilityColorGrad2,
          // @ts-ignore
          normalizedSeverityScore
        );
      } else if (isVulnerableByDependency) {
        color = isVulnerableByDependencyColor;
      }

      tmpNodes.push({
        name: component["bom-ref"],
        isComponent: false,
        info: component,
        type: "library",
        vulnerabilityInfo: isVulnerable ? isVulnerable : false,
        ingoingSize: ingoingSize,
        outgoingSize: outgoingSize,
        nodeIsClicked: false,
        color,
        isVulnerableByDependency: isVulnerableByDependency,
      });
    }
    const visitedNode = [];

    const ingoingSizes = tmpNodes.map((node: any) => node.ingoingSize);
    console.log(Math.max(...ingoingSizes));

    for (let i = 0; i < sbom_data.dependencies.length; i++) {
      const dependency = sbom_data.dependencies[i];
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
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const svg = d3.select(svgRef.current);

    simulation.current = d3
      .forceSimulation(nodes)
      .force(
        "charge",
        d3
          .forceCollide()
          .radius((d) => d.ingoingSize + 2)
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
            //   if (link.source.vulnerabilityInfo) {
            //     if (link.target.vulnerabilityInfo) {
            //       return 3;
            //     } else if (link.target.isVulnerableByDependency) {
            //       return 2;
            //     }
            //     return 0.1;
            //   } else {
            //     if (
            //       !link.source.vulnerabilityInfo &&
            //       !link.target.vulnerabilityInfo
            //     ) {
            //       return 2;
            //     }
            //     return 0.1;
            //   }
            // })
          })
      );

    const linkGroup = svg.append("g");
    const arrowMarkerId = "triangle";

    const link: any = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("refX", 17)
      .attr("refY", 6)
      .attr("stroke-width", 1);

    // d3.selectAll("line").style("opacity", 0);

    link.attr("class", "flowDashedLine");

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: any, i) => {
        //If want to size the nodes according to the CVSSv2 score
        return d.ingoingSize;
        // return 4;
      })
      .attr("fill", (d: any, i) => d.color)
      .attr("stroke", "white")
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
        }
        setNodeClicked(d);
      });

    // d3.forceSimulation(nodes).for;
    // .force("charge", d3.forceManyBody().strength(-5));
    // Append <text> elements for labels
    const text = svg
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("dy", 12)
      .attr("dx", 12)
      .attr("text-anchor", "middle")
      .text((d: any) => d.info.name)
      .attr("fill", "white")
      .attr("user-select", "none")
      .attr("pointer-events", "none")
      .attr("font-size", 3 * k.current)
      .attr("opacity", 0);

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      text.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }
  }, [nodes, links, width, height]);

  useEffect(() => {
    d3.selectAll("text").attr("font-size", 3 * k.current);
  }, [JSON.stringify(k.current)]);

  const selectNode = () => {
    const node = d3
      .selectAll("circle")
      .filter((d: any) => d.name === text)
      .attr("fill", "yellow")
      .attr("r", 10);
  };

  const handleChangeLayers = () => {
    // First Reset all the lines. This is used when trying to decrease the number of layers.
    d3.selectAll("line")
      .style("stroke", highlightedColor)
      .style("stroke-width", 1)
      .style("opacity", 0);

    // Get all nodes and update the number of layers to show
    d3.selectAll("circle").each((d: any) => {
      const linksToFind = findAssociatedLinks(d);

      if (d.nodeIsClicked) {
        d3.selectAll("line")
          .filter((l) => {
            return linksToFind.includes(l);
          })
          .style("stroke", highlightedColor)
          .style("stroke-width", 1)
          .style("opacity", 0.7);
      }
      if (numberOfLayers.current <= 0) {
        d3.selectAll("line")
          .filter((l) => {
            return linksToFind.includes(l);
          })
          .style("stroke", highlightedColor)
          .style("stroke-width", 1)
          .style("opacity", 0);
      }
    });
  };

  const increaseNumberOfLayers = () => {
    numberOfLayers.current++;
    setReactNumLayers((prev) => prev + 1);
    // handleChangeLayers();
  };

  const decreaseNumberOfLayers = () => {
    numberOfLayers.current--;
    setReactNumLayers((prev) => prev - 1);
    // handleChangeLayers();
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
        d3.selectAll("text")
          .filter((t: any) => {
            // console.log(t);
            if (
              (l.source.name === t.name && links.includes(l)) ||
              (l.target.name === t.name && links.includes(l))
            ) {
              return true;
            }
            return false;
          })
          .attr("opacity", 1)
          .attr("font-size", 20 / k.current);

        return links.includes(l);
      })
      .style("stroke", "#FEFEFE")
      .style("stroke-width", 2);
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

        d3.selectAll("circle").filter((d: any) => {
          if (d.name === l.source.name || d.name === l.target.name) {
            return false;
          } else {
            return true;
          }
        });

        // Just turn off all the text while not hovered
        d3.selectAll("text").attr("opacity", 0);
        // Returning true because I want to turn these nodes off

        return true;
      })
      .style("stroke", "none");

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
      .style("stroke-width", 0.5);
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
      {/* <button onClick={handleChangeLayers}>Click</button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          selectNode();
          simulation.current.alpha(0.5).restart();
        }}
      >
        <p>
          <label>Find Node:</label>
          <input value={text} onChange={(e) => setText(e.target.value)} />
        </p>
        </form> */}

      {/* <p>
          <label>Number of Layers to Visualize:</label>
          <input
            type="number"
            // ref={numberOfLayers}
            placeholder="1"
            onChange={(e) => {
              numberOfLayers.current = e.target.value;
              console.log(numberOfLayers);
            }}
          />
        </p> */}
      {/* <p>
          <label>Repel Strength:</label>
          <input
            value={repelStrength}
            onChange={(e) => setRepelStrength(e.target.value)}
          />{" "}
        </p>
        <p>
          <label>Cluster Strength</label>
          <input
            value={clusterStrength}
            onChange={(e) => setClusterStrength(e.target.value)}
          />{" "}
        </p> */}
      <p style={{ fontSize: 30, margin: "1rem" }}>
        <label>Number of Layers to Show:</label>
        &nbsp;{reactNumLayers}
      </p>
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
