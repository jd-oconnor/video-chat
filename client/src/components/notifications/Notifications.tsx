import { Button } from "@material-ui/core"
import React from "react"
import { ISocketContext, SocketContext } from "../../context"

const Notifications = () => {
  const context = React.useContext<ISocketContext>(SocketContext)

  return (
    <>
      {context.call.isReceivingCall && !context.callAccepted && (
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <h1>{context.call.name} is calling:</h1>
          <Button
            variant="contained"
            color="primary"
            onClick={context.answerCall}
          >
            Answer
          </Button>
        </div>
      )}
    </>
  )
}

export default Notifications
