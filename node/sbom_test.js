const fs = require("fs");
fs.readFile("./sbom_dep2.json", "utf8", (err, jsonString) => {
  if (err) {
    console.log("File read failed:", err);
    return;
  }
  const json = JSON.parse(jsonString);
  console.log("File data:", Object.getOwnPropertyNames(json));
});
