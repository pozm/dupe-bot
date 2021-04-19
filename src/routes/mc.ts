import express from "express";
import {startDuping, stopDuping} from "../minecraft";
import {bm} from "../index";
import {mcTarget, mcUser} from "../middleware";
import {exWorker} from "../classes";
let router = express.Router()

router.get('/test',(req,res)=>{
	res.send('OK')
})

router.get('/money',async (req,res)=>{
	let bot = bm.user[req.header('user') ?? '']
	let [m] = await bot.execute<string>('75',{})
	res.send(m)
})
router.get('/players',async (req,res)=>{
	res.send(await bm.players)
})
router.post('/tp',mcTarget,mcUser,async (req,res)=>{
	let worker = res.locals.worker as exWorker
	if ('wa' in res.locals) {
		for (let w of res.locals.wa) {
			await w.execute('45',{t:res.locals.target.username})
		}
	} else
		await worker.execute('45',{t:res.locals.target.username})
	return res.send(true)
})

router.post('/deposit',mcUser,async (req,res)=>{
	let worker = res.locals.worker as exWorker
	if ('wa' in res.locals) {
		for (let w of res.locals.wa) {
			await w.execute('51',{})
		}
	} else
		await worker.execute('51',{})
	return res.send(true)
})

router.post('/chat',mcUser,async (req,res)=>{
	let worker = res.locals.worker as exWorker
	let {msg} = req.body
	if (!msg)
		return res.status(400).json({err:3,msg:'invalid body'})
	if ('wa' in res.locals) {
		for (let w of res.locals.wa) {
			await w.execute('172',{m:msg})
		}
	} else
		await worker.execute('172',{m:msg})
	return res.send(true)
})

router.post('/kill',async (req,res)=>{
	await bm.AAAAFUCK()
	process.exit()
	return res.send(true)
})

router.post('/start',async (req,res)=>{
	let bot = bm.user[req.header('user') ?? '']
	// console.log(bot)
	let out = await bot.execute('76',{})
	// let [suc] = bot.execute('76',{})
	console.log(!out)
	res.send(!!out)
})
router.post('/stop',async (req,res)=>{
	let bot = bm.user[req.header('user') ?? '']
	let [suc] = await bot.execute('77',{})
	res.send(!!suc)
})

export default router
