import React, { useEffect, useState } from "react";
import { Grid } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import sbom_data from "../assets/sbom_dep2.json";

import "ag-grid-community/styles//ag-grid.css";
import "ag-grid-community/styles//ag-theme-alpine.css";

const TableView = () => {
  const [rowData] = useState([
    { make: "Toyota", model: "Celica", price: 35000 },
    { make: "Ford", model: "Mondeo", price: 32000 },
    { make: "Porsche", model: "Boxter", price: 72000 },
  ]);

  const [columnDefs] = useState([
    { field: "make", sortable: true, filter: true },
    { field: "model", sortable: true, filter: true },
    { field: "price", sortable: true, filter: true },
  ]);

  useEffect(() => {
    console.log(sbom_data);
    const components = sbom_data.components;
    const dependencies = sbom_data.dependencies;
    const vulnerabilities = sbom_data.vulnerabilities;

    const row: {
      bomRef: string;
      description: string;
      type: string;
      numDependencies: number;
      isVulnerable: boolean;
      isVulnerableByDependency: boolean;
      vulnerabilityInfo: any;
    } = null;

    const rowData = components.map((component) => {
      row.bomRef = component.bomRef;
      row.description = component.description;
      row.type = component.type;
      row.numDependencies = component.numDependencies;
      row.isVulnerable = component.isVulnerable;
      row.isVulnerableByDependency = component.isVulnerableByDependency;
      row.vulnerabilityInfo = component.vulnerabilityInfo;
      return row;
    });
  }, []);

  return (
    <div
      className="ag-theme-alpine"
      style={{ height: "100vh", width: "100vw" }}
    >
      <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
    </div>
  );
};

export default TableView;
