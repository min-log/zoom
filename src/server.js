import http from "http";
import WebSocket from "ws";
import express from "express";
import { Socket } from "dgram";

const app = express();
app.set("view engine","pug");
app.set("views",__dirname + "/views");
app.use("/public",express.static(__dirname+"/public"))
//유일한 root
app.get("/",(req,res)=>res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); 


const handleListen = () => console.log('Listening on http://localhost:3000 or ws://localhost:3000');
// 두개가 꼭 필요한 사항은 아니고 한 포트에 두개가 존재 하려면 아래와 같이 작성.
const server = http.createServer(app); // http서버
const wss = new WebSocket.Server({server}); // webSocket 서버

const sockets =[];


wss.on("connection", (socket)=>{ // socket : 연결된 브라우저 
	socket["nickname"] = "Anon" ; 
	console.log("connected to browser");

	sockets.push(socket);
	
	socket.on("close",()=>console.log("disconnected from th browser"));

	socket.on("message", (msg)=>{
		// 서버에서 String 값으로 object 전달 받음. 
		const message = JSON.parse(msg);
		switch (message.type){
			case "new_message" :
				// 연결된 클라이언트 모두에게 메시지 전달 
				sockets.forEach((aSocket) => 
					aSocket.send(`${socket.nickname} : ${message.payload}`)
				);
				break;
			case "nickname" :
				console.log(message.payload);
				socket["nickname"]= message.payload;
				break;
		}
		// sockets.forEach((aSocket) => aSocket.send(message.toString()));
		//socket.send(message.toString());
	});

	socket.send("hello!!");

});
server.listen(3000, handleListen);

