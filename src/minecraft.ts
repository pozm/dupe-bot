// @ts-ignore
import InventoryViewer = require('mineflayer-web-inventory')
import {getrnd, wait} from "./util";
import {Bot, ChatMessage} from "mineflayer";

enum item {
	diamondB=182
}

export const getDiamonds = (bot:Bot) => bot.inventory.count(item.diamondB,null)
export const waitUntilDiamonds = (bot:Bot,m?:boolean) => new Promise(resolve => {let intr : NodeJS.Timeout = setInterval(()=>{
	let s = ''
	if (getDiamonds(bot) != 0) {
		clearInterval(intr)
		resolve(null)
	} else if (m && !s){
		s = 'Waiting for diamonds...'
		console.log(s)
	}
},1e3) })
const getDiamondsLocations = (bot:Bot) => bot.inventory.items().map(v=>v.type == item.diamondB ? [v.slot,v.count] : 0).filter(v=>Array.isArray(v)) as number[][]

export const sellButOne = (bot:Bot) => {
	bot.chat('/sell diamond_block -1')
}

const DiamondsInHotBar = (bot:Bot) => bot.inventory.findItemRange(36,36+9,item.diamondB,null,true,null)
const dupe = (bot:Bot) => bot.chat('/dupe')
const dupeUntilMax = (bot:Bot) => {
	return new Promise(res=>{
		bot.setQuickBarSlot(bot.quickBarSlot+1)
		let c = setInterval(async ()=>{
			let d = DiamondsInHotBar(bot)
			if (d?.count == d?.stackSize) {
				clearInterval(c)
				res(null)
			}
			else {
				bot.setQuickBarSlot(bot.quickBarSlot-1)
				await dupe(bot)
				bot.setQuickBarSlot(bot.quickBarSlot+1)
			}
		},getrnd(300,600))
	})
}
export const dupeDiamonds = async (bot:Bot) => {
	if ((getDiamonds(bot) > 0) ) {
		let first = getDiamondsLocations(bot)[0][0]
		if (first != 36 && first)
			await bot.moveSlotItem(first,36)
	}
	let dislot = DiamondsInHotBar(bot)?.slot ?? 36
	bot.setQuickBarSlot(dislot - 36)
	await dupeUntilMax(bot)
}

let inta : {[x:string]:boolean} = {}
export function startDuping(bot:Bot) {
	if (!bot)
		return false;
	if (inta[bot.player.uuid])
		return false;
	inta[bot.player.uuid] = true;
	new Promise(async res=>{

		while (inta) {
			if (getDiamonds(bot) > 2 )
				sellButOne(bot)
			await dupeDiamonds(bot)
			sellButOne(bot)
			await wait(getrnd(3e3,7e3))
		}
		res(null)
	})
	return true
}
export function Getbal(bot:Bot) : Promise<string> {
	return new Promise(res=>{
		const handlerli = (msg:ChatMessage)=>{
			let money = msg?.extra?.[1]?.text?.slice?.(1)
			console.log(money)
			if (!money?.startsWith('$'))
				return;
			bot.removeListener('message',handlerli)
			res(money ?? 'unknown')
		}
		bot.on('message',handlerli)
		bot.chat('/bal')

	})
}


function inject(bot:Bot) {
	bot.getChat = (msg:string) : Promise<ChatMessage> => {
		return new Promise((resolve, reject) => {
			let h = (ms2:ChatMessage)=>{
				resolve(ms2)
				bot.removeListener('message',h)
			}
			bot.once('message',h).chat('/'+msg)
			setTimeout(()=>reject('timeout'),4e3)
		})
	}
	bot.getBal = () => {
		return new Promise((res,rej)=>{

			bot.getChat('bal').then(msg=>{
				let money = msg?.extra?.[1]?.text?.slice?.(1)
				if (!money?.match(/^\D[\d,.]*$/gmi))
					return rej('Unable to get');
				res(money)
			},rea=>rej('Unable to get'))
		})
	}
	bot.dupe = {
		start:startDuping.bind(undefined,bot),
		stop:stopDuping.bind(undefined,bot)
	}
}



function stopDuping(bot:Bot) {
	if (!bot)
		return false;
	if (!inta[bot.player.uuid])
		return false;
	inta[bot.player.uuid] = false
	return true
}
export {
	inject as botter
}
