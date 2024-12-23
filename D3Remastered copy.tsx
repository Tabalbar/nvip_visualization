import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import sbom_data from "./network/src/assets/sbom_dep2.json";
import SideMenu from "./network/src/components/SideMenu";
import innerringFocused from "../assets/innerring_focused.svg";
import outerringFocused from "../assets/outerring_focused.svg";
import innerringActive from "../assets/innerring_active.svg";
import outerringActive from "../assets/outerring_active.svg";
import useContextMenu from "./network/src/hooks/useContextMenu";
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

const rectWidth = 4;

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

  const focusedNode = useRef<any>(null); // I am using useRef because there is an issue using useState with d3 events.
  const [reactFocusedNode, setReactFocusedNode] = useState<any>(null); // I think the useEffect declares the function at statrt but then it never updates with useState

  const selectedLinks = useRef<any>([]);
  const selectedNodes = useRef<any>([]);

  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const numberOfLayers = useRef(1);

  const width = 2630;
  const height = 1500;
  const [zoom, setZoom] = useState<number>(1);
  const zoomRef = useRef<number>(1);

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
        numberOfLayers: 1,
      });
      outgoingSize = 2;
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
    const innerringImageSize = 2;
    const outerringImageSize = 2;

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("z-index", 1)
      .attr("r", (d: any, i) => {
        return d.ingoingSize;
      })
      .attr("fill", (d: any, i) => d.color)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .on("mouseenter", function (event, d: any) {
        const linksToFind = findAssociatedLinks(d);
        turnOnTheseLinksWhenHovered(linksToFind);
        turnOnTextForNode(d);
      })
      .on("mouseout", (e, d: any) => {
        resetLinks();
        turnOffTextForNodesNotInSelectedNodes();
      })
      .on("click", (e, d: any) => {
        const linksToFind = findAssociatedLinks(d);
        let found = false;
        for (let i = 0; i < selectedLinks.current.length; i++) {
          if (
            JSON.stringify(selectedLinks.current[i]) ==
            JSON.stringify(linksToFind)
          ) {
            found = true;
            if (focusedNode.current === d) {
              selectedLinks.current.splice(i, 1);
            }
          }
        }

        // This if else is the logic to decide how to color the nodes
        if (!found) {
          // Node is not activated, so I want to actiate and focus on it
          selectedLinks.current.push(linksToFind);
          focusedNode.current = d;
          setReactFocusedNode(d);

          selectedNodes.current.push(d);
        } else {
          // If node is in focus, I want to unfocus and unactivate it
          if (focusedNode.current === d) {
            focusedNode.current = null;
            setReactFocusedNode(null);

            d3.selectAll("rect")
              .filter((rect: any) => {
                return rect.name === d.name;
              })
              .attr("stroke-width", 0);

            const tmpSelectedNodes = [...selectedNodes.current];
            for (let i = 0; i < tmpSelectedNodes.length; i++) {
              if (tmpSelectedNodes[i].name === d.name) {
                tmpSelectedNodes.splice(i, 1);
              }
            }
            selectedNodes.current = tmpSelectedNodes;
          } else {
            // Node is acticated, but not in focus. This is to change the focus to this node
            focusedNode.current = d;
            setReactFocusedNode(d);
          }
        }

        resolveActiveAndFocusedRect();

        numberOfLayers.current = d.numberOfLayers;
      });

    const inneringImageFocused = svg
      .selectAll("imageInnerringFocused")
      .data(nodes)
      .enter()
      .append("image")
      .attr("xlink:href", innerringFocused)
      .attr("width", (d: any) => (d.ingoingSize + innerringImageSize) * 2.5)
      .attr("height", (d: any) => (d.ingoingSize + innerringImageSize) * 2.5)
      .attr("visibility", "hidden")
      .attr("pointer-events", "none")
      .attr("user-select", "none")
      .attr("class", "svgInnerring")
      .style("color", "red");

    const outerringImageFocused = svg
      .selectAll("imageOuterringFocused")
      .data(nodes)
      .enter()
      .append("image")
      .attr("xlink:href", outerringFocused)
      .attr("width", (d: any) => (d.ingoingSize + outerringImageSize) * 4)
      .attr("height", (d: any) => (d.ingoingSize + outerringImageSize) * 4)
      .attr("visibility", "hidden")
      .attr("pointer-events", "none")
      .attr("user-select", "none")
      .attr("class", "svgOuterring");

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

    const line: any = svg
      .append("g")
      .selectAll("line")
      .data(nodes)
      .enter()
      .append("line")
      .attr("stroke-width", 0)
      .attr("stroke", "#6E8C91")
      .attr("class", "labelLine")
      .attr("pointer-events", "none")
      .attr("user-select", "none");

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      line
        .attr("x1", (d: any) => d.x)
        .attr("y1", (d: any) => d.y)
        .attr("x2", (d: any) => d.x + d.ingoingSize * 3)
        .attr("y2", (d: any) => d.y + d.ingoingSize * -3);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      text.attr(
        "transform",
        (d: any) =>
          `translate(${d.x + d.ingoingSize * 3},${d.y + d.ingoingSize * -3})`
      );

      inneringImageFocused.attr(
        "x",
        (d: any) => d.x - ((d.ingoingSize + innerringImageSize) * 2.5) / 2
      );
      inneringImageFocused.attr(
        "y",
        (d: any) => d.y - ((d.ingoingSize + innerringImageSize) * 2.5) / 2
      );

      outerringImageFocused.attr(
        "x",
        (d: any) => d.x - ((d.ingoingSize + outerringImageSize) * 4) / 2
      );
      outerringImageFocused.attr(
        "y",
        (d: any) => d.y - ((d.ingoingSize + outerringImageSize) * 4) / 2
      );
    }
  }, [nodes, links, width, height]);

  const increaseNumberOfLayers = () => {
    const linksToDelete = findAssociatedLinks(focusedNode.current);
    for (let i = 0; i < selectedLinks.current.length; i++) {
      if (
        JSON.stringify(selectedLinks.current[i]) ===
        JSON.stringify(linksToDelete)
      ) {
        selectedLinks.current.splice(i, 1);
      }
    }
    focusedNode.current.numberOfLayers++;
    const links = findAssociatedLinks(focusedNode.current);
    selectedLinks.current.push(links);
    resetLinks();
  };

  const turnOffTextForNodesNotInSelectedNodes = () => {
    d3.selectAll("image")
      .filter((d: any) => {
        for (let i = 0; i < selectedNodes.current.length; i++) {
          if (selectedNodes.current[i].name === d.name) {
            return false;
          }
        }
        return true;
      })
      .attr("visibility", "hidden");

    d3.select("body")
      .selectAll(".labelLine")
      .filter((l: any) => {
        for (let i = 0; i < selectedNodes.current.length; i++) {
          if (selectedNodes.current[i].name === l.name) {
            return false;
          }
        }
        return true;
      })
      .attr("stroke-width", 0);

    d3.selectAll("text")
      .filter((d: any) => {
        for (let i = 0; i < selectedNodes.current.length; i++) {
          if (selectedNodes.current[i].name === d.name) {
            return false;
          }
        }
        return true;
      })
      .attr("font-size", 0);
  };

  const resolveActiveAndFocusedRect = () => {
    /**
     * Circle Target Code
     */

    d3.select("body")
      .selectAll(".svgInnerring")
      .filter((d: any) => {
        return selectedNodes.current.find((node: any) => node.name === d.name);
      })
      .attr("visibility", "visible");
    d3.select("body")
      .selectAll(".svgOuterring")
      .filter((d: any) => {
        return selectedNodes.current.find((node: any) => node.name === d.name);
      })
      .attr("visibility", "hidden");

    d3.select("body")
      .selectAll(".svgOuterring")
      .filter((d: any) => {
        return d.name === focusedNode.current.name;
      })
      .attr("visibility", "visible");

    d3.select("body")
      .selectAll(".labelLine")
      .filter((l: any) => {
        return selectedNodes.current.find((node: any) => node.name === l.name);
      })
      .attr("stroke-width", 2);

    d3.selectAll("text")
      .filter((d: any) => {
        return selectedNodes.current.find((node: any) => node.name === d.name);
      })
      .attr("font-size", 20 / zoomRef.current);
  };

  const decreaseNumberOfLayers = () => {
    const linksToDelete = findAssociatedLinks(focusedNode.current);
    for (let i = 0; i < selectedLinks.current.length; i++) {
      if (
        JSON.stringify(selectedLinks.current[i]) ===
        JSON.stringify(linksToDelete)
      ) {
        selectedLinks.current.splice(i, 1);
      }
    }
    if (focusedNode.current.numberOfLayers > 1) {
      focusedNode.current.numberOfLayers--;
    }

    const links = findAssociatedLinks(focusedNode.current);
    selectedLinks.current.push(links);
    resetLinks();
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
      if (iterationNumber < selectedNode.numberOfLayers) {
        findLinks(newNodesToSearch, iterationNumber);
      } else {
        return;
      }
    };

    findLinks([selectedNode], 0);

    return tmpAssociatedLinks;
  }

  const turnOnTextForNode = (node: any) => {
    d3.select("body")
      .selectAll(".labelLine")
      .filter((l: any) => {
        return l.name === node.name;
      })
      .attr("stroke-width", 2);
    d3.selectAll("text")
      .filter((d: any) => {
        return d.name === node.name;
      })
      .attr("font-size", 20 / zoomRef.current);
  };

  const turnOnTheseLinksWhenHovered = (links: any[]) => {
    d3.select("body")
      .selectAll(".flowDashedLine")
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
    d3.select("body")
      .selectAll(".flowDashedLine")
      .filter((l: any) => {
        // This is checking if the links are IN the selectedLinks array
        for (let i = 0; i < selectedLinks.current.length; i++) {
          if (selectedLinks.current[i].includes(l)) {
            return false;
          }
        }

        return true;
      })
      .style("stroke", "none"); // Initially, turn off all links

    d3.select("body")
      .selectAll(".flowDashedLine")
      .filter((l: any) => {
        for (let i = 0; i < selectedLinks.current.length; i++) {
          if (selectedLinks.current[i].includes(l)) {
            return true;
          }
        }
        return false;
      })
      .style("stroke", "#FEFEFE")
      .style("stroke-width", 1);
    d3.selectAll("line")
      .filter((l) => {
        for (let i = 0; i < selectedLinks.current.length; i++) {
          if (selectedLinks.current[i].includes(l)) {
            return true;
          }
        }
        return false;
      })
      .style("stroke", "#FEFEFE")
      .style("stroke-width", 1);

    d3.selectAll("circle").attr("fill", (d: any) => d.color);
  };

  const handleChangeToIngoingLinks = () => {
    d3.selectAll("circle").attr("r", (d: any) => d.ingoingSize);
    setIsSizedByIngoing(true);
  };
  const handleChangeToOutgoingLinks = () => {
    d3.selectAll("circle").attr("r", (d: any) => {
      console.log(d.outgoingSize);
      return d.outgoingSize;
    });
    setIsSizedByIngoing(false);
  };

  useEffect(() => {
    d3.selectAll("rect")
      .filter((d: any) => {
        return selectedNodes.current.find((node: any) => node.name === d.name);
      })
      .attr("stroke-width", rectWidth / zoom);

    d3.selectAll("text")
      .filter((d: any) => {
        return selectedNodes.current.find((node: any) => node.name === d.name);
      })
      .attr("font-size", 20 / zoomRef.current);
    zoomRef.current = zoom;
  }, [zoom]);

  return (
    <div
      style={{ backgroundColor: "#222222" }}
      // onContextMenu={(e) => {
      //   e.preventDefault();
      //   setClicked(true);
      //   setPoints({
      //     x: e.pageX,
      //     y: e.pageY,
      //   });
      //   console.log("Right Click", e.pageX, e.pageY);
      // }}
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
          &nbsp;{numberOfLayers.current}
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
      <ZoomableSVG width={width} height={height} zoom={zoom} setZoom={setZoom}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          overflow={"hidden"}
        ></svg>
      </ZoomableSVG>
      {/* <SideMenu nodeInfo={reactFocusedNode} /> */}
      {clicked && <ContextMenu top={points.y} left={points.x}></ContextMenu>}
    </div>
  );
};

export default D3Remastered;

function ZoomableSVG({ children, width, height, zoom, setZoom }: any) {
  const svgRef = useRef<any>();
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const z = d3.zoom().on("zoom", (event) => {
      const { x, y, k } = event.transform;
      setZoom(k);
      setX(x);
      setY(y);
    });
    d3.select(svgRef.current).call(z);
  }, []);
  return (
    <svg ref={svgRef} width={width} height={height}>
      <g transform={`translate(${x},${y})scale(${zoom})`}>{children}</g>
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
