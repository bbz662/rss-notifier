import { DiscordNotifier } from './DiscordNotifier';
import { Env } from '../index';

export class RssFeedChecker {
    constructor(private env: Env) { }

    async perform() {
        const feeds = await this.env.DB.prepare("SELECT * FROM feeds").all();

        for (const feed of feeds.results) {
            try {
                const rss = await this.fetchAndParseRSS(feed.url);

                for (const item of rss.items) {
                    const exists = await this.env.DB.prepare("SELECT COUNT(*) as count FROM items WHERE feed_id = ? AND guid = ?")
                        .bind(feed.id, item.guid)
                        .first();

                    if (exists.count === 0) {
                        try {
                            await this.env.DB.prepare("INSERT INTO items (feed_id, guid, title, link, pub_date) VALUES (?, ?, ?, ?, ?)")
                                .bind(feed.id, item.guid, item.title, item.link, item.pubDate)
                                .run();

                            const discordNotifier = new DiscordNotifier(this.env.DISCORD_WEBHOOK);
                            await discordNotifier.perform({ title: item.title, link: item.link });
                            console.log(`New item notified: ${item.title}`);
                        } catch (insertError) {
                            if (!(insertError instanceof Error) || !insertError.message.includes('UNIQUE constraint failed')) {
                                console.error(`Error inserting item: ${insertError}`);
                            }
                        }
                    }
                }

                await this.env.DB.prepare("UPDATE feeds SET last_check = ? WHERE id = ?")
                    .bind(new Date().toISOString(), feed.id)
                    .run();
            } catch (error) {
                console.error(`Error processing feed ${feed.url}:`, error);
            }
        }
    }

    async fetchAndParseRSS(url) {
        const response = await fetch(url);
        const text = await response.text();

        const channelRegex = /<channel>([\s\S]*?)<\/channel>/;
        const channelMatch = text.match(channelRegex);
        const channelContent = channelMatch ? channelMatch[1] : '';

        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const items = [];
        let itemMatch;
        while ((itemMatch = itemRegex.exec(text)) !== null) {
            items.push(itemMatch[1]);
        }

        return {
            title: this.extractTag(channelContent, 'title'),
            description: this.extractTag(channelContent, 'description'),
            link: this.extractTag(channelContent, 'link'),
            items: items.map(item => ({
                title: this.extractTag(item, 'title'),
                link: this.extractTag(item, 'link'),
                description: this.extractTag(item, 'description'),
                pubDate: this.extractTag(item, 'pubDate'),
                guid: this.extractTag(item, 'guid') || this.extractTag(item, 'link'),
            }))
        };
    }

    extractTag(content, tagName) {
        const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
        const match = content.match(regex);
        return match ? match[1].trim() : '';
    }
}
