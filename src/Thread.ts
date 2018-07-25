import AminoClient from "aminoclient";
import * as moment from "moment";
import Schema from "./Schema";
import * as AminoType from "aminoclient/src/AminoTypes";
import Community from "./Community";
import delay from "./delay";


class Thread {
    private community: Community;
    private threadInfo: AminoType.IAminoThread;
    private resolveFullBackstory: boolean = false;
    constructor(community: Community, threadInfo: AminoType.IAminoThread) {
        this.community = community;
        this.threadInfo = threadInfo;

        // if (this.resolveFullBackstory)
        //     this.inverseUpdate();
        this.update();
    }

    private async update() {
        // Crawl all da things!
        const thread = await AminoClient.getThreadMessages(this.community.ndcId, this.threadInfo.threadId, 0, 100);

        // DB -> msgs
        for (const msg of thread) {
            const transposeAuthor = {
                userId: msg.author.uid,
                icon: msg.author.icon,
                level: msg.author.level,
                nickname: msg.author.nickname,
                reputation: msg.author.reputation,
                role: msg.author.role
            };

            // DB -> thread author
            if (typeof await Schema.User.query().findById(transposeAuthor.userId) === "undefined")
                await Schema.User.query().insert(transposeAuthor);

            // DB -> message
            if (typeof await Schema.Message.query().findById(msg.messageId) !== "object")
                await Schema.Message.query().whereNotExists({
                    messageId: msg.messageId
                } as any).insert({
                    messageId: msg.messageId,
                    threadId: msg.threadId,
                    userId: msg.author.uid,
                    content: msg.content,
                    createdTime: msg.createdTime,
                    mediaType: msg.mediaType,
                    mediaValue: msg.mediaValue,
                    type: msg.type
                } as any);
        }
        // Wait a little bit and call yourself when done
        await delay(2000);
        await this.update();
    }

    private increment = 0;
    private time = escape(moment().toISOString().slice(0, -5) + "Z");
    private async inverseUpdate() {
        try {
            console.log("Solving backstory... increment " + this.increment);

            const range = 100;

            const thread = await AminoClient.getThreadMessages(this.community.ndcId, this.threadInfo.threadId, this.increment, range, this.time);
            // await Mongo.registerMessages(this.threadInfo.threadId, thread);
            // DB -> msgs

            for (const msg of thread) {
                const transposeAuthor = {
                    userId: msg.author.uid,
                    icon: msg.author.icon,
                    level: msg.author.level,
                    nickname: msg.author.nickname,
                    reputation: msg.author.reputation,
                    role: msg.author.role
                };

                console.log(msg);
                // DB -> thread author
                if (typeof await Schema.User.query().findById(transposeAuthor.userId) === "undefined")
                    await Schema.User.query().insert(transposeAuthor);
                else
                    await Schema.User.query().patch(transposeAuthor).where("userId", msg.author.uid);

                // DB -> message
                if (typeof await Schema.Message.query().findById(msg.messageId) !== "object")
                    await Schema.Message.query().whereNotExists({
                        messageId: msg.messageId
                    } as any).insert({
                        messageId: msg.messageId,
                        threadId: msg.threadId,
                        userId: msg.author.uid,
                        content: msg.content,
                        createdTime: msg.createdTime,
                        mediaType: msg.mediaType,
                        mediaValue: msg.mediaValue,
                        type: msg.type
                    } as any);
            }

            this.increment += range;
            // Wait a little bit and call yourself when done

            await delay(100); // Small delay, we have a lot of queries to do, lets do it as quick as posible
            await this.inverseUpdate();
        } catch (e) {
            console.log(e);
            console.log(`Hit an error, asume we are done, last increment ${this.increment} for ${this.threadInfo.threadId} with time ${this.time}`);
        }
    }
}
export default Thread;