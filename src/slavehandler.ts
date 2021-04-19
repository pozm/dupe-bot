import {isWorker, worker} from "cluster";
import {login} from "./util";
import {message} from "./classes";
import {Bot} from "mineflayer";
import {Getbal, startDuping, stopDuping} from "./minecraft";

let Bot : Bot;


function newBot() {
	Bot.on('respawn',()=>{
		process?.send?.({
			m:'11',
			d: Bot.player
		})
	})
	Bot.on('kicked',()=>{
		console.log('kicked')
		process?.send?.({
			m:'12',
			d:{}
		})
	})
	stopDuping(Bot);
	startDuping(Bot);
}

if (isWorker) {
	console.log = (...args : any[]) => process?.send?.({m: 'LOG',d: args})
	console.error = (...args : any[]) => process?.send?.({m: 'ERR',d: args})
	process.on('message',async (content:message) => {
		try {

			switch (content.m) {
				case 'login' :{

					login(content.d.u, content.d.p).then(bot =>{
						Bot = bot;
						process?.send?.({
							m:'login',
							u:content.u,
							d: bot.player

						})

						newBot()
					},console.log)

				} break;
				case 'relogin' : {
					if (Bot) {
						Bot.quit();
					}
					login(content.d.u, content.d.p).then(bot =>{
						Bot = bot;
						process?.send?.({
							m:'login',
							u:content.u,
							d: bot.player

						})

						// helper

						newBot()


					},console.log)
				} break;
				case '75' :{

					process?.send?.({
						m:content.m,
						u:content.u,
						d:await Getbal(Bot) ?? 'Unknown'

					})

				} break;
				case '76' :{
					process?.send?.({
						m:content.m,
						u:content.u,
						d:startDuping(Bot)
					})
					console.log('done')
				} break;
				case '77' :{
					process?.send?.({
						m:content.m,
						u:content.u,
						d:stopDuping(Bot)

					})
				} break;
				case '44' :{
					process?.send?.({
						m:content.m,
						u:content.u,
						d:Bot.players
					})
				} break;
				case '45' :{
					Bot.chat(`/tpa ${content.d.t}`)
					process?.send?.({
						m:content.m,
						u:content.u,
						d:Bot.players
					})
				} break;
				case '172' :{
					Bot.chat(`/${content.d.m}`)
					process?.send?.({
						m:content.m,
						u:content.u,
						d:{}
					})
				} break;
				case '51' :{
					let b = (await Getbal(Bot))
					let mon = parseInt(b.replace(/\D+/gmi,''))
					if (mon > 20)
						mon = mon -10
					console.log(mon,`/f money d ${mon.toString()}`,b)
					Bot.chat(`/f money d ${mon.toString()}`)
					process?.send?.({
						m:content.m,
						u:content.u,
						d:mon
					})

				} break;
				case '99' :{
					Bot.quit()
					process?.send?.({
						m:content.m,
						u:content.u,
						d:'bye!'

					})
					process.exit(88)
				} break;
			}

		} catch (e){
			console.error(e)
		}
	})

}
