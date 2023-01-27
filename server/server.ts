const express = require("express")
const http = require("http")
const app = express()
import { Socket } from "socket.io"
const cors = require("cors")

const server = require("http").createServer(app)

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

app.use(cors())

const PORT = process.env.PORT || 6868

app.get("/", (req, res) => {
  res.send("Running")
})

io.on("connection", (socket: Socket) => {
  socket.emit("me", socket.id)

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded")
  })

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name })
  })

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
  })
})

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
