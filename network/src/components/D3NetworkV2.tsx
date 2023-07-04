// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useRef, useEffect, useState } from "react";
import sbom_data from "../assets/sbom_dep2.json";

import * as d3 from "d3";

const vulnerabilityColor = "#ef476f";
const isVulnerableLibrary = "#ffd166";
const isNotVulnerableLibrary = "#118ab2";
const highlightedColor = "white";

const D3NetworkV2 = () => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const svgRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [text, setText] = useState("");
  const [repelStrength, setRepelStrength] = useState(-70);
  const [clusterStrength, setClusterStrength] = useState(1);
  const simulation = useRef();

  const width = window.innerWidth + 500;
  const height = window.innerHeight + 500;
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
      // console.log(isVulnereable);
      tmpNodes.push({
        name: component["bom-ref"],
        isComponent: false,
        info: component,
        type: "library",
        color: isVulnerable ? isVulnerableLibrary : isNotVulnerableLibrary,
        isVulnerable: isVulnerable,
      });
    }
    const visitedNode = [];

    for (let i = 0; i < sbom_data.dependencies.length; i++) {
      const dependency = sbom_data.dependencies[i];
      for (let j = 0; j < dependency["dependsOn"].length; j++) {
        const source = dependency["ref"];
        const target = dependency["dependsOn"][j];
        tmpLinks.push({
          source: target,
          target: source,
        });
      }
    }

    setNodes(tmpNodes);
    setLinks(tmpLinks);
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
          .strength((d) => (d.isVulnerable ? clusterStrength : 0.1))
          .x(width / 2)
      )

      .force(
        "y",
        d3
          .forceY()
          .strength((d) => (d.isVulnerable ? clusterStrength : 0.1))
          .y(height / 2)
      )

      .force("collide", d3.forceCollide().radius(10))
      .on("tick", ticked);

    const linkGroup = svg.append("g");

    svg
      .append("svg:defs")
      .append("svg:marker")
      .attr("id", "triangle")
      .attr("refX", 17)
      .attr("refY", 6)
      .attr("markerWidth", 30)
      .attr("markerHeight", 30)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 10 6 0 12 3 6")
      .style("fill", "black");

    const link = linkGroup
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "gray")
      .attr("refX", 17)
      .attr("refY", 6)
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 1)
      .attr("marker-end", "url(#triangle)");

    // const length = 100;

    // // This function will animate the path over and over again
    // function repeat() {
    //   // Animate the path by setting the initial offset and dasharray and then transition the offset to 0
    //   link
    //     .attr("stroke-dasharray", length + " " + length)
    //     .attr("stroke-dashoffset", length)
    //     .transition()
    //     .ease(d3.easeLinear)
    //     .attr("stroke-dashoffset", 0)
    //     .duration(6000)
    //     .on("end", () => setTimeout(repeat, 10)); // this will repeat the animation after waiting 1 second
    // }
    // repeat();

    const node = svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 6)
      .attr("fill", (d, i) => d.color)
      .attr("stroke", "black")
      .on("mouseenter", function (event, d) {
        const linksToFind = findAssociatedLinks(d);

        d3.selectAll("line")
          .filter((l) => {
            // const linksToFind = findAssociatedLinks(d);
            // const nodesToOpacify = findNodes(linksToFind)
            return linksToFind.includes(l);
          })
          .style("stroke", highlightedColor)
          .style("stroke-width", 1)
          .attr("stroke-opacity", 1);

        d3.selectAll("circle")
          .filter((new_d) => new_d.name !== d.name)
          .attr("opacity", 0.6);

        // d3.selectAll("circle")
        //   .filter((c) => c.name !== d.name)
        //   .attr("r", 10);
      })
      .on("mouseout", (e, d) => {
        const linksToFind = findAssociatedLinks(d);

        d3.selectAll("line")
          .filter((l) => {
            // const linksToFind = findAssociatedLinks(d);
            return linksToFind.includes(l);
          })
          .style("stroke", "gray")
          .style("stroke-width", 1)
          .attr("stroke-opacity", 0.3);
        d3.selectAll("circle")
          .filter((new_d) => new_d.name !== d.name)
          .attr("opacity", 1);
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

  function findAssociatedLinks(selectedNode, l) {
    const associatedLinks = [];
    const tmpAssociatedLinks = [];

    const traverseSourceLinks = (node) => {
      const targetLinks = [];

      for (let i = 0; i < links.length; i++) {
        if (node.name === links[i].source.name) {
          targetLinks.push(links[i].target);
          tmpAssociatedLinks.push(links[i]);
        }
      }
      while (targetLinks.length) {
        const newNode = targetLinks.pop();
        traverseSourceLinks(newNode);
      }
    };

    const traverseTargetLinks = (node) => {
      const sourceLinks = [];

      for (let i = 0; i < links.length; i++) {
        if (node.name === links[i].target.name) {
          sourceLinks.push(links[i].source);
          tmpAssociatedLinks.push(links[i]);
        }
      }
      while (sourceLinks.length) {
        const newNode = sourceLinks.pop();
        traverseTargetLinks(newNode);
      }
    };
    traverseSourceLinks(selectedNode);
    traverseTargetLinks(selectedNode);
    console.log(tmpAssociatedLinks);
    // const traverseSourceLinks = (selectedNode, l) => {
    //   if(selectedNode.name === l.target){
    //     const node = l.target.name
    //     associatedLinks.push(l)

    //     let newLink;
    //     for(let i = 0; i < links.length; i++) {
    //       if(links[i].target.name == node.name ) {
    //         newLink = links[i]
    //       }
    //     }
    //     if(!newLink) break;
    //     return traverseSourceLinks()
    //   }

    // }

    function traverseLinks(node) {
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (associatedLinks.includes(link)) return;
        // console.log(link.source, node);
        if (link.source.name === node.name || link.target.name === node.name) {
          associatedLinks.push(link);
          if (link.source !== node) {
            traverseLinks(link.source);
          }
          if (link.target !== node) {
            traverseLinks(link.target);
          }
        }
      }
    }
    traverseLinks(selectedNode);
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
    <>
      {" "}
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
    </>
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
