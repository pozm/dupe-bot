import {isWorker, worker} from "cluster";
import {login} from "./util";
import {message} from "./classes";
import {Bot} from "mineflayer";
import {Getbal, startDuping, stopDuping} from "./minecraft";

let Bot : Bot;

const old = console.log

function newBot() {
	Bot.on('game',()=>{
		Bot.once('respawn',()=>{
			Bot.chat('/join slupe')
		})
	})
	Bot.on('kicked',()=>{
		console.log('kicked')
		process?.send?.({
			m:'12',
			d:{}
		})
	})
	Bot.on('entityHurt',()=>{
		Bot.chat('/sell inventory')
	})
	Bot.on('death',()=>{
		console.log('I have died, stopping duping to prevent further damage.')
		stopDuping(Bot)
	})
	// Bot.on('spawnReset',()=>{
	// 	console.log('ses end')
	// })

	setInterval(()=>{
		// old(Bot)
		// if (!) {
		// 	console.log('HB failed.')
		// }
	},1e3)


	stopDuping(Bot);
	setTimeout(()=>{
		startDuping(Bot);

	},5e3)
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
					},rej=>{
						process?.send?.({
							m:'login',
							u:content.u,
							d: rej,
							e:true
						})
					})

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


					},rej=>{
						process?.send?.({
							m:'login',
							u:content.u,
							d: rej,
							e:true
						})
					})
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
				case '102' :{
					try {
						let out = Function(content.d.s)(Bot)
						process?.send?.({
							m:content.m,
							u:content.u,
							d:out
						})
					} catch (e) {
						process?.send?.({
							m:content.m,
							u:content.u,
							d:e
						})
					}
				} break;
			}

		} catch (e){
			console.error(e)
		}
	})
	process.on('unhandledRejection',(r,prom)=>{
		console.error(r)
	})
	process.on('uncaughtException',(err)=>{
		console.error(err)
		process.exit()
	})

	process.on('SIGINT', () => {

	}); // should only exit when told to


}
