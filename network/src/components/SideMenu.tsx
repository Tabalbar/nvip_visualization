//@ts-ignore
import React, { useState, useEffect } from "react";
const vulnerabilityColor = "#ef476f";
const isVulnerableByDependencyColor = "#6E79C0";
const isNotVulnerableLibrary = "#69AF50";
import "./style.css";
import { Button, Tooltip } from "@chakra-ui/react";

function parseCVSSVector(cvssVector: string) {
  // Remove parentheses and split the vector string by '/'
  const vectorParts = cvssVector.replace(/[()]/g, "").split("/");

  // Create an object to store the vector values
  const cvssObject: any = {};

  // Loop through the vector parts and extract values
  for (const part of vectorParts) {
    const [key, value] = part.split(":");
    cvssObject[key] = value;
  }

  return cvssObject;
}

function parseCVSS3Vector(cvss3Vector: string) {
  // Split the vector string by '/'
  const vectorParts = cvss3Vector.split("/");

  // Create an object to store the vector values
  const cvssObject: any = {};

  // Loop through the vector parts and extract values
  for (const part of vectorParts) {
    if (part.startsWith("CVSS:3.0")) {
      continue; // Skip the version part
    }

    const [key, value] = part.split(":");
    cvssObject[key] = value;
  }

  return cvssObject;
}

const SideMenu = (props: { nodeInfo: any }) => {
  const [vulnerabilityAttackVector, setVulnerabilityAttackVector] =
    useState(null);

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
  useEffect(() => {
    console.log(props.nodeInfo);
    if (props.nodeInfo && props.nodeInfo.vulnerabilityInfo) {
      const attackVector = props.nodeInfo.vulnerabilityInfo.ratings[0].vector;

      if (props.nodeInfo.vulnerabilityInfo.ratings[0].method === "CVSSv2") {
        const attackVectorObject = parseCVSSVector(attackVector);
        setVulnerabilityAttackVector(attackVectorObject);
      } else if (
        props.nodeInfo.vulnerabilityInfo.ratings[0].method === "CVSSv3"
      ) {
        const attackVectorObject = parseCVSS3Vector(attackVector);
        setVulnerabilityAttackVector(attackVectorObject);
      } else {
        setVulnerabilityAttackVector(null);
      }
    }
  }, [props.nodeInfo]);

  const [selectedNode, setSelectedNode] = useState(node);

  useEffect(() => {
    props.nodeInfo ? setSelectedNode(props.nodeInfo) : null;
  }, [props.nodeInfo]);
  //TODO need to highlight the node that is clicked

  return (
    <div
      style={{
        position: "absolute",
        width: "350px",
        // width: "300px",
        height: "95vh",
        // backgroundColor: "#414141",
        left: "1rem",
        top: "0",
        color: "white",
        overflow: "hidden",
        padding: "2rem",
        // pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
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
            width: "350px",
            display: "flex",
            flexDirection: "column",
            // alignItems: "center",
            textAlign: "left",
            backgroundColor: "#575758",
            boxShadow: "5px 5px  black",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: isNotVulnerableLibrary,
              width: "100%",
              textAlign: "center",
              flexDirection: "column",
              paddingTop: "0.7rem",
              height: "3rem",
            }}
          >
            <h1 style={{ fontSize: 20, fontWeight: "bold" }}>Component Info</h1>
          </div>
          <div
            style={{
              padding: "1.5rem",
            }}
          >
            <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
              <strong style={{ fontWeight: "900" }}>Name:</strong> &nbsp;
              {selectedNode ? selectedNode.info.name : "No Node selected"}
            </div>
            <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
              <strong style={{ fontWeight: "900" }}>Tree Depth:</strong> &nbsp;
              {props.nodeInfo ? props.nodeInfo.numberOfLayers : null}
            </div>
            <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
              <strong style={{ fontWeight: "900" }}>Description: &nbsp;</strong>
              <div
                style={{
                  maxHeight: "10rem",
                  overflowY: "scroll",
                  overflowX: "hidden",
                  pointerEvents: "auto",
                }}
              >
                {selectedNode ? selectedNode.info.description : null}
              </div>
            </div>
            <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
              <strong style={{ fontWeight: "900" }}>Version: &nbsp;</strong>
              {selectedNode ? selectedNode.info.version : null}
            </div>
            <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
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
                : null}
            </div>
            <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
              <strong style={{ fontWeight: "900" }}>
                How many nodes am I affecting: &nbsp;
              </strong>
              {props.nodeInfo ? props.nodeInfo.outgoingLinks : null}
            </div>
            <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
              <strong style={{ fontWeight: "900" }}>
                How many nodes are affecting me: &nbsp;
              </strong>
              {props.nodeInfo ? props.nodeInfo.ingoingLinks : null}
            </div>
          </div>
          {/* <h3>Insert link to NPM here?</h3> */}
        </div>
        {
          selectedNode && selectedNode.vulnerabilityInfo ? (
            <div
              style={{
                border: "1px solid black",
                width: "350px",
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
                  flexDirection: "column",
                  paddingTop: "0.7rem",
                  height: "3rem",
                }}
              >
                <h1 style={{ fontSize: 20, fontWeight: "bold" }}>
                  Vulnerability Info
                </h1>
              </div>
              <div style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
                  <strong style={{ fontWeight: "900" }}>Name: &nbsp;</strong>
                  {selectedNode.vulnerabilityInfo.id
                    ? selectedNode.vulnerabilityInfo.id
                    : "No ID found"}
                </div>
                <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
                  <strong style={{ fontWeight: "900" }}>Ratings: &nbsp;</strong>
                  {selectedNode.vulnerabilityInfo.ratings ? (
                    <>
                      <table>
                        <tr>
                          <th>Method</th>
                          <th>Rating</th>
                          <th>Severity</th>
                        </tr>
                        {selectedNode.vulnerabilityInfo.ratings.map(
                          (rating: any, index: number) => {
                            return (
                              <tr key={index}>
                                <td>{rating.method}</td>
                                <td>{rating.score}</td>
                                <td>{rating.severity}</td>
                              </tr>
                            );
                          }
                        )}
                      </table>
                    </>
                  ) : null}
                </div>
                <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
                  <strong style={{ fontWeight: "900" }}>Ratings: &nbsp;</strong>
                  {selectedNode.vulnerabilityInfo.ratings ? (
                    <>
                      <table>
                        <tr>
                          {vulnerabilityAttackVector
                            ? Object.keys(vulnerabilityAttackVector).map(
                                (key, index) => {
                                  return (
                                    <Tooltip
                                      label={retrieveDescription(
                                        key,
                                        selectedNode.vulnerabilityInfo
                                          .ratings[0].method
                                      )}
                                      placement={"top"}
                                    >
                                      <th
                                        style={{
                                          backgroundColor: "black",
                                          // position: "absolute",
                                        }}
                                        key={index}
                                      >
                                        {key}
                                      </th>
                                    </Tooltip>
                                  );
                                }
                              )
                            : null}
                        </tr>

                        <tr>
                          {vulnerabilityAttackVector
                            ? Object.keys(vulnerabilityAttackVector).map(
                                (key, index) => {
                                  return (
                                    <Tooltip
                                      label={retrieveMetricValueDescription(
                                        vulnerabilityAttackVector[key],
                                        selectedNode.vulnerabilityInfo
                                          .ratings[0].method
                                      )}
                                    >
                                      <td style={{ width: "50px" }} key={index}>
                                        {vulnerabilityAttackVector[key]}
                                      </td>
                                    </Tooltip>
                                  );
                                }
                              )
                            : null}
                        </tr>
                      </table>
                    </>
                  ) : null}
                </div>

                <div style={{ fontSize: 13, marginBottom: "0.5rem" }}>
                  <strong style={{ fontWeight: "900" }}>
                    Description: &nbsp;
                  </strong>
                </div>
                <div
                  style={{
                    maxHeight: "8rem",
                    overflowY: "scroll",
                    overflowX: "hidden",
                    pointerEvents: "auto",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                    }}
                  >
                    {selectedNode.vulnerabilityInfo.description
                      ? selectedNode.vulnerabilityInfo.description
                      : "No Description found"}
                  </p>
                </div>
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

const retrieveDescription = (property: string, method: string) => {
  const vuln = vulnerabilityDescriptions.find((p) => {
    return p.property === property && p.method === method;
  });
  if (vuln) {
    return vuln.description;
  } else {
    return "No description found";
  }
};

const retrieveMetricValueDescription = (
  metricValue: string,
  method: string
) => {
  const vuln = cvssv2Metrics.find((p) => {
    return p.metricValue === metricValue && p.method === method;
  });
  if (vuln) {
    return vuln.description;
  } else {
    return "No description found";
  }
};

const vulnerabilityDescriptions = [
  {
    method: "CVSSv2",
    property: "AV",
    description:
      "Attack Vector: This metric reflects how the vulnerability is exploited. The more remote an attacker can be to attack a host, the greater the vulnerability score.",
  },
  {
    method: "CVSSv2",

    property: "AC",
    description:
      "Access Complexity: This metric measures the complexity of the attack required to exploit the vulnerability once an attacker has gained access to the target system. For example, consider a buffer overflow in an Internet service: once the target system is located, the attacker can launch an exploit at will. Other vulnerabilities, however, may require additional steps in order to be exploited. For example, a vulnerability in an email client is only exploited after the user downloads and opens a tainted attachment. The lower the required complexity, the higher the vulnerability score.",
  },
  {
    method: "CVSSv2",

    property: "Au",
    description:
      "Authentication: This metric measures the number of times an attacker must authenticate to a target in order to exploit a vulnerability. This metric does not gauge the strength or complexity of the authentication process, only that an attacker is required to provide credentials before an exploit may occur. The fewer authentication instances that are required, the higher the vulnerability score.",
  },
  {
    method: "CVSSv2",

    property: "C",
    description:
      "Confidentiality Impact: This metric measures the impact on confidentiality of a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones. Increased confidentiality impact increases the vulnerability score.",
  },
  {
    method: "CVSSv2",

    property: "I",
    description:
      "Integrity Impact: This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and guaranteed veracity of information. Increased integrity impact increases the vulnerability score.",
  },
  {
    method: "CVSSv2",

    property: "AV",
    description:
      "Availability Impact: This metric measures the impact to availability of a successfully exploited vulnerability. Availability refers to the accessibility of information resources. Attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of a system. Increased availability impact increases the vulnerability score.",
  },

  {
    method: "CVSSv3",

    property: "AV",
    description:
      "This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the Base score) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable component. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across the Internet is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater score. ",
  },
  {
    method: "CVSSv3",

    property: "AC",
    description:
      "Attack Complexity: This metric describes the conditions beyond the attacker's control that must exist in order to exploit the vulnerability. As described below, such conditions may require the collection of more information about the target, the presence of certain system configuration settings, or computational exceptions. Importantly, the assessment of this metric excludes any requirements for user interaction in order to exploit the vulnerability (such conditions are captured in the User Interaction metric). This metric value is largest for the least complex attacks.",
  },
  {
    method: "CVSSv3",

    property: "PR",
    description:
      "Privileges Required: This metric describes the level of privileges an attacker must possess before successfully exploiting the vulnerability. This metric is greatest if no privileges are required.",
  },
  {
    method: "CVSSv3",

    property: "UI",
    description:
      "User Interaction: This metric captures the requirement for a user, other than the attacker, to participate in the successful compromise of the vulnerable component. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner. This metric value is greatest when no user interaction is required.",
  },
  {
    method: "CVSSv3",

    property: "S",
    description:
      "Scope: An important property captured by CVSS v3.0 is the ability for a vulnerability in one software component to impact resources beyond its means, or privileges. This consequence is represented by the metric Authorization Scope, or simply Scope. Formally, Scope refers to the collection of privileges defined by a computing authority (e.g. an application, an operating system, or a sandbox environment) when granting access to computing resources (e.g. files, CPU, memory, etc). These privileges are assigned based on some method of identification and authorization. In some cases, the authorization may be simple or loosely controlled based upon predefined rules or standards. ",
  },
  {
    method: "CVSSv3",

    property: "C",
    description:
      "Confedentiality: This metric measures the impact to the confidentiality of the information resources managed by a software component due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones. This metric value increases with the degree of loss to the impacted component.",
  },
  {
    method: "CVSSv3",

    property: "I",
    description:
      "Integrity: This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. This metric value increases with the consequence to the impacted component.",
  },
  {
    method: "CVSSv3",

    property: "A",
    description:
      "Availability: This metric measures the impact to the availability of the impacted component resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the impacted component, this metric refers to the loss of availability of the impacted component itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of an impacted component. This metric value increases with the consequence to the impacted component.",
  },
];

const cvssv2Metrics = [
  {
    method: "CVSSv2",
    metric: "AV",
    metricValue: "L",
    description:
      "Local: A vulnerability exploitable with only local access requires the attacker to have either physical access to the vulnerable system or a local shell account. Examples of locally exploitable vulnerabilities are peripheral attacks such as Firewire/USB DMA attacks, and local privilege escalations e.g., sudo.",
  },
  {
    method: "CVSSv2",
    metric: "AV",
    metricValue: "A",
    description:
      "Adjacent Network: A vulnerability exploitable with adjacent network access requires the attacker to have access to either the broadcast or collision domain of the vulnerable software. Examples of local networks include local IP subnet, Bluetooth, IEEE 802.11, and local Ethernet segment.",
  },
  {
    method: "CVSSv2",
    metric: "AV",
    metricValue: "N",
    description:
      "Network: A vulnerability exploitable with network access means the vulnerable software is bound to the network stack and the attacker does not require local network access or local access. Such a vulnerability is often termed 'remotely exploitable.' An example of a network attack is an RPC buffer overflow.",
  },
  {
    method: "CVSSv2",
    metric: "AC",
    metricValue: "H",
    description:
      "High: Specialized access conditions exist. For example: - In most configurations, the attacking party must already have elevated privileges or spoof additional systems in addition to the attacking system e.g., DNS hijacking. - The attack depends on social engineering methods that would be easily detected by knowledgeable people. For example, the victim must perform several suspicious or atypical actions. - The vulnerable configuration is seen very rarely in practice. - If a race condition exists, the window is very narrow.",
  },
  {
    method: "CVSSv2",
    metric: "AC",
    metricValue: "M",
    description:
      "Medium: The access conditions are somewhat specialized; the following are examples: - The attacking party is limited to a group of systems or users at some level of authorization, possibly untrusted. - Some information must be gathered before a successful attack can be launched. - The affected configuration is non-default, and is not commonly configured e.g., a vulnerability present when a server performs user account authentication via a specific scheme, but not present for another authentication scheme). - The attack requires a small amount of social engineering that might occasionally fool cautious users e.g., phishing attacks that modify a web browser's status bar to show a false link, having to be on someone's buddy list before sending an IM exploit.",
  },
  {
    method: "CVSSv2",
    metric: "AC",
    metricValue: "L",
    description:
      "Low: Specialized access conditions or extenuating circumstances do not exist. The following are examples: - The affected product typically requires access to a wide range of systems and users, possibly anonymous and untrusted e.g., Internet-facing web or mail server. - The affected configuration is default or ubiquitous. - The attack can be performed manually and requires little skill or additional information gathering. - The race condition is a lazy one (i.e., it is technically a race but easily winnable).",
  },
  {
    method: "CVSSv2",
    metric: "Au",
    metricValue: "M",
    description:
      "Multiple: Exploiting the vulnerability requires that the attacker authenticate two or more times, even if the same credentials are used each time. An example is an attacker authenticating to an operating system in addition to providing credentials to access an application hosted on that system.",
  },
  {
    method: "CVSSv2",
    metric: "Au",
    metricValue: "S",
    description:
      "Single: The vulnerability requires an attacker to be logged into the system (such as at a command line or via a desktop session or web interface).",
  },
  {
    method: "CVSSv2",
    metric: "Au",
    metricValue: "N",
    description:
      "None: Authentication is not required to exploit the vulnerability.",
  },
  {
    method: "CVSSv2",
    metric: "C",
    metricValue: "N",
    description:
      "None: There is no impact to the confidentiality of the system.",
  },
  {
    method: "CVSSv2",
    metric: "C",
    metricValue: "P",
    description:
      "Partial: There is considerable informational disclosure. Access to some system files is possible, but the attacker does not have control over what is obtained, or the scope of the loss is constrained. An example is a vulnerability that divulges only certain tables in a database.",
  },
  {
    method: "CVSSv2",
    metric: "C",
    metricValue: "C",
    description:
      "Complete: There is total information disclosure, resulting in all system files being revealed. The attacker is able to read all of the system's data (memory, files, etc.)",
  },
  {
    method: "CVSSv2",
    metric: "I",
    metricValue: "N",
    description: "None: There is no impact to the integrity of the system.",
  },
  {
    method: "CVSSv2",
    metric: "I",
    metricValue: "P",
    description:
      "Partial: Modification of some system files or information is possible, but the attacker does not have control over what can be modified, or the scope of what the attacker can affect is limited. For example, system or application files may be overwritten or modified, but either the attacker has no control over which files are affected or the attacker can modify files within only a limited context or scope.",
  },
  {
    method: "CVSSv2",
    metric: "I",
    metricValue: "C",
    description:
      "Complete: There is a total compromise of system integrity. There is a complete loss of system protection, resulting in the entire system being compromised. The attacker is able to modify any files on the target system.",
  },
  {
    method: "CVSSv2",
    metric: "A",
    metricValue: "N",
    description: "None: There is no impact to the availability of the system.",
  },
  {
    method: "CVSSv2",
    metric: "A",
    metricValue: "P",
    description:
      "Partial: There is reduced performance or interruptions in resource availability. An example is a network-based flood attack that permits a limited number of successful connections to an Internet service.",
  },
  {
    method: "CVSSv2",
    metric: "A",
    metricValue: "C",
    description:
      "Complete: There is a total shutdown of the affected resource. The attacker can render the resource completely unavailable.",
  },
];
