import React, { useState } from "react";
import ReactFlowGraph from "./components/ReactFlowGraph";
import ReaGraph from "./components/ReaGraph";
import D3Network from "./components/d3Network";
import D3NetworkV2 from "./components/D3NetworkV2";
import D3Remastered from "./components/D3Remastered";

function App() {
  const [tabs, setTabs] = useState(4);

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
          <D3Network />
        </>
      ) : null}
      {tabs === 3 ? (
        <>
          <D3NetworkV2 />
        </>
      ) : null}
      {tabs === 4 ? (
        <>
          <D3Remastered />
        </>
      ) : null}
    </>
  );
}

export default App;
