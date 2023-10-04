//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import * as echarts from "echarts";
import clusters from "./clusters_SBERT.json";

function getClusterColor(clusterNumber) {
  const totalColors = 76; // Total number of distinct colors available
  const hue = (clusterNumber * (360 / totalColors)) % 360;
  const saturation = 75; // Adjust as needed
  const lightness = 65; // Adjust as needed

  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  return color;
}

function App() {
  const chartRef = useRef(null);

  useEffect(() => {
    const indeces = Object.keys(clusters.x);
    const scatterPlotData = [];
    const descriptions = [];
    const severity = [];
    const pieces = [];
    const colors = [];
    const labels = [];

    for (let i = 0; i < indeces.length; i++) {
      scatterPlotData.push({
        value: [clusters.x[indeces[i]], clusters.y[indeces[i]]],
      });

      descriptions.push(clusters.description[indeces[i]]);
      console.log("here");

      // severity.push(clusters.severity[indeces[i]]);

      labels.push(clusters.label[indeces[i]]);
      console.log(clusters.description[indeces[i]].split(".").join("\n"));
    }
    if (chartRef) {
      const myChart: any = echarts.init(chartRef.current);
      const option: any = {
        xAxis: {},
        yAxis: {},
        series: [
          {
            symbolSize: 20,
            data: scatterPlotData,
            type: "scatter",
            colorBy: labels,
          },
        ],
        tooltip: {
          formatter: (props) => {
            return (
              "Label:" +
              labels[props.dataIndex] +
              "<br/>" +
              descriptions[props.dataIndex].split(".").join("<br/>")
            );
          },
          position: "top",
        },
        color: labels.map((label) => getClusterColor(label)),
      };
      myChart.setOption(option);
    }
  }, [chartRef]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div ref={chartRef} style={{ width: "500%", height: "500%" }}></div>
      <h1>Hello World</h1>
    </div>
  );
}

export default App;
