// import {getMinecraft} from "./minecraft";
import {app} from "./express";
import {config} from "./config";
import {Bot, createBot} from "mineflayer";
import {readFileSync} from "fs";
import {BotManager} from "./classes";
import {inspect} from "util";

const bm = new BotManager()
let addacc = bm.add.bind(bm)


async function main () {
	// convert accounts.txt => array
	const file = readFileSync('acc.txt').toString()
	const accounts = file.split(/\r?\n/).map(login => login.split(':')).filter(v=>!!v[0])
	const botProms = accounts.map(addacc)
	// const bots = await Promise.allSettled(botProms)
	const bots = (await Promise.allSettled(botProms)).map(({ value, reason } : {value:any,reason:any} | any) => value || reason).filter(value => !(value instanceof Error) && value !== undefined)
	console.log(`Bots (${bots.length} / ${accounts.length}) successfully logged in.`)

	console.log(inspect(bm.uuidToWorker))

}

main()

app.listen(4231,'0.0.0.0',()=>{
	console.log('listening on port 4231')
})

process.stdin.resume();//so the program will not close instantly

async function exitHandler() {
	await bm.AAAAFUCK()
	process.exit()
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));



export {bm}
