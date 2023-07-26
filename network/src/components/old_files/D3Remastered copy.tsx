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

  const [isSizedByIngoing, setIsSizedByIngoing] = useState(true);

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
              ? 4
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
      let dimmedColor = dimmedIsNotVulnerableLibrary;

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
        dimmedColor: dimmedColor,
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

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  useEffect(() => {
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const svg = d3.select(svgRef.current);
    const squareSize = 5;

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
      .attr("z-index", 1)
      .attr("r", (d: any, i) => {
        //If want to size the nodes according to the CVSSv2 score
        return d.ingoingSize;
        // return 4;
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

          // d3.selectAll("rect")
          //   .filter((rect: any) => {
          //     return rect.name === d.name;
          //   })
          //   .attr("stroke-width", 0.5);

          // #13EC44 green
          // #08A5F7 Cyan
          // #280EF1 Dark Blue
          // #00FFF0 Very Light Cyan
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

    const re;

    // const topLeft = svg
    //   .append("g")
    //   .selectAll("polyline")
    //   .data(nodes)
    //   .enter()
    //   .append("polyline")
    //   .attr("points", `-4,-2 ,-4 -4, -2, -4`)
    //   .attr("stroke", "#00FFF0")
    //   .attr("fill", "transparent")
    //   .attr("stroke-width", 1)
    //   .attr("z-index", -1)
    //   .attr("scale", 3)
    //   .attr("user-select", "none")
    //   .attr("pointer-events", "none");

    // const topRight = svg
    //   .append("g")
    //   .attr("class", "rect")
    //   .selectAll("rect")
    //   .data(nodes)
    //   .enter()
    //   .append("polyline")
    //   .attr("points", "4,-2 ,4 -4, 2, -4")
    //   .attr("stroke", "#00FFF0")
    //   .attr("fill", "transparent")
    //   .attr("stroke-width", 1)
    //   .attr("z-index", -1)
    //   .attr("user-select", "none")
    //   .attr("pointer-events", "none");

    // const bottomLeft = svg
    //   .append("g")
    //   .attr("class", "rect")
    //   .selectAll("rect")
    //   .data(nodes)
    //   .enter()
    //   .append("polyline")
    //   .attr("points", "-4,2 ,-4 4, -2, 4")
    //   .attr("stroke", "#00FFF0")
    //   .attr("fill", "transparent")
    //   .attr("stroke-width", 1)
    //   .attr("z-index", -1)
    //   .attr("user-select", "none")
    //   .attr("pointer-events", "none");

    // const bottomRight = svg
    //   .append("g")
    //   .attr("class", "rect")
    //   .selectAll("rect")
    //   .data(nodes)
    //   .enter()
    //   .append("polyline")
    //   .attr("points", "4,2 ,4 4, 2, 4")
    //   .attr("stroke", "#00FFF0")
    //   .attr("fill", "transparent")
    //   .attr("stroke-width", 1)
    //   .attr("z-index", -1)
    //   .attr("user-select", "none")
    //   .attr("pointer-events", "none");

    topLeft.attr("class", "topLeft");
    topRight.attr("class", "topRight");
    bottomLeft.attr("class", "bottomLeft");
    bottomRight.attr("class", "bottomRight");

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
      topLeft.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      topRight.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      bottomLeft.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      bottomRight.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }
  }, [nodes, links, width, height]);

  const selectNode = () => {
    const node = d3
      .selectAll("circle")
      .filter((d: any) => d.name === text)
      .attr("fill", "yellow")
      .attr("r", 10);
  };

  /// This function is TBD
  // Right now, the nodes will keep the same links if the number of layers are increased/decreased
  // Adding this functionality will make it so number of layers are dynamically changed in the grapj
  const handleChangeLayers = () => {
    // resetLinks();
    // d3.selectAll('circle').filter((d:any) => {
    // })
    // Get all nodes and update the number of layers to show
    // d3.selectAll("circle").each((d: any) => {
    //   const linksToFind = findAssociatedLinks(d);
    //   if (d.nodeIsClicked) {
    //     d3.selectAll("line")
    //       .filter((l) => {
    //         return linksToFind.includes(l);
    //       })
    //       .style("stroke", highlightedColor)
    //       .style("stroke-width", 1)
    //       .style("opacity", 0.7);
    //   }
    //   if (numberOfLayers.current <= 0) {
    //     d3.selectAll("line")
    //       .filter((l) => {
    //         return linksToFind.includes(l);
    //       })
    //       .style("stroke", highlightedColor)
    //       .style("stroke-width", 1)
    //       .style("opacity", 0);
    //   }
    // });
  };

  const increaseNumberOfLayers = () => {
    numberOfLayers.current++;
    setReactNumLayers((prev) => prev + 1);
    handleChangeLayers();
  };

  const decreaseNumberOfLayers = () => {
    numberOfLayers.current--;
    setReactNumLayers((prev) => prev - 1);
    handleChangeLayers();
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

        // d3.selectAll("circle").filter((d: any) => {
        //   if (d.name === l.source.name || d.name === l.target.name) {
        //     return false;
        //   } else {
        //     return true;
        //   }
        // });

        // Returning true because I want to turn these nodes off

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
