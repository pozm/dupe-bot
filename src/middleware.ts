import {NextFunction, Request, Response} from "express";
import {bm} from "./index";
import {Player} from "mineflayer";

export function mcUser( req:Request,res:Response,next:NextFunction ) {
	let n = req.header('user') ?? ''
	let w = bm.user[n]
	let Botter : Player | Player[]
	switch (n) {
		case 'all' : {
			Botter = []
			for (let worker of bm.workers) {
				Botter.push( bm.PlayerFromUUID (bm.uuidFromW(worker.id)))
			}
			res.locals.wa =bm.workers
		} break;
		default : {

			Botter = bm.PlayerFromUUID (bm.uuidFromW(w.id))
			if (!bm.usernames.includes(Botter.username))
				return res.status(400).json({err:1,msg:'Bot not found'})
		} break;

	}
	res.locals.bot = Botter;
	res.locals.worker = w;
	next()
}
export async function mcTarget( req:Request,res:Response,next:NextFunction ) {

	let n = req.header('target') ?? ''
	let playersObj = (await bm.players)
	let players = Object.values(playersObj).filter(v=>v.username)
	console.log(players)
	if (!players.map(v=>v.username).includes(n)) {
		return res.status(400).json({err:2,msg:'target not found'})
	}
	res.locals.target = players.filter(v=>v.username==n)[0]
	next()


}
