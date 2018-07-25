import AminoClient from "aminoclient";
import Schema from "./Schema";
import Thread from "./Thread";
import delay from "./delay";


class Community {
    public ndcId: number;
    private threads: Map<string, Thread> = new Map();
    constructor(ndcId: number) {
        this.ndcId = ndcId;

        // Call update one time to start it
        this.update();
    }

    private async update() {
        // Crawl all da things!

        const threads = await AminoClient.getPublicChats(this.ndcId, 0, 100);
        // Populate threads
        for (const thread of threads) {
            if (thread.uid !== "None") {
                // console.log(thread.author);
                // await Mongo.registerThread(thread);

                const transposeThread = {
                    threadId: thread.threadId,
                    title: thread.title,
                    authorId: thread.author.uid,
                    icon: thread.icon,
                    keywords: thread.keywords,
                    membersCount: thread.membersCount,
                    membershipStatus: thread.membershipStatus,
                    createdTime: thread.createdTime,
                    modifiedTime: thread.modifiedTime
                };

                const transposeAuthor = {
                    userId: thread.author.uid,
                    icon: thread.author.icon,
                    level: thread.author.level,
                    nickname: thread.author.nickname,
                    reputation: thread.author.reputation,
                    role: thread.author.role
                };

                // DB -> thread author
                if (typeof await Schema.User.query().findById(transposeAuthor.userId) === "undefined")
                    await Schema.User.query().insert(transposeAuthor);
                else
                    await Schema.User.query().patch(transposeAuthor).where("userId", thread.author.uid);

                // DB -> thread
                if (typeof await Schema.Thread.query().findById(thread.threadId) === "undefined")
                    await Schema.Thread.query().insert(transposeThread);
                else
                    await Schema.Thread.query().patch(transposeThread).where("threadId", thread.threadId);

                if (!this.threads.has(thread.threadId))
                    this.threads.set(thread.threadId, new Thread(this, thread));
            }
        }
        // ToDo: Check death threads

        // Wait a little bit and call yourself when done
        await delay(2000);
        await this.update();
    }
}
export default Community;