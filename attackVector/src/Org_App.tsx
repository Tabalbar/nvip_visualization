import { useState, useEffect } from "react";
import sbom_data from "./assets/sbom5.json";
import { Chart } from "react-google-charts";
import { SBOM } from "./utils/SBOM";
import { Component, SBOMDataProps } from "./utils/types";

export const data = [
  [
    {
      v: "Mikeey",
      f: 'Mikey<div style="color:red; font-style:italic">Presidente</div>',
    },
    "Jim",
    "",
  ],
  [
    {
      v: "Jim",
      f: 'Jim<div style="color:red; font-style:italic">Vice President</div>',
    },
    "Alice",
    "",
  ],
  ["Alice", "Mike", ""],
  ["Bob", "Jim", ""],
  ["Carol", "Bob", ""],
];

export const options = {
  allowHtml: true,
};

function App() {
  const [orgData, setOrgData] = useState<
    (string[] | [{ v: string; f: string }, string, string])[]
  >([]);
  useEffect(() => {
    console.log("starting");
    const sbom = new SBOM(sbom_data as unknown as SBOMDataProps);
    const tmpOrgData = [];
    tmpOrgData.push(["root", "", ""]);
    for (let i = 0; i < sbom.dependencies.length; i++) {
      console.log(sbom.dependencies.length);
      const dependency = sbom.dependencies[i];
      if (dependency) {
        const parent = sbom.getComponent(dependency.ref);
        const componentChildren = dependency.dependsOn;
        if (parent) {
          const row: string[] | [{ v: string; f: string }, string, string] = [
            {
              v: parent?.name,
              f: `${parent?.name} ${
                sbom.getVulnerability(parent["bom-ref"]) !== undefined
                  ? '<div style="background-color: red">Vulnerable</div>'
                  : ""
              }`,
            },
            parent.directImport ? "root" : "",
            "",
          ];
          tmpOrgData.push(row);
        }

        for (let i = 0; i < componentChildren.length; i++) {
          const child = sbom.getComponent(componentChildren[i]);
          if (parent?.name === "ejs") {
            console.log(parent);
          }
          if (child && parent) {
            const row: string[] | [{ v: string; f: string }, string, string] = [
              {
                v: child?.name,
                f: `${child?.name} ${
                  sbom.getVulnerability(child["bom-ref"]) !== undefined
                    ? '<div style="background-color: red">Vulnerable</div>'
                    : ""
                }`,
              },
              child.directImport ? "root" : parent?.name,
              "",
            ];
            tmpOrgData.push(row);
          }
        }
      }
    }
    setOrgData(tmpOrgData);
    console.log(tmpOrgData);
  }, []);

  return (
    <>
      <div
        style={{
          color: "black",
        }}
      >
        <Chart
          chartType="OrgChart"
          data={orgData}
          options={options}
          width="100%"
          height="400px"
        />
      </div>
    </>
  );
}

export default App;
