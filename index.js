const express = require("express");
require("dotenv").config({path:'./.env'});
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");


app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });


app.get("/",(req,res)=>{
  res.send("Server start success")
})  
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
const PORT= process.env.PORT||5000
const server = app.listen(PORT, () =>
  console.log(`Server started on ${PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "https://jocular-blini-0a5efe.netlify.app",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
