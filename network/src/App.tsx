import React, { useState } from "react";
import ReactFlowGraph from "./components/ReactFlowGraph";
import ReaGraph from "./components/ReaGraph";

function App() {
  const [tabs, setTabs] = useState(1);

  return (
    <>
      hello world
      {tabs === 0 ? (
        <>
          <button onClick={() => setTabs(1)}>next</button>
          <ReactFlowGraph />
        </>
      ) : (
        <>
          <button onClick={() => setTabs(0)}>prev</button>
          <ReaGraph />
        </>
      )}
    </>
  );
}

export default App;
