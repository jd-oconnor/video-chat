// import { AppBar, Typography } from "@material-ui/core"
// import { makeStyles } from "@material-ui/core/styles"
// import { Notifications, Sidebar, VideoPlayer } from "./components"

// const useStyles = makeStyles((theme) => ({
//   appBar: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     alignItems: "center",
//     padding: 16,
//     width: "100%",

//     [theme.breakpoints.down("xs")]: {
//       width: "90%",
//     },
//   },
//   image: {
//     marginLeft: "15px",
//   },
//   wrapper: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     width: "100%",
//   },
// }))

// const App = () => {
//   const classes = useStyles()

//   return (
//     <div className={classes.wrapper}>
//       <AppBar className={classes.appBar} position="static" color="inherit">
//         <Typography variant="h4" align="center" style={{ color: "#333" }}>
//           Video Chat
//         </Typography>
//       </AppBar>
//       <VideoPlayer />
//       <Sidebar>
//         <Notifications />
//       </Sidebar>
//     </div>
//   )
// }

// export default App

import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { io } from "socket.io-client"
import "./App.css"
import { SocketContext } from "./context"

// const socket = io.connect("http://localhost:5000")
const socket = io("http://localhost:6868")

function App() {
  const context = React.useContext(SocketContext)

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Zoomish</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            {context.stream && (
              <video
                playsInline
                muted
                ref={context.myVideo}
                autoPlay
                style={{ width: "300px" }}
              />
            )}
          </div>
          <div className="video">
            {context.callAccepted && !context.callEnded ? (
              <video
                playsInline
                ref={context.userVideo}
                autoPlay
                style={{ width: "300px" }}
              />
            ) : null}
          </div>
        </div>
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => context.setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <CopyToClipboard text={context.me}>
            <Button
              style={{ marginTop: "2rem" }}
              onClick={() => console.log(context.me)}
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon fontSize="large" />}
            >
              Copy ID
            </Button>
          </CopyToClipboard>

          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={context.idToCall}
            onChange={(e) => context.setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {context.callAccepted && !context.callEnded ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={context.leaveCall}
              >
                End Call
              </Button>
            ) : (
              <IconButton
                color="primary"
                aria-label="call"
                onClick={() => context.callUser(context.idToCall)}
              >
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
            {context.idToCall}
          </div>
        </div>
        <div>
          {context.receivingCall && !context.callAccepted ? (
            <div className="caller">
              <h1>{context.name} is calling...</h1>
              <Button
                variant="contained"
                color="primary"
                onClick={context.answerCall}
              >
                Answer
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default App
