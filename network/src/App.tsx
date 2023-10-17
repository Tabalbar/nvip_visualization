import React, { useState, useEffect } from "react";
import D3Remasteredv2 from "./components/D3Remasteredv2";
import HelpMenu from "./components/HelpMenu";
import { Box, Button, ChakraProvider, Input } from "@chakra-ui/react";
import sbom_data from "./assets/sbom5.json";

function App() {
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isSBOMLoaded, setIsSBOMLoaded] = useState(false);
  const [SBOMData, setSBOMData] = useState<any>(null);

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

  // On file select (from the pop up)
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsedData = JSON.parse(content);
          // Now, you can work with the parsedData, which contains the JSON content.
          console.log(parsedData, "parsedData");

          setSBOMData(parsedData);
          setIsSBOMLoaded(true);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
        }
      };

      reader.readAsText(file);
    }
  };

  const handleLoadSampleData = () => {
    setSBOMData(sbom_data);
    setIsSBOMLoaded(true);
  };
  return (
    <ChakraProvider>
      {isSBOMLoaded ? (
        <D3Remasteredv2
          setIsHelpMenuOpen={setIsHelpMenuOpen}
          sbom_data={SBOMData}
          setIsSBOMLoaded={setIsSBOMLoaded}
        />
      ) : (
        <Box width="100vw" height="100vh" bg="#222222">
          <Box
            position={"absolute"}
            top="20%"
            left="43%"
            height="20rem"
            width="30rem"
            display={"flex"}
            flexDir={"column"}
            alignItems={"center"}
            bg="#555555"
            rounded={"lg"}
          >
            <h1>Load SBOM</h1>
            <Input
              mt="2rem"
              width="17rem"
              type="file"
              bg="gray"
              p="3px"
              onChange={onFileChange}
            />
            <Button
              onClick={handleLoadSampleData}
              mt="2rem"
              width="17rem"
              bg="gray"
            >
              Load Sample Data
            </Button>
          </Box>
        </Box>
      )}

      {isHelpMenuOpen ? (
        <HelpMenu setIsHelpMenuOpen={setIsHelpMenuOpen} />
      ) : null}
    </ChakraProvider>
  );
}

export default App;
