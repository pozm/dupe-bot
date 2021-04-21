import express, {json} from 'express'
import {readdirSync} from "fs";
import {join} from 'path'

export const app = express()


app.use(json({

}))

for (let file of readdirSync(join(__dirname,'routes'))) {
	let f = join(__dirname,'routes',file.toString())
	let fn = f.slice(-3)
	if (fn != '.js')
		continue;
	let r = require(f).default
	app.use('/'+file.slice(0,-3),r)
}
