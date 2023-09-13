import express from "express";

const app = express();
app.set("view engine","pug");
app.set("views",__dirname + "/views");
app.use("/public",express.static(__dirname+"/public"))

//유일한 root
app.get("/",(req,res)=>res.render("home"));
app.get("/*", (req, res) => res.render("home")); 

console.log("hello");

app.listen(3000);