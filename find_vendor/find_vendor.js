const sbom_data = require("../data/jquery_sbom.json");
const fs = require("fs");

async function fetchNPMRepo(name) {
  const endpoint = `https://registry.npmjs.org/${name}`;
  const res = await fetch(endpoint);
  const data = await res.json();
  return data;
}

async function fetchUserByEmail(email) {
  const endpoint = `https://api.github.com/search/users?q=${email}`;
  const options = {
    headers: {
      Authorization: "token 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",
    },
  };
  const res = await fetch(endpoint, options);
  const data = await res.json();
  return data;
}

async function fetchUserByUsername(username) {
  const endpoint = `https://api.github.com/users/${username}`;
  const res = await fetch(endpoint);
  const data = await res.json();
  return data;
}

async function fetchPackageVulnerability(packageName, version) {
  const endpoint = "https://api.osv.dev/v1/query";
  const endpointOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: version,
      package: {
        name: packageName,
        ecosystem: "npm",
      },
    }),
  };
  const res = await fetch(endpoint, endpointOptions);
  const data = await res.json();
  return data.vulns;
}

function writeJSONFile(nameOfFile, data) {
  fs.writeFile(`./output/${nameOfFile}`, JSON.stringify(data), (error) => {
    if (error) {
      console.error(error);
      throw error;
    } else {
      console.log("data.json written correctly");
    }
  });
}

async function main() {
  const vulnerabilityObject = { vulnerabilities: [] };
  for (let i = 0; i < sbom_data.packages.length; i++) {
    const package = sbom_data.packages[i];
    const name = package.name.split(":")[1];
    const version = package.versionInfo;

    sbom_data.packages[i].npmRepo = await fetchNPMRepo(name);
    sbom_data.packages[i].vulns = await fetchPackageVulnerability(
      name,
      version
    );

    if (sbom_data.packages[i].vulns) {
      for (
        let j = 0;
        j < sbom_data.packages[i].npmRepo.maintainers.length;
        j++
      ) {
        const userEmailResponse = await fetchUserByEmail(
          sbom_data.packages[i].npmRepo.maintainers[j].email
        );
        sbom_data.packages[i].vulns.githubEmail = userEmailResponse;
        // console.log(userEmailResponse);
        for (let k = 0; k < userEmailResponse.items.length; k++) {
          const usernameResposne = await fetchUserByUsername(
            userEmailResponse.items[k].login
          );
          sbom_data.packages[i].vulns.githubUsername = usernameResposne;
          console.log(
            usernameResposne.location,
            userEmailResponse.items[k].login
          );
          vulnerabilityObject.vulnerabilities.push({
            location: usernameResposne.location,
            username: userEmailResponse.items[k].login,
            vulnerability: sbom_data.packages[i].vulns,
          });
        }
      }
    }
  }
  // writeJSONFile("sage3_vulnerabilities.json", vulnerabilityObject);

  // writeJSONFile("sage3_sbom_with_vulnerabilities.json", sbom_data);
  writeJSONFile("jquery_vulnerabilities.json", vulnerabilityObject);

  writeJSONFile("jquery_sbom_with_vulnerabilities.json", sbom_data);
}
main();
// writeJSONFile("testing.json", { message: "This is a test" });
// writeJSONFile("testing2.json", { message: "This is a test2" });
