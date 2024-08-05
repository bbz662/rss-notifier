export class FeedManager {
    constructor(private db: D1Database) { }

    async addFeed(feedInfo: { url: string, title: string, description: string }) {
        const existing = await this.db.prepare("SELECT id FROM feeds WHERE url = ?")
            .bind(feedInfo.url)
            .first();

        if (existing) {
            return { success: false, error: "Feed already exists" };
        }
        const result = await this.db.prepare("INSERT INTO feeds (url, title, description, last_check) VALUES (?, ?, ?, ?)")
            .bind(feedInfo.url, feedInfo.title, feedInfo.description, new Date().toISOString())
            .run();

        if (result.success) {
            return { success: true, id: result.lastInsertRowid, ...feedInfo };
        } else {
            return { success: false, error: "Failed to add feed" };
        }
    }

    async listFeeds() {
        return await this.db.prepare("SELECT * FROM feeds").all();
    }
}
