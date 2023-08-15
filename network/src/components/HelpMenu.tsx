import react from "react";
import links from "../assets/links.gif";
import pan from "../assets/pan.gif";
import zoom from "../assets/zoom.gif";
import hovering from "../assets/hovering.gif";
import safe from "../assets/safe.png";
import vulnerableByDependency from "../assets/vulnerableByDependency.png";
import low_vulnerability from "../assets/low_vulnerability.png";
import medium_vulnerability from "../assets/medium_vulnerability.png";
import high_vulnerability from "../assets/high_vulnerability.png";
import small from "../assets/small.png";
import large from "../assets/large.png";
import focused from "../assets/focused.png";
import activated from "../assets/activated.png";
import none from "../assets/none.png";
import increase from "../assets/increase.gif";

const HelpMenu = (props: { setIsHelpMenuOpen: any }) => {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          // backgroundColor: "gray",
        }}
      >
        <div
          style={{
            margin: "5% auto",
            padding: "20px",
            backgroundColor: "#BFBFBF",
            width: "70vw",
            height: "70vh",
            overflow: "auto",
            color: "black",
            border: "5px black solid",
            boxShadow: "30px 30px  black",
            borderRadius: "10px",
            position: "relative",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              zIndex: 2,
              backgroundColor: "rgb(239,71,111)",
            }}
            onClick={() => props.setIsHelpMenuOpen(false)}
          >
            X
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#23A9DC",
              transform: "translateY(-20px)",
              marginRight: "-20px",
              marginLeft: "-20px",
            }}
          >
            <h1>Help Menu</h1>
          </div>

          {/**
           * Representation
           */}
          <div style={{ marginLeft: "1rem" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-evenly",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  backgroundColor: "#a8a8a8",
                  borderRadius: "10px",
                }}
              >
                <h2 style={{ textAlign: "center" }}>Definition</h2>
                Nodes: Components in the software project <br />
                Links: Dependencies between components
                <h2>Direction of links</h2>
                <img src={links} style={{ width: "20rem" }} />
                <p style={{ width: "30rem", textAlign: "center" }}>
                  The animated dotted lines indicate where the library is being
                  imported. In the example above, the animated dotted lines are
                  going towards the yellow node. This means the yellow node is
                  importing the gray node.
                </p>
                <div>
                  <div>
                    <h2>Size of Node</h2>

                    <table id="colorTable">
                      <tr>
                        <th>Size</th>
                        <th>Defintion</th>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "center" }}>
                          <img src={small} width={"100px"} />
                        </td>
                        <td>
                          A small node means that it may not be importing a lot
                          of libraries or it is not importing any libraries at
                          all. In other words, it <strong>IS NOT</strong>{" "}
                          dependent on other components.
                        </td>
                      </tr>

                      <tr>
                        <td style={{ textAlign: "center" }}>
                          <img src={large} width={"100px"} />
                        </td>
                        <td>
                          A large node means that it is importing a large number
                          of components. Which means it <strong>IS</strong>{" "}
                          dependent on other components.
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    backgroundColor: "#a8a8a8",
                    borderRadius: "10px",
                    width: "40rem",
                    padding: "1rem",
                    height: "53.5rem",
                  }}
                >
                  <h2>Color of Node</h2>

                  <table id="colorTable">
                    <tr>
                      <th>Color</th>
                      <th>Defintion</th>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center", width: "150px" }}>
                        <img src={safe} width={"100px"} />
                      </td>
                      <td>Safe Component</td>
                    </tr>

                    <tr>
                      <td style={{ textAlign: "center", width: "150px" }}>
                        <img src={vulnerableByDependency} width={"100px"} />
                      </td>
                      <td>
                        Vulnerable by dependency. In other words, this component
                        is importing from another component that is vulnerable
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center", width: "150px" }}>
                        <img src={low_vulnerability} width={"100px"} />
                      </td>
                      <td>
                        Component with a low vulnerability severity rating.
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center", width: "150px" }}>
                        <img src={medium_vulnerability} width={"100px"} />
                      </td>
                      <td>
                        Component with a medium vulnerability severity rating.
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center", width: "150px" }}>
                        <img src={high_vulnerability} width={"100px"} />
                      </td>
                      <td>
                        Component with a high vulnerability severity rating.
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/**
           * Navigation
           */}
          <div
            style={{
              backgroundColor: "#a8a8a8",
              borderRadius: "10px",
              padding: "1rem",
              marginTop: "1rem",
              marginLeft: "1rem",
              textAlign: "center",
            }}
          >
            <h2>Navigation</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <h3>Panning</h3>
                <img src={pan} style={{ width: "20rem" }} />
                <p>Click and drag to pan</p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <h3>Zooming</h3>
                <img src={zoom} style={{ width: "20rem" }} />
                <p>Scroll to Zoom</p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
              gap: "1rem",
            }}
          >
            {/**
             * Interaction
             */}

            <div
              style={{
                backgroundColor: "#a8a8a8",
                borderRadius: "10px",
                padding: "1rem",
                marginTop: "1rem",
                paddingRight: "5rem",
                marginLeft: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h3>Hovering</h3>
                  <img src={hovering} style={{ width: "20rem" }} />
                  Hover over a node to:
                  <ul>
                    <li>Display its name</li>
                    <li>Display its links</li>
                    <li>Display its information</li>
                  </ul>
                </div>
              </div>
            </div>

            {/**
             * Clicking
             */}
            <div
              style={{
                backgroundColor: "#a8a8a8",
                borderRadius: "10px",
                padding: "1rem",
                marginTop: "1rem",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              <h2>Clicking on a node</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  width: "57rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "18rem",
                  }}
                >
                  <h3>Focused</h3>
                  <img src={focused} style={{ width: "13rem" }} />A node with
                  two rings is focused, meaning it will always:
                  <ul>
                    <li>Display its name</li>
                    <li>Display its links</li>
                  </ul>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "18rem",
                  }}
                >
                  <h3>Activated</h3>
                  <img src={activated} style={{ width: "13rem" }} />A node with
                  a single ring is activated, meaning it will always:
                  <ul>
                    <li>Display its name</li>
                    <li>Display its links</li>
                  </ul>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "18rem",
                  }}
                >
                  <h3>none</h3>
                  <img src={none} style={{ width: "13rem" }} />
                  Nodes that do not have any rings will not display its links or
                  name:
                  <ul style={{ listStyle: "none" }}>
                    <li>-</li>
                    <li>-</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/**
           * Clicking
           */}
          <div
            style={{
              backgroundColor: "#a8a8a8",
              borderRadius: "10px",
              padding: "1rem",
              marginTop: "1rem",
              textAlign: "center",
              marginBottom: "1rem",
              marginLeft: "1rem",
            }}
          >
            <h2>Tree Depth</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <div>
                <img src={increase} style={{ width: "40rem" }} />
              </div>
              <div>
                <p style={{ textAlign: "center" }}>
                  While a node is in focus{" "}
                  <img
                    src={focused}
                    style={{ width: "40px", display: "inline" }}
                  />{" "}
                  , press + or - on your keyboard to increase or decrease the
                  node's tree depth.
                  <br />
                  Note: An audio sound will play when you have reached the
                  maximum or minumum tree depth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpMenu;
