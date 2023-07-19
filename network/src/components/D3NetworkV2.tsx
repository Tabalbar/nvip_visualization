import React, { useRef, useEffect, useState } from "react";
import sbom_data from "../assets/sbom_dep2.json";
import SideMenu from "./SideMenu";

import useContextMenu from "../hooks/useContextMenu";
import "../App.css";

import * as d3 from "d3";

export const vulnerabilityColor = "#ef476f";
export const isVulnerableByDependencyColor = "yellow";
export const isNotVulnerableLibrary = "#118ab2";
const highlightedColor = "white";

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

function getRedShadeHex(number: number) {
  const normalizedNumber = Math.min(Math.max(number, 0), 10); // Clamp the number between 0 and 10

  // Apply an exponential function to emphasize the lighter shades
  const exponent = 2;
  const adjustedNumber = Math.pow(normalizedNumber / 10, exponent);

  const redValue = Math.round(adjustedNumber * (255 - 20) + 20); // Map the adjusted number to the range (offset, 255)

  const redHex = redValue.toString(16).padStart(2, "0"); // Convert the red value to hexadecimal

  return `#${redHex}0000`; // Return the hexadecimal representation of the shade of red
}
const D3NetworkV2 = () => {
  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState<any>([]);

  const linkRef = useRef<any>(null);
  const svgRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [text] = useState("");
  const [repelStrength] = useState(-30);
  const simulation = useRef<any>();

  const vulnerableStrength = 0.07;
  const vulnerableByDependencyStrength = 0.07;
  const regularStrength = 0.05;
  const [nodeClicked, setNodeClicked] = useState(null);

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
      let ingoingSize = 4;

      const isVulnerable: any = sbom_data.vulnerabilities.find((vuln) =>
        vuln.affects.find(
          (affect) => affect["ref"] === sbom_data.components[i]["bom-ref"]
        )
      );
      const isVulnerableByDependency = checkIfVulnerableByDependency(component);

      for (let j = 0; j < sbom_data.dependencies.length; j++) {
        if (sbom_data.dependencies[j]["ref"] === component["bom-ref"]) {
          ingoingSize =
            sbom_data.dependencies[j]["dependsOn"].length < ingoingSize
              ? 2
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
      tmpNodes.push({
        name: component["bom-ref"],
        isComponent: false,
        info: component,
        type: "library",
        vulnerabilityInfo: isVulnerable ? isVulnerable : false,
        ingoingSize: ingoingSize,
        outgoingSize: outgoingSize,
        nodeIsClicked: false,
        color: isVulnerable
          ? getRedShadeHex(isVulnerable?.ratings[0].score)
          : isVulnerableByDependency
          ? isVulnerableByDependencyColor
          : isNotVulnerableLibrary,
        isVulnerableByDependency: isVulnerableByDependency,
      });
    }
    const visitedNode = [];

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
    // return () => {
    //   document.removeEventListener(
    //     "keypress",
    //     (event) => {
    //       const name = event.key;

    //       if (name === "-") {
    //         decreaseNumberOfLayers();
    //       }
    //       if (name === "=") {
    //         console.log(numberOfLayers.current);
    //         // increaseNumberOfLayers();
    //       }
    //     },
    //     false
    //   );
    // };
  }, []);

  useEffect(() => {
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const svg = d3.select(svgRef.current);

    simulation.current = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.name)
          .distance(-50)
      )
      .force("charge", d3.forceManyBody().strength(repelStrength))
      // .force("center", d3.forceCenter(width / 2, height / 2))
      // .force("cluster", () => forceCluster())
      .force(
        "x",
        d3
          .forceX()
          .strength((d: any) => {
            // console.log(
            //   d.vulnerabilityInfo
            //     ? Number(
            //         (vulnerableStrength *
            //           d.vulnerabilityInfo.ratings[0].score) /
            //           10
            //       ).toFixed(2)
            //     : "no"
            // );
            return d.vulnerabilityInfo
              ? vulnerableStrength
              : d.isVulnerableByDependency
              ? vulnerableByDependencyStrength
              : regularStrength;
          })
          .x(width / 2)
      )

      .force(
        "y",
        d3
          .forceY()
          .strength((d: any) =>
            d.vulnerabilityInfo
              ? vulnerableStrength
              : d.isVulnerableByDependency
              ? vulnerableByDependencyStrength
              : regularStrength
          )
          .y(height / 2)
      )
      .force("collide", d3.forceCollide().radius(10))
      .on("tick", ticked);

    // Define a custom force to modify the link distances based on node properties
    const customForce = () => {
      links.forEach((l: any) => {
        const source = l.source;
        const target = l.target;
        // Adjust link distance based on the specific property of the source node
        if (source.vulnerabilityInfo) {
          link.distance = 10000; // Decrease the distance for nodes with the property
        } else {
          link.distance = 0; // Use the default distance for other nodes
        }
      });
    };

    simulation.current.force("custom", customForce);

    const linkGroup = svg.append("g");
    const arrowMarkerId = "triangle";
    // const arrows = svg
    //   .append("svg:defs")
    //   .append("svg:marker")
    //   .attr("id", arrowMarkerId)
    //   .attr("refX", 13)
    //   .attr("refY", 6)
    //   .attr("markerWidth", 10)
    //   .attr("markerHeight", 10)
    //   .attr("orient", "auto");

    // arrows
    //   .append("path")
    //   .attr("d", "M 0 0 10 6 0 12 0 0")
    //   .style("fill", "white")
    //   .style("stroke", "black")
    //   .style("stroke-width", 1);

    const link: any = linkGroup
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#212122")
      .attr("refX", 17)
      .attr("refY", 6);
    // .attr("opacity", 0.1);
    // .attr("stroke-width", 1)

    // d3.selectAll("line").style("opacity", 0);

    link.attr("class", "flowDashedLine");

    const node = svg
      .selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node");

    node
      .append("circle")
      .attr("r", (d: any, i) => {
        //If want to size the nodes according to the CVSSv2 score
        return d.ingoingSize;
      })
      .attr("fill", (d: any, i) => d.color)
      .attr("stroke", "black")
      .on("mouseenter", function (event, d) {
        const linksToFind = findAssociatedLinks(d);

        // Show lines for the node that is highlighted
        d3.selectAll("line")
          .filter((l: any) => {
            d3.selectAll("text")
              .filter((d: any) => {
                if (d.name === l.source.name && linksToFind.includes(l)) {
                  return true;
                } else if (
                  d.name === l.target.name &&
                  linksToFind.includes(l)
                ) {
                  return true;
                } else {
                  return false;
                }
              })
              .attr("opacity", 1);

            return linksToFind.includes(l);
          })
          .style("stroke", "#F3F3F3")
          .style("stroke-width", 1);

        //TODO: change this opacity only for nodes that are highlighted
        // d3.selectAll("circle")
        //   .filter((new_d) => {
        //     for (let i = 0; i < linksToFind.length; i++) {
        //       // if (new_d.name === linksToFind[i].source.name) {
        //       //   return true;
        //       // }
        //       if (new_d.name === linksToFind[i].target.name) {
        //         return true;
        //       } else {
        //         return false;
        //       }
        //     }
        //   })
        //   .attr("stroke", "white");
      })
      .on("mouseout", (e, d: any) => {
        const linksToFind = findAssociatedLinks(d);

        // If node is has property true for nodeIsClicked, do not erase the lines
        if (!d.nodeIsClicked) {
          d3.selectAll("line")
            .filter((l: any) => {
              d3.selectAll("text")
                .filter((d: any) => {
                  if (d.name === l.source.name && linksToFind.includes(l)) {
                    return true;
                  } else if (
                    d.name === l.target.name &&
                    linksToFind.includes(l)
                  ) {
                    return true;
                  } else {
                    return false;
                  }
                })
                .attr("opacity", 0);
              return linksToFind.includes(l);
            })
            .style("stroke", "#212122")
            .style("stroke-width", 1);
        }

        // resets the stroke of the nodes to black
        // d3.selectAll("circle")
        //   .filter((new_d) => {
        //     for (let i = 0; i < linksToFind.length; i++) {
        //       if (new_d.name === linksToFind[i].source.name) {
        //         return true;
        //       } else if (new_d.name === linksToFind[i].target.name) {
        //         return true;
        //       } else {
        //         return false;
        //       }
        //     }
        //   })
        //   .attr("stroke", "black");
      })
      .on("click", (e, d: any) => {
        const linksToFind = findAssociatedLinks(d);

        if (d.nodeIsClicked) {
          // Turn the lines for nodes off
          d.nodeIsClicked = false;
          d3.selectAll("line")
            .filter((l) => {
              return linksToFind.includes(l);
            })
            .style("stroke", highlightedColor)
            .style("stroke-width", 1)
            .style("opacity", 0);

          d3.selectAll("line")
            .filter((l) => {
              return linksToFind.includes(l);
            })
            .style("stroke", highlightedColor)
            .style("stroke-width", 1)
            .style("opacity", 0.7);

          d3.selectAll("circle")
            .filter((new_d: any) => {
              return new_d.name === d.name;
            })
            .attr("stroke", "black");
        } else {
          // Used to leave the lines always ON
          d.nodeIsClicked = true;
          d3.selectAll("line")
            .filter((l) => {
              return linksToFind.includes(l);
            })
            .style("stroke", highlightedColor)
            .style("stroke-width", 1)
            .style("opacity", 0.7);

          d3.selectAll("circle")
            .filter((new_d: any) => {
              return new_d.name === d.name;
            })
            .attr("stroke", "white");
        }

        setNodeClicked(d);
      });

    // d3.forceSimulation(nodes).for;
    // .force("charge", d3.forceManyBody().strength(-5));
    // Append <text> elements for labels
    node
      .append("text")
      .attr("dy", "0.31em")
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
    }
  }, [nodes, links, width, height]);

  const restartSimulation = () => {
    simulation.current.restart();
  };

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

    //************************************Used for finding entier tree */

    // const traverseSourceAndTargetLinks = (node) => {
    //   for (let i = 0; i < tmpLinks.length; i++) {
    //     if (node.name === tmpLinks[i].source.name) {
    //       targetLinks.push(tmpLinks[i].target);
    //       tmpAssociatedLinks.push(tmpLinks[i]);
    //     }
    //     if (node.name === tmpLinks[i].target.name) {
    //       targetLinks.push(tmpLinks[i].source);
    //       tmpAssociatedLinks.push(tmpLinks[i]);
    //     }
    //     if (
    //       node.name === tmpLinks[i].source.name ||
    //       node.name === tmpLinks[i].target.name
    //     ) {
    //       console.log(tmpLinks[i]);
    //       tmpLinks.splice(i, 1);
    //       i -= 1;
    //     }
    //     j++;
    //   }
    //   console.log(targetLinks);
    //   while (targetLinks.length && numberOfLayers.current > j) {
    //     const newNode = targetLinks.pop();
    //     traverseSourceAndTargetLinks(newNode);
    //   }
    // };

    // traverseSourceAndTargetLinks(selectedNode);

    //************************************ */

    return tmpAssociatedLinks;
  }

  // function findAssociatedLinks(selectedNode) {
  //   const associatedLinks = [];

  //   function traverseLinks(node) {
  //     for (let i = 0; i < links.length; i++) {
  //       const link = links[i];
  //       if (associatedLinks.includes(link)) return;
  //       // console.log(link.source, node);
  //       if (link.source.name === node.name || link.target.name === node.name) {
  //         associatedLinks.push(link);
  //         if (link.source !== node) {
  //           traverseLinks(link.source);
  //         }
  //         if (link.target !== node) {
  //           traverseLinks(link.target);
  //         }
  //       }
  //     }
  //   }
  //   traverseLinks(selectedNode);
  //   return associatedLinks;
  // }
  return (
    <div
      style={{ backgroundColor: "#111111" }}
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
      <ZoomableSVG width={width} height={height} k={k}>
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

export default D3NetworkV2;

function ZoomableSVG({ children, width, height, k, setK }: any) {
  const svgRef = useRef<any>();
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const { x, y, k } = event.transform;
      k.current = k;
      setX(x);
      setY(y);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);
  return (
    <svg ref={svgRef} width={width} height={height}>
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
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
