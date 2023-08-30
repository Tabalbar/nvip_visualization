const data = require("./nvip_visualization_Tabalbar.json");

console.log(data);
const customHeaders = {
  "Content-Type": "application/json",
};
const url = "https://api.osv.dev/v1/query";

for (let i = 0; i < data.packages.length; i++) {
  const package = data.packages[i];
  console.log(package.name.split(":")[1], package.versionInfo);
  const name = package.name.split(":")[1];
  const version = package.versionInfo;

  fetch(url, {
    method: "POST",
    headers: customHeaders,
    body: JSON.stringify({
      version: version,
      package: {
        name: name,
        ecosystem: "npm",
      },
    }),
  })
    .then((response) => response.json())
    .then((OVS_response) => {
      if (Object.keys(OVS_response)) console.log(OVS_response);
    });
}
