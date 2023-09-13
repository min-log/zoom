import http from "http";
//import WebSocket from "ws";
import SocketIo from "socket.io";
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
const httpServer = http.createServer(app); // http서버
const ioServer = SocketIo(httpServer); // SocketIo 서버
 


// 룸 리스트
function publicRooms(){
	const { 
		sockets: { 
			adapter: {sids,rooms} 
		} 
	} = ioServer;

	const publicRooms = [];
	rooms.forEach((_,key)=>{
		if (sids.get(key) === undefined){
			publicRooms.push(key)
		}
	})
	return publicRooms;
}


// 방안에 몇명이 있는지 
function countRoom(roomName){
	return ioServer.sockets.adapter.rooms.get(roomName)?.size;

}

ioServer.on("connection", (socket) =>{
	socket["nickname"] = "Anon";
	console.log(socket);
	socket.onAny((event)=>{
		console.log(`socat event : ${event}`)
	});

	//1. 방생성
	socket.on("enter_room", (roomName,done) =>{	
		console.log(`socket id: ${socket.id}`);	
		console.log(socket.rooms);
		//1)  룸 생성
		socket.join(roomName);
		//2) 받아온 데이터 처리 후, 프론트 콜백 함수 실행시켜준다.
			// 다시 전달해주고 싶은 데이터를 넣어 전송도 가능하다. 
		done(); 
		//3) 처음 입장시 방안의 모두에게 입장 메시지 전달
		socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));

		//4) 알림기능 - 모든 채팅방에 새로운 방이 생성됨을 알림
		ioServer.sockets.emit("room_change", publicRooms());

	});

	//2. 방 나갈때 실행
	socket.on("disconnecting",()=>{	
		socket.rooms.forEach((room)=>{
			socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
		});
	});

	//2-1. 방을 나간후 실행
	socket.on("disconnect", () => {	
		//4) 알림기능 - 채팅방 내부의 모든 사용자가 나갔을 경우, 채팅방이 사라짐
		ioServer.sockets.emit("room_change", publicRooms());
	})

	//3. 메시지
	socket.on("new_message",(msg,room,done)=>{
		socket.to(room).emit("new_message",`${socket.nickname} : ${msg}`);
		done();
	});


	//4. 닉네임 생성
	socket.on("nickname",(nickname)=>{
		socket["nickname"] = nickname;
	});

});





/*  // ws 를 사용한 실시간 채팅 기능 구현------------------------------
const wss = new WebSocket.Server({httpServer}); // webSocket 서버
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
*/




httpServer.listen(3000, handleListen);

