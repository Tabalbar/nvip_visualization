import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import SideMenu from "./SideMenu";
import innerringFocused from "../assets/innerring_focused.svg";
import outerringFocused from "../assets/outerring_focused.svg";
import useContextMenu from "../hooks/useContextMenu";
import "../App.css";
import error1 from "../assets/error5.mp3";
import { IoMdExit } from "react-icons/io";

import * as d3 from "d3";
import SelectedNode from "./SelectedNode";
import { Button } from "@chakra-ui/react";

import {
  isVulnerableByDependencyColor,
  isNotVulnerableLibrary,
  dimmedIsNotVulnerableLibrary,
  dimmedIsVulnerableByDependencyColor,
  dimmedVulnerabilityColorGrad1,
  dimmedVulnerabilityColorGrad2,
  vulnerabilityColorGrad1,
  vulnerabilityColorGrad2,
  graidentColor,
} from "../utils/color";
import { SBOMDataProps, Vulnerability } from "../utils/types";
import { SBOM } from "../utils/SBOM";

const rectWidth = 4;

const checkIfVulnerableByDependency = (node: any, sbom_data: any) => {
  const dependencies = sbom_data.dependencies;
  let dependenciesToSearch: any = [];
  const nodeInQuestion = dependencies.find((c) => c.ref === node["bom-ref"]);
  dependenciesToSearch.push(nodeInQuestion?.dependsOn);
  dependenciesToSearch = dependenciesToSearch.flat();
  while (dependenciesToSearch.length !== 0) {
    const node = dependenciesToSearch.shift();

    if (
      sbom_data.vulnerabilities.find((vuln: Vulnerability) =>
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

const D3Remastered = (props: {
  setIsHelpMenuOpen: any;
  sbom_data: any;
  setIsSBOMLoaded: (state: boolean) => void;
}) => {
  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState<any>([]);

  const linkRef = useRef<any>(null);
  const svgRef = useRef(null);

  const simulation = useRef<any>();

  const focusedNode = useRef<any>(null); // I am using useRef because there is an issue using useState with d3 events.
  const [reactFocusedNode, setReactFocusedNode] = useState<any>(null); // I think the useEffect declares the function at statrt but then it never updates with useState

  const selectedLinks = useRef<any>([]);
  const selectedNodes = useRef<any>([]);

  const [reactSelectedLinks, setReactSelectedLinks] = useState([]);

  const [, setForceRender] = useState(false);

  const { clicked, setClicked, points, setPoints } = useContextMenu();
  const [isLoading, setIsLoading] = useState(true);
  const numberOfLayers = useRef(1);

  const width = 2500;
  const height = 1500;
  const [zoom, setZoom] = useState<number>(1);
  const zoomRef = useRef<number>(1);

  const [isSizedByIngoing, setIsSizedByIngoing] = useState(true);

  const handleLeave = () => {
    // props.setIsSBOMLoaded(false);
    //detroy d3 network graph
    // simulation.current.stop();
    // simulation.current.restart();
    // simulation.current.alpha(1);
    simulation.current.stop();
    d3.select("body").selectAll("svg").remove();
    props.setIsSBOMLoaded(false);
  };

  useEffect(() => {
    const tmpNodes: any = [];
    const tmpLinks: any = [];
    const SBOMData: SBOMDataProps = new SBOM(props.sbom_data);
    const components = SBOMData.components;
    const vulnerabilities = SBOMData.vulnerabilities;
    const dependencies = SBOMData.dependencies;
    let color = "";
    let dimmedColor = "";

    let ingoingSize = 2;
    let ingoingLinks = 0;

    // Trying to normalize the vulnerability score
    const vulScores = SBOMData.getVulnerabilityScores();
    const minVulScore = Math.min(...vulScores);
    const maxVulScore = Math.max(...vulScores);

    for (let i = 0; i < components.length; i++) {
      let outgoingSize = 2;
      let outgoingLinks = 0;

      const component = components[i];

      const vulnerabilityInfo: Vulnerability | undefined =
        SBOMData.getVulnerability(component["bom-ref"]);

      const isVulnerableByDependency = checkIfVulnerableByDependency(
        component,
        props.sbom_data
      );

      // Setting the sizes of the nodes
      for (let j = 0; j < dependencies.length / 2; j++) {
        if (dependencies[j]["ref"] === component["bom-ref"]) {
          ingoingLinks = dependencies[j]["dependsOn"].length;
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
            outgoingLinks++;
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
          normalizedSeverityScore
        );
        dimmedColor = graidentColor(
          dimmedVulnerabilityColorGrad1,
          dimmedVulnerabilityColorGrad2,
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
        ingoingLinks,
        outgoingLinks,
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
        "r",
        d3
          .forceCollide()
          .radius((d: any) => d.ingoingSize + 2)
          .iterations(1)
      )
      .force(
        "center",
        d3
          .forceRadial(
            (d: any) =>
              d.vulnerabilityInfo
                ? d.vulnerabilityInfo.ratings.length
                  ? // ?
                    250 - d.vulnerabilityInfo.ratings[0].score * 20
                  : // d.vulnerabilityInfo.ratings[0].score * 20
                    300
                : d.isVulnerableByDependency
                ? 250
                : 500,
            width / 2,
            height / 2
          )
          .strength(3.5)
      )
      // .force("center", d3.forceCenter())
      .force("charge", d3.forceManyBody().strength(-200))
      // .force("charge2", d3.forceManyBody())
      // .force("charge3", d3.forceManyBody())
      .on("tick", ticked)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.name)
          .distance(100)
          .strength(0.5)
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
      .attr("stroke", (d: any, i) => {
        if (d.info.directImport) {
          return "#3558cc";
        } else {
          return "black";
        }
      })
      .attr("stroke-width", 3)
      .on("mouseenter", function (event, d: any) {
        const linksToFind = findAssociatedLinks(d);
        turnOnTheseLinksWhenHovered(linksToFind);
        turnOnTextForNode(d, svg);
        setReactFocusedNode(d);
      })
      .on("mouseout", (e, unClicked: any) => {
        resetLinks();
        turnOffTextForNodesNotInSelectedNodes();

        setReactFocusedNode(focusedNode.current);
      })
      .on("click", (e, d: any) => {
        const linksToFind = findAssociatedLinks(d);
        setReactSelectedLinks(linksToFind);

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
        // .style("color", "red");
        // This if else is the logic to decide how to color the nodes
        if (!found) {
          // Node is not activated, so I want to actiate and focus on it
          selectedLinks.current.push(linksToFind);

          focusedNode.current = d;
          setReactFocusedNode(d);
          svg
            .selectAll("imageInnerringFocused")
            .data([d])
            .enter()
            .append("image")
            .attr("xlink:href", innerringFocused)
            .attr(
              "width",
              (d: any) => (d.ingoingSize + innerringImageSize) * 2.5
            )
            .attr(
              "height",
              (d: any) => (d.ingoingSize + innerringImageSize) * 2.5
            )
            .attr("x", d.x - ((d.ingoingSize + innerringImageSize) * 2.5) / 2)
            .attr("y", d.y - ((d.ingoingSize + innerringImageSize) * 2.5) / 2)
            .attr("visibility", "hidden")
            .attr("pointer-events", "none")
            .attr("user-select", "none")
            .attr("class", "svgInnerring");

          svg
            .selectAll("imageOuterringFocused")
            .data([d])
            .enter()
            .append("image")
            .attr("xlink:href", outerringFocused)
            .attr("width", (d: any) => (d.ingoingSize + outerringImageSize) * 4)
            .attr(
              "height",
              (d: any) => (d.ingoingSize + outerringImageSize) * 4
            )
            .attr("x", d.x - ((d.ingoingSize + outerringImageSize) * 4) / 2)
            .attr("y", d.y - ((d.ingoingSize + outerringImageSize) * 4) / 2)
            .attr("visibility", "hidden")
            .attr("pointer-events", "none")
            .attr("user-select", "none")
            .attr("class", "svgOuterring");

          selectedNodes.current.push(d);
        } else {
          // If node is in focus, I want to unfocus and unactivate it
          if (focusedNode.current === d) {
            d3.select("body")
              .selectAll(".svgOuterring")
              .filter((d: any) => {
                return d.name === focusedNode.current.name;
              })
              .remove();
            d3.select("body")
              .selectAll(".svgInnerring")
              .filter((d: any) => {
                return d.name === focusedNode.current.name;
              })
              .remove();
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
        .attr("x1", (d: any) => (isNaN(d.source.x) ? 0 : d.source.x))
        .attr("y1", (d: any) => (isNaN(d.source.y) ? 0 : d.source.y))
        .attr("x2", (d: any) => (isNaN(d.target.x) ? 0 : d.target.x))
        .attr("y2", (d: any) => (isNaN(d.target.y) ? 0 : d.target.y));

      line
        .attr("x1", (d: any) => (isNaN(d.x) ? 0 : d.x))
        .attr("y1", (d: any) => (isNaN(d.y) ? 0 : d.y))
        .attr("x2", (d: any) => (isNaN(d.x) ? 0 : d.x + d.ingoingSize * 3))
        .attr("y2", (d: any) => (isNaN(d.y) ? 0 : d.y + d.ingoingSize * -3));

      node.attr("transform", (d: any) =>
        isNaN(d.x) && isNaN(d.y) ? null : `translate(${d.x},${d.y})`
      );
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 8000);
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
    if (JSON.stringify(links) === JSON.stringify(linksToDelete)) {
      focusedNode.current.numberOfLayers--;
      // window.alert("No more layers to add");
      const audio = document.getElementById("error1") as HTMLAudioElement;
      audio.play();
    }
    selectedLinks.current.push(links);
    setReactSelectedLinks(selectedLinks.current);
    setForceRender((prev) => !prev);
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
      .remove();
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

    // for (let i = 0; i < selectedNodes.current.length; i++) {
    //   turnOnTextForNode(selectedNodes.current[i], d3.select(svgRef.current));
    // }
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
    } else {
      const audio = document.getElementById("error1") as HTMLAudioElement;
      audio.play();
    }

    const links = findAssociatedLinks(focusedNode.current);
    selectedLinks.current.push(links);
    setReactSelectedLinks(selectedLinks.current);
    setForceRender((prev) => !prev);

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

  const turnOnTextForNode = (node: any, svg: any) => {
    for (let i = 0; i < selectedNodes.current.length; i++) {
      if (selectedNodes.current[i].name === node.name) {
        return;
      }
    }
    d3.select("body")
      .selectAll(".labelLine")
      .filter((l: any) => {
        return l.name === node.name;
      })
      .attr("stroke-width", 2);
    svg
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data([node])
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .text((d: any) => d.info.name)
      .attr("fill", "white")
      .attr("x", node.x + node.ingoingSize * 4)
      .attr("y", node.y + node.ingoingSize * -4)
      .attr("user-select", "none")
      .attr("pointer-events", "none")
      .attr("sroke-width", "22")
      .attr("stroke", "black")
      .attr("paint-order", "stroke")
      .attr("filter", "drop-shadow(0px 0px 20px rgb(0 230 230))")
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
      .style("stroke", "white")
      .style("stroke-width", 0.4);

    d3.selectAll("circle").attr("fill", (d: any) => d.color);
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
          // width: "300px",
          right: "2rem",
          top: "2rem",
        }}
      >
        <Button
          backgroundColor={"#23A9DC"}
          boxShadow={"5px 5px black"}
          onClick={() => props.setIsHelpMenuOpen(true)}
          mr="1rem"
        >
          ?
        </Button>
        <Button
          onClick={handleLeave}
          backgroundColor={"rgb(220,40,110)"}
          boxShadow={"5px 5px black"}
        >
          <IoMdExit />
        </Button>
      </div>
      <audio src={error1} id="error1"></audio>

      <SelectedNode
        nodeInfo={reactFocusedNode}
        selectedLinks={reactSelectedLinks}
      />

      <ZoomableSVG width={width} height={height} zoom={zoom} setZoom={setZoom}>
        <svg ref={svgRef} width={width} height={height}></svg>
      </ZoomableSVG>
      <SideMenu nodeInfo={reactFocusedNode} />
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

// {isLoading ? (
//   <div
//     style={{
//       position: "absolute",
//       width: "100%",
//       height: "100%",
//       opacity: 0.5,
//       backgroundColor: "gray",
//     }}
//   >
//     {/* <div className="center">Please Wait</div> */}
//     <div className="center">
//       <div className="wave"></div>
//       <div className="wave"></div>
//       <div className="wave"></div>
//       <div className="wave"></div>
//       <div className="wave"></div>
//       <div className="wave"></div>
//       <div className="wave"></div>
//       <div className="wave"></div>
//       <div className="wave"></div>
//       <div className="wave"></div>
//     </div>
//   </div>
// ) : null}
