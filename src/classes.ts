import {Bot} from "mineflayer";
import {config} from "./config";
import {login, newBot} from "./util";

export class botManager {
	private bots : Set<Bot>
	private cred : Map<string,string[]>
	constructor() {
		this.bots = new Set<Bot>()
		this.cred = new Map()
	}

	protected getByName(n:string) : Bot | undefined {
		return [...this.bots].filter(v=>v.player.username.toLowerCase() == n.toLowerCase())?.[0] ?? undefined
	}

	get players() {
		return [...this.bots][0].players
	}
	get all() {
		return [...this.bots]
	}

	get user() : {[x:string]:Bot} {
		const getn = this.getByName.bind(this)
		return new Proxy({},{
			get(target: {}, p: string | symbol, receiver: any): any {
				let n = getn(p.toString())
				if (n) {
					return n
				}
				else return undefined
			}
		})
	}
	exit() {
		return (async()=>{
			for (let boti in this.all) {
				let bot = this.all[boti]
				await new Promise(res=>{
					setTimeout(()=>{
						bot.quit()
						res(undefined)
					},config.interval * Number(boti))
				})
			}
			process.exit(811)
		})()
	}

	remove(bot:Bot) {
		let cred = this.cred.get(bot.player.uuid)
		bot.quit()
		this.bots.delete(bot)
		return cred
	}
	add([u,p]:string[],inx:number=0) : Promise<Bot> {
		return new Promise((res,rej)=>{
			setTimeout(()=>{
				login( u,p).then(botter=>{
					this.bots.add(botter)
					this.cred.set(botter?.player?.uuid,[u,p])
					newBot(botter)
					res(botter)
				},rej)
			},config.interval*inx)
		})
	}
}
