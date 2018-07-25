import { Model, Relation } from "objection";
import * as AminoType from "aminoclient/src/AminoTypes";
import * as Knex from "knex";

const knex = Knex({
    client: "pg",
    connection: process.env.PG_CONNECTION_STRING,
    searchPath: ["knex", "public"]
});

Model.knex(knex);

class Message extends Model {
    public static messageId?: string;
    public static threadId?: string;
    public static userId?: string;
    public static content?: string;
    public static createdTime?: string;
    public static mediaType?: number;
    public static mediaValue?: string;
    public static type?: number;

    public static readonly tableName = "threads_messages";
    public static readonly idColumn = "messageId";

    static get relationMappings() {
        return {
            thread: {
                relation: Model.BelongsToOneRelation,
                modelClass: Thread,
                join: {
                    from: "threads_messages.threadId",
                    to: "threads.threadId"
                }
            },
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "threads_messages.userId",
                    to: "users.userId"
                }
            }
        };
    }
}

class Thread extends Model {
    public threadId?: string;
    public title?: string | null;
    public authorId?: string;
    public icon?: string;
    public keywords?: string | null;
    public membersCount?: number;
    public membershipStatus?: number;
    public createdTime?: string;
    public modifiedTime?: string;

    public static readonly tableName = "threads";
    public static readonly idColumn = "threadId";

    static get relationMappings() {
        return {
            messages: {
                relation: Model.HasManyRelation,
                modelClass: Message,
                join: {
                    from: "threads.threadId",
                    to: "threads_messages.threadId"
                }
            }
        };
    }
}

class User extends Model {
    public userId?: string;
    public icon?: string;
    public level?: number;
    public nickname?: string;
    public reputation?: number;
    public role?: number;
    public static readonly tableName = "users";
    public static readonly idColumn = "userId";

    static get relationMappings() {
        return {
            messages: {
                relation: Model.HasManyRelation,
                modelClass: Message,
                join: {
                    from: "users.userId",
                    to: "threads_messages.userId"
                }
            }
        };
    }
}

export default { Thread, Message, User };