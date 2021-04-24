import {ChatMessage} from "mineflayer";

interface duper {
    start : () => boolean
    stop : () => boolean
}

declare module "mineflayer" {

    interface Bot {
        getChat : (msg:string) => Promise<ChatMessage>
        getBal : () => Promise<string>
        dupe : duper
    }
}
