import express from "express";
import {bm} from "../index";
import {mcHandle} from "../middleware";
let router = express.Router()

router.get('/test',(req,res)=>{
	res.send('OK')
})
//
router.get('/money',mcHandle(async ({user}, req, res,r)=>{
	await user.getBal().then(mon=>{
		r({data:mon})
	},res=>r({err:8,msg:res}))
}))
router.get('/players',async (req,res)=>{
	res.send(bm.players)
})
router.post('/tp',mcHandle(async ({user,target}, req, res,r)=>{
	user.chat(`/tpa ${target?.username}`)
},{target:2}))
//
router.post('/deposit',mcHandle(async ({user,target}, req, res,r)=>{
	let money = await user.getBal().catch(res=>r({err:8,msg:res})) as string
	if (!money)
		r({err:8,msg:'Unable to get'})
	let mon = parseInt(money?.replace?.(/\D+/gmi,''))
	if (target) {
		user.chat(`/pay ${target.username} ${mon}`)
	} else {
		user.chat(`/f money d ${mon}`)
	}
	r({data:mon})
},{target:1}))
router.post('/chat',mcHandle(async ({user}, req, res,r)=>{
	let {msg} = req.body
	if (!msg)
		return res.status(400).json({err:3,msg:'invalid body'})
	user.chat(`/${msg}`)
}))
router.post('/start',mcHandle(async ({user}, req, res,r)=>{
	r({data:user.dupe.start()})
}))
router.post('/stop',mcHandle(async ({user}, req, res,r)=>{
	r({data:user.dupe.stop()})
}))
router.post('/kill',(req,res)=>{
	res.send('OK')
	bm.exit()
})
export default router
