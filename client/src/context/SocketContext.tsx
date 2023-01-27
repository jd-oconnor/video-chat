import React from "react"
import Peer from "simple-peer"
import { io } from "socket.io-client"

interface ICall {
  isReceivingCall: boolean
  from?: string
  name: string
  signal: string
}

const defaultCallState = {
  isReceivingCall: false,
  from: "",
  name: "",
  signal: "",
}

const SocketContext = React.createContext<any>({
  call: defaultCallState,
  callAccepted: false,
  myVideo: null,
  userVideo: null,
  stream: undefined,
  name: "",
  setName: () => {},
  callEnded: false,
  me: "",
  callUser: () => {},
  leaveCall: () => {},
  answerCall: () => {},
})

const socket = io("http://localhost:5000")

const SocketProvider = ({ children }: any) => {
  // TODO: convert to useReducer
  const [callAccepted, setCallAccepted] = React.useState<boolean>(false)
  const [callEnded, setCallEnded] = React.useState<boolean>(false)
  const [stream, setStream] = React.useState<MediaStream | undefined>()
  const [name, setName] = React.useState<string>("")
  const [call, setCall] = React.useState<ICall>(defaultCallState)
  const [me, setMe] = React.useState<string>("")

  const myVideo = React.useRef<Record<"srcObject", MediaStream | null>>({
    srcObject: null,
  })
  const userVideo = React.useRef<Record<"srcObject", MediaStream | null>>({
    srcObject: null,
  })
  const connectionRef = React.useRef<Peer.Instance | null>(null)

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream: MediaStream) => {
        setStream(currentStream)

        myVideo.current.srcObject = currentStream
      })

    socket.on("me", (id) => setMe(id))

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal })
    })
  }, [callEnded])

  const answerCall = () => {
    setCallAccepted(true)
    setCallEnded(false)

    const peer = new Peer({ initiator: false, trickle: false, stream })

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from })
    })

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream
    })

    peer.signal(call.signal)

    connectionRef.current = peer
  }

  const callUser = (id: string) => {
    const peer = new Peer({ initiator: true, trickle: false, stream })

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      })
    })

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream
    })

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true)

      peer.signal(signal)
    })

    connectionRef.current = peer
  }

  const leaveCall = () => {
    connectionRef.current?.destroy()
    // window.location.reload()
    socket.disconnect()
    setStream(undefined)
    setMe("")
    setCall(defaultCallState)
    setCallAccepted(false)
    setCallEnded(true)
  }

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
