import React, { useState } from "react";
import ReactFlowGraph from "./components/ReactFlowGraph";
import ReaGraph from "./components/ReaGraph";
import D3Network from "./components/d3Network";

function App() {
  const [tabs, setTabs] = useState(2);

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
    </>
  );
}

export default App;
