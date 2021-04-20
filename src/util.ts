import {Bot} from "mineflayer";
import * as mineflayer from "mineflayer";
import {config} from "./config";
import {exWorker} from "./classes";
import {Response} from "express";

export const wait = (t:number) => new Promise(res=>setTimeout(res,t))
export function getrnd(min : number, max : number) {
	return Math.round(Math.random() * (max - min) ) + min;
}
export function login(u:string,p:string) : Promise<Bot> {
	return new Promise((resolve,reject) => {

		const bot = mineflayer.createBot({
			username: u,
			password: p,
			host: config.host,

		})
		bot.on('spawn', () => {
			resolve(bot)
		})
		bot.on('error', (err) => reject(err))
		setTimeout(() => reject(Error('Took too long to spawn.')), 5000) // 5 sec
	})

}
export function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
