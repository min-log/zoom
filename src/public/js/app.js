// 프론트 앤드
// webSocket 서버와 연결 --- 사용하고 있는 브라우저의 location 정보를 자동으로 가져와서 넣어준다.

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");

function makeMessage(type,payload){
	const msg = {type,payload}
	return JSON.stringify(msg);
}

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open",()=>{
	console.log("connected to server O");
})
socket.addEventListener("message", (message) => {

	const li = document.createElement("li");
	li.innerText = message.data;
	messageList.append(li);

	console.log("new message : ", message.data);
})

socket.addEventListener("close", () => {
	console.log("disconnected from th server");
})

// setTimeout(()=>{
// 	socket.send("hello from the browser!");
// },10000);


function handleSubmit(event){
	event.preventDefault();
	const input = messageForm.querySelector("input");
	socket.send(makeMessage("new_message",input.value));
	input.value = "";

}
messageForm.addEventListener("submit", handleSubmit);

function handleNickSubmit(event){
	event.preventDefault();
	const input = nickForm.querySelector("input");
	socket.send(makeMessage("nickname", input.value));

}
nickForm.addEventListener("submit",handleNickSubmit);