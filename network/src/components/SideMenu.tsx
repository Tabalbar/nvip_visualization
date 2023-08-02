//@ts-ignore
import React, { useState, useEffect } from "react";
const vulnerabilityColor = "#ef476f";
const isVulnerableByDependencyColor = "#6E79C0";
const isNotVulnerableLibrary = "#69AF50";

const SideMenu = (props: { nodeInfo: any }) => {
  const node = {
    name: "",
    isComponent: false,
    info: {
      group: "",
      name: "",
      version: "",
      description: "",
      hashes: [],
      licenses: [],
      purl: "",
      externalReferences: [],
      type: "",
      "bom-ref": "",
    },
    type: "",
    vulnerabilityInfo: false as any,
    color: "#ef476f",
    index: 134,
    x: 1458.5306976523555,
    y: 411.3653957871608,
    vy: -0.019408358322301634,
    vx: 0.008821683951676023,
  };
  const [selectedNode, setSelectedNode] = useState(node);

  useEffect(() => {
    console.log(props.nodeInfo);
    setSelectedNode(props.nodeInfo);
  }, [props.nodeInfo]);
  //TODO need to highlight the node that is clicked

  return (
    <div
      style={{
        position: "absolute",
        width: "600px",
        // width: "300px",
        height: "95vh",
        backgroundColor: "#414141",
        right: "0",
        top: "0",
        color: "white",
        overflow: "hidden",
        padding: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "center",
        }}
      >
        {/* <div
          style={{
            border: "1px solid black",
            width: "500px",
            display: "flex",
            backgroundColor: "#575758",
            boxShadow: "5px 5px  black",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: "10px",
          }}
        >
          <h1 style={{ fontSize: 30 }}>
            {selectedNode ? selectedNode.info.name : null}{" "}
          </h1>
        </div> */}
        <div
          style={{
            border: "1px solid black",
            width: "500px",
            display: "flex",
            backgroundColor: "#575758",
            boxShadow: "5px 5px  black",
            flexDirection: "column",
            // alignItems: "center",
            textAlign: "left",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: isNotVulnerableLibrary,
              width: "100%",
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: 30 }}>
              {selectedNode ? selectedNode.info.name : null}
            </h1>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontSize: 18 }}>
              <strong style={{ fontWeight: "900" }}>Description: &nbsp;</strong>
              {selectedNode ? selectedNode.info.description : null}
            </p>
            <p style={{ fontSize: 18 }}>
              <strong style={{ fontWeight: "900" }}>Version: &nbsp;</strong>
              {selectedNode ? selectedNode.info.version : null}
            </p>
            <p style={{ fontSize: 18 }}>
              <strong style={{ fontWeight: "900" }}>Licenses: &nbsp;</strong>

              {selectedNode
                ? selectedNode.info.licenses?.map(
                    (license: any, index: number) => {
                      return (
                        <React.Fragment key={index}>
                          {license.license.id}
                        </React.Fragment>
                      );
                    }
                  )
                : "No Liscense"}
            </p>
          </div>
          {/* <h3>Insert link to NPM here?</h3> */}
        </div>

        {
          selectedNode && selectedNode.vulnerabilityInfo ? (
            <div
              style={{
                border: "1px solid black",
                width: "500px",
                display: "flex",
                backgroundColor: "#575758",
                boxShadow: "5px 5px  black",
                flexDirection: "column",
                // alignItems: "center",
                textAlign: "left",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  backgroundColor: vulnerabilityColor,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <h1 style={{ fontSize: 30 }}>Vulnerability Info</h1>
              </div>
              <div style={{ padding: "1.5rem" }}>
                TODO: left-align on commas{" "}
                <p style={{ fontSize: 18 }}>
                  <strong style={{ fontWeight: "900" }}>Name: &nbsp;</strong>
                  {selectedNode.vulnerabilityInfo.id
                    ? selectedNode.vulnerabilityInfo.id
                    : "No ID found"}
                </p>
                <p style={{ fontSize: 18 }}>
                  <strong style={{ fontWeight: "900" }}>Ratings: &nbsp;</strong>
                  {selectedNode.vulnerabilityInfo.ratings
                    ? selectedNode.vulnerabilityInfo.ratings.map(
                        (rating: any, index: number) => {
                          return (
                            <React.Fragment key={index}>
                              <br />
                              Source: {rating.source.name}
                              <br /> Score: {rating.score}
                              <br /> Severity: {rating.severity}
                              <br />
                              NEXTLINE
                              <br />
                            </React.Fragment>
                          );
                        }
                      )
                    : " No Scores found"}
                </p>
                <p style={{ fontSize: 18 }}>
                  <strong style={{ fontWeight: "900" }}>
                    Description: &nbsp;
                  </strong>
                  {selectedNode.vulnerabilityInfo.description
                    ? selectedNode.vulnerabilityInfo.description
                    : "No Description found"}
                </p>
                <p style={{ fontSize: 18 }}>
                  <strong style={{ fontWeight: "900" }}>
                    How many nodes am I affecting: &nbsp;
                  </strong>
                  I am affecting 100 billion other libraries
                </p>
              </div>
              {/* <h3>Insert link to NPM here?</h3> */}
            </div>
          ) : null
          // (
          //   <div
          //     style={{
          //       border: "1px solid black",
          //       width: "500px",
          //       display: "flex",
          //       backgroundColor: isNotVulnerableLibrary,
          //       boxShadow: "5px 5px  black",
          //       flexDirection: "column",
          //       // alignItems: "center",
          //       textAlign: "left",
          //       borderRadius: "10px",
          //       padding: "1rem",
          //     }}
          //   >
          //     <p>Not Detected as a Vulnerable Library</p>
          //   </div>
          // )
        }
      </div>
    </div>
  );
};

export default SideMenu;

// const node = {
//   name: "",
//   isComponent: false,
//   info: {
//     group: "",
//     name: "",
//     version: "",
//     description:
//       "",
//     hashes: [
//       {
//         alg: "MD5",
//         content: "9f298a2d65e68184f9ebaa938bc12106",
//       },
//       {
//         alg: "SHA-1",
//         content: "7a87d845ad3a155297e8f67d9008f4c1e5656b71",
//       },
//       {
//         alg: "SHA-256",
//         content:
//           "23729e3a2677ed5fb164ec999ba3fcdde3f8460e5ed086b6a43d8b5d46998d42",
//       },
//       {
//         alg: "SHA-512",
//         content:
//           "83304764252b2a10b321c7dc655b8db74d3866d3ac5d7e37c79fb981cbdd6ea98e967304974895f9b3705741c2d8df7ca6c54906c93e985f0d0203a939971018",
//       },
//       {
//         alg: "SHA3-256",
//         content:
//           "eb38fa99aa0f95f2e89f1ffd191a7fd8d804e2c3a633244f277d6cfdc70acdd8",
//       },
//       {
//         alg: "SHA3-512",
//         content:
//           "d8207e85c1a11d07fc2a0b25b57a4e1e302069b8c64c40a9da556f4d02032190828b52143063595c76efc0191ccf892e7135b271aa09a02ea46fefda513f22e6",
//       },
//     ],
//     licenses: [
//       {
//         license: {
//           id: "Apache-2.0",
//         },
//       },
//     ],
//     purl: "pkg:maven/commons-beanutils/commons-beanutils@1.9.2?type=jar",
//     externalReferences: [
//       {
//         type: "issue-tracker",
//         url: "http://issues.apache.org/jira/browse/BEANUTILS",
//       },
//       {
//         type: "vcs",
//         url: "http://svn.apache.org/viewvc/commons/proper/beanutils/tags/BEANUTILS_1_9_2/",
//       },
//       {
//         type: "build-system",
//         url: "http://vmbuild.apache.org/continuum/",
//       },
//       {
//         type: "mailing-list",
//         url: "http://mail-archives.apache.org/mod_mbox/commons-user/",
//       },
//       {
//         type: "website",
//         url: "http://www.apache.org/",
//       },
//       {
//         type: "distribution",
//         url: "https://repository.apache.org/service/local/staging/deploy/maven2",
//       },
//     ],
//     type: "library",
//     "bom-ref": "edeaabae-eb39-4ab9-8a43-78d25b6e1f8f",
//   },
//   type: "library",
//   vulnerabilityInfo: {
//     "bom-ref": "681ad965-7248-47e8-8512-f700cc7bf37f",
//     id: "CVE-2014-0114",
//     source: {
//       name: "NVD",
//       url: "https://nvd.nist.gov/",
//     },
//     ratings: [
//       {
//         source: {
//           name: "NVD",
//           url: "https://nvd.nist.gov/",
//         },
//         score: 7.5,
//         severity: "high",
//         method: "CVSSv2",
//         vector: "(AV:N/AC:L/Au:N/C:P/I:P/A:P)",
//       },
//     ],
//     cwes: [20],
//     description:
//       'Apache Commons BeanUtils, as distributed in lib/commons-beanutils-1.8.0.jar in Apache Struts 1.x through 1.3.10 and in other products requiring commons-beanutils through 1.9.2, does not suppress the class property, which allows remote attackers to "manipulate" the ClassLoader and execute arbitrary code via the class parameter, as demonstrated by the passing of this parameter to the getClass method of the ActionForm object in Struts 1.',
//     affects: [
//       {
//         ref: "edeaabae-eb39-4ab9-8a43-78d25b6e1f8f",
//       },
//     ],
//   },
//   color: "#ef476f",
//   isVulnerable: {
//     "bom-ref": "681ad965-7248-47e8-8512-f700cc7bf37f",
//     id: "CVE-2014-0114",
//     source: {
//       name: "NVD",
//       url: "https://nvd.nist.gov/",
//     },
//     ratings: [
//       {
//         source: {
//           name: "NVD",
//           url: "https://nvd.nist.gov/",
//         },
//         score: 7.5,
//         severity: "high",
//         method: "CVSSv2",
//         vector: "(AV:N/AC:L/Au:N/C:P/I:P/A:P)",
//       },
//     ],
//     cwes: [20],
//     description:
//       'Apache Commons BeanUtils, as distributed in lib/commons-beanutils-1.8.0.jar in Apache Struts 1.x through 1.3.10 and in other products requiring commons-beanutils through 1.9.2, does not suppress the class property, which allows remote attackers to "manipulate" the ClassLoader and execute arbitrary code via the class parameter, as demonstrated by the passing of this parameter to the getClass method of the ActionForm object in Struts 1.',
//     affects: [
//       {
//         ref: "edeaabae-eb39-4ab9-8a43-78d25b6e1f8f",
//       },
//     ],
//   },
//   index: 134,
//   x: 1458.5306976523555,
//   y: 411.3653957871608,
//   vy: -0.019408358322301634,
//   vx: 0.008821683951676023,
// };
