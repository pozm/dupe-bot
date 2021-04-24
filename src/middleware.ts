import {NextFunction, Request, Response} from "express";
import {bm} from "./index";
import {Bot, Player} from "mineflayer";

enum usert  {
	all,
	multi,
	single
}


export async function mcTarget( req:Request,res:Response,next:NextFunction ) {

	let n = req.header('target') ?? ''
	let playersObj = (bm.players)
	let players = Object.values(playersObj).filter(v=>v.username)
	console.log(players)
	if (!players.map(v=>v.username.toLowerCase()).includes(n.toLowerCase())) {
		return res.status(400).json({err:2,msg:'target not found'})
	}
	res.locals.target = players.filter(v=>v.username==n)[0]
	next()

}
interface mchOpts {
	target:0|1|2
}
interface extra {
	user:Bot,
	target:Player|undefined
}
export function mcHandle(fn:(extra: extra,req:Request,res:Response,resr:(out:any)=>void)=>void,options?:mchOpts) {
	return async function(req:Request,res:Response) {
		let usern =  req.header('user') ?? ''
		let targetn = req.header('target') ?? ''

		let usere : usert = usert.single

		if (usern.toLowerCase() === 'all')
			usere = usert.all;
		else if (usern.split(',').length >= 2)
			usere = usert.multi;


		let user : Bot | Bot[] | undefined

		switch (usere) {
			case usert.all : {

				user = bm.all

			} break;
			case usert.multi : {
				let them = usern.split(',').map(v=>v.trim()).filter(v=>v)
				let botter = []
				for (let u of them) {
					let bot = bm.user[u]
					if (bot)
						botter.push(bot)
				}
				user = botter
			} break;
			case usert.single : {

				let bot = bm.user[usern.toString().replace(/,/gmi,'')]
				if (bot)
					user = bot;

			} break;
			default: {
				user = undefined;
			}
		}

		if (!user || (Array.isArray(user) && !user.length ) ) {
			return res.json({err:5,msg:'no user found'})
		}
		let target : Player | undefined = undefined

		if (options?.target) {
			let t = Object.values(bm.players).filter(v=>v.username.toLowerCase()==targetn.toLowerCase())?.[0]
			if (t)
				target = t;
		}
		if (options?.target == 2 && !target) {
			return res.json({err:6,msg:'no target found'})
		}
		let out: any[]=[]
		function resr(u:string,outter: { [x:string]:any }) {
			out.push({...outter,__u:u})
		}

		if (Array.isArray(user)) {
			for (let u of user) {
				await fn({user:u,target},req,res,resr.bind({out},u.player.username))
			}
		} else {
			await fn({user,target},req,res,resr.bind({out},user.player.username))
		}

		res.json(out)

	}
}
