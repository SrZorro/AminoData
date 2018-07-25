exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable("threads", table => {
            table.uuid("threadId").unique().primary()
            table.string("title").nullable()
            table.uuid("authorId").references("users.userId").notNullable()
            table.string("icon").notNullable()
            table.string("keywords").nullable()
            table.integer("membersCount").notNullable()
            table.integer("membershipStatus").notNullable()
            table.date("createdTime").notNullable()
            table.date("modifiedTime").notNullable()
        }),
        knex.schema.createTable("threads_baned_users", table => {
            table.uuid("threadId").references("threads.threadId").notNullable()
            table.uuid("userId").references("users.userId").notNullable()
        }),
        knex.schema.createTable("threads_messages", table => {
            table.string("messageId").unique().primary()
            table.uuid("threadId").references("threads.threadId").notNullable()
            table.uuid("userId").references("users.userId").notNullable()
            table.text("content").nullable()
            table.dateTime("createdTime").notNullable()
            table.integer("mediaType").notNullable()
            table.string("mediaValue").nullable()
            table.integer("type").notNullable()
        }),
        knex.schema.createTable("users", table => {
            table.uuid("userId").unique().primary()
            table.string("icon")
            table.integer("level")
            table.string("nickname")
            table.integer("reputation")
            table.integer("role")
        })
    ])
}

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable("threads_baned_users"),
        knex.schema.dropTable("threads_messages"),
        knex.schema.dropTable("threads"),
        knex.schema.dropTable("users")
    ])
}