import React, { useState } from "react";
import ReactFlowGraph from "./components/ReactFlowGraph";
import ReaGraph from "./components/ReaGraph";
import D3Remastered from "./components/D3Remastered";

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
          <D3Remastered />
        </>
      ) : null}
    </>
  );
}

export default App;
