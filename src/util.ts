import {Bot} from "mineflayer";
import * as mineflayer from "mineflayer";
import {config} from "./config";
import {readFileSync} from "fs";
import {SocksClient} from 'socks'
import ProxyAgent from 'proxy-agent'

export const wait = (t:number) => new Promise(res=>setTimeout(res,t))
export function getrnd(min : number, max : number) {
	return Math.round(Math.random() * (max - min) ) + min;
}
const proxies = readFileSync('pxy.txt').toString().split('\r\n').filter(v=>!!v)

export function login(u:string,p:string) : Promise<Bot> {
	// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	console.log(getrnd(0,proxies.length-1),proxies.length-1,proxies)
	const prox = proxies[getrnd(0,proxies.length-1)].split(':')
	const proxy = {host:prox[0],port:prox[1]}
	const minecraft = { host: config.host, port: 25565 };
	console.log(proxy,minecraft)
	return new Promise((resolve,reject) => {

		const bot = mineflayer.createBot({
			username: u,
			password: p,
			host:minecraft.host
			// connect: (client) => {
			// 	SocksClient.createConnection({
			// 		proxy: {
			// 			host: proxy.host,
			// 			port: Number(proxy.port),
			// 			type: 5,
			// 			// userId: PROXY_USERNAME,
			// 			// password: PROXY_PASSWORD
			// 		},
			// 		command: 'connect',
			// 		destination: {
			// 			host: minecraft.host,
			// 			port: minecraft.port
			// 		}
			// 	}, (err:any, info:any) => {
			// 		if (err) {
			// 			console.error(err)
			// 			return
			// 		}
			// 		(client as any)?.setSocket?.(info.socket)
			// 		client.emit('connect')
			// 	})
			// },
			//
			// agent: new ProxyAgent({ protocol: 'socks5:', host: proxy.host, port: proxy.port } as any),
		})
		bot.on('spawn', () => {
			resolve(bot)
		})
		bot.on('error', (err) => reject(err))
		setTimeout(() => reject(Error('Took too long to spawn.')), 16e3)
	})

}
export function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
