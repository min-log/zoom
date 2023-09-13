const socket = io(); // 소켓 실행 및 서버 연결 

// 1. 룸생성 socket io room 기능이 존재
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const room = document.getElementById("room");
room.hidden = true;

let roomName;


function backendDone(msg){ // 백앤드 작업이 끝났음을 알림
	console.log("backend done");
	console.log(msg); // back에서 전달 받는 데이터 
}

function addMessage(message){
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = message;
	ul.appendChild(li);
}


//2. 메시지 전송
function handleMessageSubmit(event){
	event.preventDefault();
	const input = room.querySelector("#msg input");
	const value = input.value;
	socket.emit("new_message", input.value,roomName,()=>{ // 메시지 내용 , 룸 이름
		addMessage(`me : ${value}`); // 내가 보낸 메시지 내용 화면에 생성
	});
	input.value ="";
}

// 닉네임 생성
function handleNameSubmit(event){
	event.preventDefault();
	const input = room.querySelector("#name input");
	const value = input.value;
	socket.emit("nickname", input.value);
	input.value = "";
}


function showRoom(){
	welcome.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room : ${roomName}`;

	// 1. 열린 채팅방에서 메시지 전송 
	const msgform = room.querySelector("#msg");
	const nameform = room.querySelector("#name");

	msgform.addEventListener("submit",handleMessageSubmit);
	nameform.addEventListener("submit",handleNameSubmit);

}

// 룸 생성
function handleRoomSubmit(event){
	event.preventDefault();
	const input = form.querySelector("input");

	// emit(send) :
		// 1 인자 : 이벤트 명을 만들 수 있다.
		// 2 인자 : 값으로 Object 전달이 가능하다.socket io가 STRING=> OBJECT로 변경 시켜줌
		// 3-7 인자 : 보내고 싶은 인자를 계속 추가가 가능하다.
		// 마지막 인자 : 콜백 기능을 사용할 수 있다.  끝나고 실행되는 
	socket.emit("enter_room", input.value, showRoom);
	roomName = input.value;
	input.value = "";
}
form.addEventListener("submit",handleRoomSubmit);

//서버로 부터 전달 받아오는 메시지
socket.on("welcome",(user)=>{
	addMessage(`${user} : someone join`);
});
socket.on("bye", (user) => {
	addMessage(`${user} : someone bye`);
});
socket.on("new_message", addMessage);