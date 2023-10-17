// const inneringImageFocused = svg
//   .selectAll("imageInnerringFocused")
//   .data(nodes)
//   .enter()
//   .append("image")
//   .attr("xlink:href", innerringFocused)
//   .attr("width", (d: any) => (d.ingoingSize + innerringImageSize) * 2.5)
//   .attr("height", (d: any) => (d.ingoingSize + innerringImageSize) * 2.5)
//   .attr("visibility", "hidden")
//   .attr("pointer-events", "none")
//   .attr("user-select", "none")
//   .attr("class", "svgInnerring")
//   .style("color", "red");

// const outerringImageFocused = svg
//   .selectAll("imageOuterringFocused")
//   .data(nodes)
//   .enter()
//   .append("image")
//   .attr("xlink:href", outerringFocused)
//   .attr("width", (d: any) => (d.ingoingSize + outerringImageSize) * 4)
//   .attr("height", (d: any) => (d.ingoingSize + outerringImageSize) * 4)
//   .attr("visibility", "hidden")
//   .attr("pointer-events", "none")
//   .attr("user-select", "none")
//   .attr("class", "svgOuterring");

// const text = svg
//   .append("g")
//   .attr("class", "labels")
//   .selectAll("text")
//   .data(nodes)
//   .enter()
//   .append("text")
//   .attr("text-anchor", "middle")
//   .text((d: any) => d.info.name)
//   .attr("fill", "white")
//   .attr("user-select", "none")
//   .attr("pointer-events", "none")
//   .attr("sroke-width", "22")
//   .attr("stroke", "black")
//   .attr("paint-order", "stroke")
//   .attr("filter", "drop-shadow(0px 0px 20px rgb(0 230 230))")
//   .attr("font-size", 0);

// text.attr(
//   "transform",
//   (d: any) =>
//     `translate(${d.x + d.ingoingSize * 3},${d.y + d.ingoingSize * -3})`
// );

/**
 *
 * Simulation code
 */

// simulation.current = d3
// .forceSimulation(nodes)
// .force(
//   "charge",
//   d3
//     .forceCollide()
//     .radius((d: any) => d.ingoingSize + 2)
//     .iterations(1)
// )
// .force(
//   "r",
//   d3
//     .forceRadial(
//       (d: any) =>
//         d.vulnerabilityInfo
//           ? d.vulnerabilityInfo.ratings.length
//             ? // ?
//               250 - d.vulnerabilityInfo.ratings[0].score * 20
//             : // d.vulnerabilityInfo.ratings[0].score * 20
//               300
//           : d.isVulnerableByDependency
//           ? 250
//           : 500,
//       width / 2,
//       height / 2
//     )
//     .strength(3.5)
// )
// .on("tick", ticked)
// .force(
//   "link",
//   d3
//     .forceLink(links)
//     .id((d: any) => d.name)
//     .distance(100)
//     .strength(0.5) // Make the blue links longer
//   // .strength((link: any) => {
//   //   const areTheSameTypes =
//   //     (link.source.vulnerabilityInfo &&
//   //       link.target.vulnerabilityInfo) ||
//   //     (!link.source.vulnerabilityInfo &&
//   //       !link.target.vulnerabilityInfo) ||
//   //     (link.source.isVulnerableByDependency &&
//   //       link.target.isVulnerableByDependency);
//   //   const areVulnerableAndDependency =
//   //     (link.source.vulnerabilityInfo &&
//   //       link.target.isVulnerableByDependency) ||
//   //     (link.source.isVulnerableByDependency &&
//   //       link.target.vulnerabilityInfo);

//   //   if (areTheSameTypes) {
//   //     return 2;
//   //   } else if (areVulnerableAndDependency) {
//   //     return 1;
//   //   } else {
//   //     return 0;
//   //   }
//   // })
// );
