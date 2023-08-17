import React, { useState, useEffect } from "react";
import ReactFlowGraph from "./components/ReactFlowGraph";
import ReaGraph from "./components/ReaGraph";
import D3Remastered from "./components/D3Remastered";
import D3Remasteredv2 from "./components/D3Remasteredv2";
import D3Remasteredv3 from "./components/D3Remasteredv3";
import TableView from "./components/TableView";
import HelpMenu from "./components/HelpMenu";

function App() {
  const [tabs, setTabs] = useState(3);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  const handleCloseHelpMenu = (event: { key: any; keyCode: any }) => {
    const { key, keyCode } = event;
    if (keyCode === 27) {
      setIsHelpMenuOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleCloseHelpMenu);
    return () => {
      window.removeEventListener("keydown", handleCloseHelpMenu);
    };
  }, []);

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
          <D3Remasteredv2 setIsHelpMenuOpen={setIsHelpMenuOpen} />
        </>
      ) : null}
      {tabs === 4 ? (
        <>
          <D3Remasteredv3 />
        </>
      ) : null}
      {isHelpMenuOpen ? (
        <HelpMenu setIsHelpMenuOpen={setIsHelpMenuOpen} />
      ) : null}
    </>
  );
}

export default App;
