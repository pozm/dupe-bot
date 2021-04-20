import {Bot, BotOptions, Player} from "mineflayer";
import * as mineflayer from "mineflayer";
import {config} from "./config";
import {login, uuidv4, wait} from "./util";
import assert from "assert";
import {bm} from "./index";
import cluster from 'cluster'
import {join} from 'path'
import * as Cluster from "cluster";
export interface message {
	m:string,
	d:{[x:string]:any},
	u:string
	e?:boolean
}

export interface exWorker extends Cluster.Worker {
	execute : <T>(event:string,data:{[x:string]:any}) => Promise<[T,Cluster.Worker]>
}

export class BotManager {
	private _bots : Player[]
	cred : {[x:string]:string[]}
	uuidToWorker : Map<string,number>
	private exit : boolean
	private ingamePlayers : Player[]

	constructor() {
		this._bots = []
		this.cred = {}
		this.uuidToWorker = new Map()
		this.exit = false;
		this.ingamePlayers = []

		cluster.setupMaster({
			silent:true,
			args:['--use', 'http'],
			exec:join(__dirname,'slavehandler.js'),
			serialization:'advanced'
		} as any);

		cluster.on('message',(w,m : message)=>{
			if (m.m.toUpperCase() == 'LOG') {
				console.log(`Message from ${w.id} [${this.PlayerFromUUID(this.uuidFromW(w.id))?.username ?? '??'}]`,m.d)
			}else if (m.m.toUpperCase() == 'ERR') {
				console.log(`error from ${w.id}`,m.d)
			}
			switch (m.m) {

				case '11' : {
					this.relog(this.uuidFromW(w.id))
				} break;
				case '12' : {
					this.relog(this.uuidFromW(w.id))
				} break;


			}

		})
		cluster.on('exit',async (worker, code, signal) => {
			console.log(`worker ${worker.id} has died, ${code} ${signal}`)
			let id = this.uuidFromW(worker.id)
			let cred = this.cred[id]
			this.removeUser(id)
			if (this.exit)
				return;
			let out = await this.login(cred[0],cred[1])
			if (!out)
				return;
			let [play] = out
			this._bots.push(play)
		})
		cluster.on('online',worker => {
			console.log(`new worker online ${worker.id}`);
			worker.once('error',v=>{
				console.log(`worker [${worker.id}] has encountered an error`, v)
			})
		})

	}

	get workers() : exWorker[] {
		return Object.values(cluster.workers).map(v=>{
			if (!Object.getOwnPropertyDescriptor(v,'execute'))
				v = Object.defineProperty(v,'execute',{
					value:this.exec.bind(this,v as Cluster.Worker)
				})
			return v as exWorker;
		})
	}

	get usernames() {
		return this._bots.map(v=>v.username)
	}

	get uuids() {
		return [...this.uuidToWorker.keys()]
	}

	PlayerFromUUID(id:string) {
		return this._bots.filter(v=>v.uuid == id?.toString?.())?.[0]
	}

	uuidFromW(worker:number) : string {
		return [...this.uuidToWorker.entries()].filter(([k,v])=> v == worker)?.[0]?.[0]
	}

	get bots() {
		return this._bots
	}

	get players() : Promise<Player[]> {
		return new Promise(async res=>{

		if (!!this.ingamePlayers.length)
			return res(this.ingamePlayers)
		else {
			let [players] = await this.workers[0].execute<Player[]>('44',{})
			this.ingamePlayers = players;
			setTimeout(()=>this.ingamePlayers = [],10e3)
			return res(players)
		}
		})
	}

	exec<T>(w:Cluster.Worker,ev:string,data:any) : Promise<[T, Cluster.Worker]> {
		return new Promise(res=>{
			let id =uuidv4()
			w.send({m:ev,d:data, u:id})
			const listener = (w:Cluster.Worker,content : message & {d:Player}) => {
				if (content.u != id)
					return;
				else {
					// console.log(content.d)
					res([content.d as any,w])
					cluster.removeListener('message',listener)
				}
			}
			cluster.on('message',listener)
		})

	}

	async AAAAFUCK() {
		let g = 0;
		for (let workeri in Object.values(cluster.workers)) {
			let worker = Object.values(cluster.workers)[workeri]
			g++
			setTimeout(()=>{
				console.log('EXIT',config.interval * Number(workeri))
				worker?.kill()
			},config.interval * Number(workeri))
		}
	}

	get user () : {[x:string]:exWorker} {
		let bots = this._bots
		let uuids = this.uuidToWorker
		let ex = this.exec.bind(this)
		return new Proxy({},{
			get(target: {}, p: string | symbol, receiver: any): any {
				let u =  bots.filter(v=>v.username.toLowerCase() == p.toString().toLowerCase() || v.uuid == p.toString())[0]
				if (u){
					let cl = cluster.workers[uuids.get(u.uuid) ?? 1]
					if (!Object.getOwnPropertyDescriptor(cl,'execute'))
						cl = Object.defineProperty(cl,'execute',{
							value:ex.bind(this,cl as Cluster.Worker)
						})

					return cl;

				}
				else return undefined
			},

		})
	}
	async relog(bot : Player) : Promise<void>
	async relog(uuid: string) : Promise<void>
	async relog(dat : any) {
		console.log('RELOGGING',dat?.uuid ?? dat)
		if ((dat as Player)?.uuid) {
			let uuid = dat.uuid
			let cred=bm.cred[uuid]
			assert(cred,'No credentials found')
			let w = this.getWorker(uuid)
			this.removeUser(uuid)
			let [play] = await this.exec<Player>(w as Cluster.Worker,'relogin',{
				u:cred[0],
				p:cred[1]
			})
			this._bots.push(play)
		} else if (typeof dat == "string") {
			let uuid = dat
			let cred=bm.cred[dat]
			assert(cred,'No credentials found')

			let w = this.getWorker(uuid)
			this.removeUser(uuid)
			let [play] = await this.exec<Player>(w as Cluster.Worker,'relogin',{
				u:cred[0],
				p:cred[1]
			})
			this._bots.push(play)

			// this.user[dat] = await this.adda(cred)
		} else assert(dat,'invalid type')
	}
	getWorker(uuid:string) {
		return cluster.workers[this.uuidToWorker.get(uuid) ?? 1]
	}
	removeUser(uuid:string) {
		this._bots = this._bots.filter(v => v.uuid != uuid)
	}

	login(user:string,pass:string) : Promise<[Player,Cluster.Worker] | undefined> {
		return new Promise(res=>{
			cluster.fork()
			let id = uuidv4()
			cluster.once('online',w=>{
				w.send({
					m:'login',
					d:{
						u:user,
						p:pass,
					},
					u:id
				})
			})
			const listener = (w:Cluster.Worker,content : message & {d:Player}) => {
				if (content.u != id)
					return;
				else if (content.e || !content.d || !content?.d?.uuid) {
					console.log(`ERR logging into [${w.id}] - ${user}`,content.d,content)
					res(undefined)
					cluster.removeListener('message',listener)
				}
				else {
					res([content.d,w])
					// console.log(content.d)
					this.cred[content.d.uuid] = [user,pass]
					cluster.removeListener('message',listener)
				}
			}
			cluster.on('message',listener)
		})
	}

	add([_u, _p] : string[], ix : number) : Promise<Player|undefined> {
		return new Promise((res,reject)=>{

			setTimeout(async ()=>{
				let out = await this.login(_u,_p)
				if (!out)
				{
					return reject(undefined)
				}
				let [Player,Worker] = out
				this.uuidToWorker.set(Player.uuid,Worker.id)
				this._bots.push(Player)
				res(Player)
			},config.interval*ix)
		})
	}
}
