import React, { PropsWithChildren } from "react"
import Peer from "simple-peer"
import { io } from "socket.io-client"

export interface ISocketContext {
  callAccepted: boolean
  receivingCall: boolean
  myVideo: React.LegacyRef<HTMLVideoElement> | undefined
  userVideo: React.LegacyRef<HTMLVideoElement> | undefined
  stream: MediaStream | undefined
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  callEnded: boolean
  me: string
  callUser: (id: string) => void
  leaveCall: () => void
  answerCall: () => void
  idToCall: string
  setIdToCall: React.Dispatch<React.SetStateAction<string>>
}

const SocketContext = React.createContext<ISocketContext>({
  callAccepted: false,
  receivingCall: false,
  myVideo: null,
  userVideo: null,
  stream: undefined,
  name: "",
  setName: () => {},
  callEnded: false,
  me: "",
  callUser: (id: string) => {},
  leaveCall: () => {},
  answerCall: () => {},
  idToCall: "",
  setIdToCall: () => {},
})

const socket = io("http://localhost:6868")

const SocketProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // TODO: convert to useReducer
  const [callAccepted, setCallAccepted] = React.useState<boolean>(false)
  const [callEnded, setCallEnded] = React.useState<boolean>(false)
  const [stream, setStream] = React.useState<any>()
  const [name, setName] = React.useState<string>("")
  const [me, setMe] = React.useState<string>("")
  const [idToCall, setIdToCall] = React.useState<string>("")

  const myVideo = React.useRef<any>({ srcObject: null })
  const userVideo = React.useRef<any>()
  const connectionRef = React.useRef<Peer.Instance | null>(null)

  const [receivingCall, setReceivingCall] = React.useState<boolean>(false)
  const [caller, setCaller] = React.useState<string>("")
  const [callerSignal, setCallerSignal] = React.useState<any>()

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream: MediaStream) => {
        setStream(currentStream)

        myVideo.current!.srcObject = currentStream
      })

    socket.on("me", (id) => setMe(id))

    socket.on("callUser", (data) => {
      setReceivingCall(true)
      setCaller(data.from)
      setName(data.name)
      setCallerSignal(data.signal)
    })
  }, [callEnded])

  const answerCall = () => {
    setCallAccepted(true)
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    })
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller })
    })
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream
    })

    peer.signal(callerSignal)
    connectionRef.current = peer
  }

  const callUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    })
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      })
    })
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream
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
    setCallAccepted(false)
    setCallEnded(true)
    setReceivingCall(true)
    setCaller("")
    setName("")
    setCallerSignal(null)
  }

  return (
    <SocketContext.Provider
      value={{
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
        idToCall,
        setIdToCall,
        receivingCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export { SocketProvider, SocketContext }
