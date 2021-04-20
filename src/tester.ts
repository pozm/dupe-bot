import {readFileSync} from "fs";
import {login} from "./util";

const file = readFileSync('acc.txt').toString()
const accounts = file.split(/\r?\n/).map(login => login.split(':')).filter(v=>!!v[0])
let g = 0
for (let account of accounts) {
	console.log(5e3*g)
	setTimeout(()=>{
		login(account[0],account[1])
	},5e3*g)
	g++
}
