import { useState, useEffect } from "react";
import sbom_data from "./assets/sbom5.json";
import { SBOM } from "./utils/SBOM";
import { Component, SBOMDataProps } from "./utils/types";
import * as d3 from "d3";

const WIDTH = 500;
const HEIGHT = 500;

function App() {
  const chartRef = useEffect(() => {
    const sbom = new SBOM(sbom_data as unknown as SBOMDataProps);
    const vulnerabilities = sbom.vulnerabilities;
    // append the svg object to the body of the page
    const svg = d3
      .select("#my_dataviz")
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT);
  }, []);

  return (
    <>
      <div
        style={{
          color: "black",
          backgroundColor: "black",
          width: "100vw",
          height: "100vh",
        }}
      ></div>
    </>
  );
}

export default App;
