import React, { useState } from "react";
import ReactFlowGraph from "./components/ReactFlowGraph";
import ReaGraph from "./components/ReaGraph";
import D3Remastered from "./components/D3Remastered";
import D3Remasteredv2 from "./components/D3Remasteredv2";
import D3Remasteredv3 from "./components/D3Remasteredv3";
import TableView from "./components/TableView";

function App() {
  const [tabs, setTabs] = useState(3);

  return (
    <>
      {tabs === 0 ? (
        <>
          <ReactFlowGraph />
        </>
      ) : null}
      {tabs === 1 ? (
        <>
          <ReaGraph />
        </>
      ) : null}
      {tabs === 2 ? (
        <>
          <D3Remastered />
        </>
      ) : null}
      {tabs === 3 ? (
        <>
          <D3Remasteredv2 />
        </>
      ) : null}
      {tabs === 4 ? (
        <>
          <D3Remasteredv3 />
        </>
      ) : null}
    </>
  );
}

export default App;
