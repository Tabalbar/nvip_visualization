// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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

const checkIfVulnerableByDependency = (node) => {
  const dependencies = sbom_data.dependencies;
  let dependenciesToSearch = [];
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

const D3NetworkV2 = () => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  const linkRef = useRef(null);
  const svgRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [text, setText] = useState("");
  const [repelStrength, setRepelStrength] = useState(-90);
  const simulation = useRef();
  const arrowRef = useRef();

  const vulnerableStrength = 0.7;
  const vulnerableByDependencyStrength = 0.3;
  const [nodeClicked, setNodeClicked] = useState(null);

  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const numberOfLayers = useRef(1);

  const width = window.innerWidth;
  const height = window.innerHeight;

  useEffect(() => {
    const dependencies = sbom_data.dependencies;
    const tmpNodes = [];
    const tmpLinks = [];

    for (let i = 0; i < sbom_data.components.length; i++) {
      const component = sbom_data.components[i];
      const isVulnerable = sbom_data.vulnerabilities.find((vuln) =>
        vuln.affects.find(
          (affect) => affect["ref"] === sbom_data.components[i]["bom-ref"]
        )
      );
      const isVulnerableByDependency = checkIfVulnerableByDependency(component);
      tmpNodes.push({
        name: component["bom-ref"],
        isComponent: false,
        info: component,
        type: "library",
        vulnerabilityInfo: isVulnerable ? isVulnerable : false,
        nodeIsClicked: false,
        color: isVulnerable
          ? vulnerabilityColor
          : isVulnerableByDependency
          ? isVulnerableByDependencyColor
          : isNotVulnerableLibrary,
        isVulnerableByDependency: isVulnerableByDependency,
        isRootNode: false,
      });
    }
    const visitedNode = [];

    for (let i = 0; i < sbom_data.dependencies.length; i++) {
      const dependency = sbom_data.dependencies[i];
      for (let j = 0; j < dependency["dependsOn"].length; j++) {
        const source = dependency["ref"];
        const target = dependency["dependsOn"][j];
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
            increaseNumberOfLayers();
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
        "link",
        d3.forceLink(links).id((d) => d.name)
      )
      .force("charge", d3.forceManyBody().strength(repelStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      // .force("cluster", () => forceCluster())
      .force(
        "x",
        d3
          .forceX()
          .strength((d) =>
            d.vulnerabilityInfo
              ? vulnerableStrength
              : d.isVulnerableByDependency
              ? vulnerableByDependencyStrength
              : 0.1
          )
          .x(width / 2)
      )

      .force(
        "y",
        d3
          .forceY()
          .strength((d) =>
            d.vulnerabilityInfo
              ? vulnerableStrength
              : d.isVulnerableByDependency
              ? vulnerableByDependencyStrength
              : 0.1
          )
          .y(height / 2)
      )

      .force("collide", d3.forceCollide().radius(10))
      .on("tick", ticked);

    const linkGroup = svg.append("g");
    const arrowMarkerId = "triangle";
    const arrows = svg
      .append("svg:defs")
      .append("svg:marker")
      .attr("id", arrowMarkerId)
      .attr("refX", 13)
      .attr("refY", 6)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto");

    // arrows
    //   .append("path")
    //   .attr("d", "M 0 0 10 6 0 12 0 0")
    //   .style("fill", "white")
    //   .style("stroke", "black")
    //   .style("stroke-width", 1);

    const link = linkGroup
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "gray")
      .attr("refX", 17)
      .attr("refY", 6)
      // .attr("stroke-width", 1)
      .attr("marker-end", `url(#${arrowMarkerId})`);

    d3.selectAll("line").style("opacity", 0);

    link.attr("class", "flowDashedLine");

    const node = svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d, i) => {
        //If want to size the nodes according to the CVSSv2 score
        if (d.vulnerabilityInfo) {
          // return d.vulnerabilityInfo.ratings[0].score * 1.1;
        }
        return 4;
      })
      .attr("fill", (d, i) => d.color)
      .attr("stroke", (d, i) => "none")
      .on("mouseenter", function (event, d) {
        const linksToFind = findAssociatedLinks(d);

        // Show lines for the node that is highlighted
        d3.selectAll("line")
          .filter((l) => {
            return linksToFind.includes(l);
          })
          .style("stroke", highlightedColor)
          .style("stroke-width", 1)
          .style("opacity", 0.7);
      })
      .on("mouseout", (e, d) => {
        const linksToFind = findAssociatedLinks(d);

        d3.selectAll("line")
          .filter((l) => {
            let turnOffThisLink = true;
            if (l.target.nodeIsClicked && l.source.nodeIsClicked) {
              turnOffThisLink = false;
            }

            return turnOffThisLink;
          })
          .style("stroke", "gray")
          .style("stroke-width", 1)
          .style("opacity", 0);
      })
      .on("click", (e, d) => {
        const linksToFind = findAssociatedLinks(d);

        if (d.nodeIsClicked) {
          // Turn the lines for nodes off
          for (let i = 0; i < linksToFind.length; i++) {
            linksToFind[i].source.nodeIsClicked = false;
            linksToFind[i].target.nodeIsClicked = false;
            linksToFind[i].source.isRootNode = false;
            linksToFind[i].target.isRootNode = false;
          }
          d3.selectAll("line")
            .filter((l) => {
              return linksToFind.includes(l);
            })
            .style("stroke", highlightedColor)
            .style("stroke-width", 1)
            .style("opacity", 0);

          d3.selectAll("circle")
            .filter((new_d) => {
              return new_d.name === d.name;
            })
            .attr("stroke", "none");
        } else {
          // Turn the lines for nodes on
          for (let i = 0; i < linksToFind.length; i++) {
            linksToFind[i].source.nodeIsClicked = true;
            linksToFind[i].target.nodeIsClicked = true;
            linksToFind[i].source.isRootNode = true;
            linksToFind[i].target.isRootNode = true;
          }
          d3.selectAll("line")
            .filter((l) => {
              return linksToFind.includes(l);
            })
            .style("stroke", highlightedColor)
            .style("stroke-width", 1)
            .style("opacity", 0.7);

          d3.selectAll("circle")
            .filter((new_d) => {
              return new_d.name === d.name;
            })
            .attr("stroke", "white");
        }

        setNodeClicked(d);
      });

    // d3.forceSimulation(nodes).for;
    // .force("charge", d3.forceManyBody().strength(-5));

    node.append("title").text((d) => d.name);

    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }
  }, [nodes, links, width, height]);

  const restartSimulation = () => {
    simulation.current.restart();
  };

  const selectNode = () => {
    const node = d3
      .selectAll("circle")
      .filter((d) => d.name === text)
      .attr("fill", "yellow")
      .attr("r", 10);
  };

  const handleChangeLayers = () => {
    console.log(numberOfLayers.current);

    // First Reset all the lines. This is used when trying to decrease the number of layers.
    d3.selectAll("line")
      .style("stroke", highlightedColor)
      .style("stroke-width", 1)
      .style("opacity", 0);

    // Get all nodes and update the number of layers to show
    d3.selectAll("circle").each((d) => {
      const linksToFind = findAssociatedLinks(d);

      if (d.isRootNode) {
        console.log(linksToFind);
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

    handleChangeLayers();
  };

  const decreaseNumberOfLayers = () => {
    numberOfLayers.current--;

    handleChangeLayers();
  };

  function findAssociatedLinks(selectedNode) {
    const tmpAssociatedLinks = [];
    const tmpLinks = [...linkRef.current];
    const findLinks = (nodes, iterationNumber) => {
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
      style={{ backgroundColor: "#2B2C2B" }}
      onContextMenu={(e) => {
        e.preventDefault();
        setClicked(true);
        setPoints({
          x: e.pageX,
          y: e.pageY,
        });
      }}
    >
      <button onClick={handleChangeLayers}>Click</button>
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
      </form>
      <ZoomableSVG width={width} height={height}>
        <svg ref={svgRef} width={width} height={height} overflow={"hidden"}>
          {/* <g>
        <rect
          x={dimensions.width / 2}
          y={dimensions.height / 2}
          width="3em"
          height="3em"
          fill="gold"
        />
      </g> */}
        </svg>
      </ZoomableSVG>
      <SideMenu nodeInfo={nodeClicked} />
      {clicked && <ContextMenu top={points.y} left={points.x}></ContextMenu>}
    </div>
  );
};

export default D3NetworkV2;

function ZoomableSVG({ children, width, height }) {
  const svgRef = useRef();
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const { x, y, k } = event.transform;
      setK(k);
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

function forceCluster() {
  // console.log(d);
  const strength = 50;
  let nodes;

  function force(alpha) {
    const centroids = d3.rollup(nodes, centroid, (d) => {
      // console.log(d.data.group);
      return d.data.type;
    });
    const l = alpha * strength;
    for (const d of nodes) {
      const { x: cx, y: cy } = centroids.get(d.data.type);
      d.vx -= (d.x - cx) * l;
      d.vy -= (d.y - cy) * l;
    }
  }

  force.initialize = (_) => (nodes = _);

  return force;
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
