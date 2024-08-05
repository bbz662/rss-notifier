import { RssFeedChecker } from "./jobs/RssFeedChecker";
import { FeedManager } from "./FeedManager";

export interface Env {
    DB: D1Database;
    DISCORD_WEBHOOK: string;
}

export default {
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        try {
            const rssFeedChecker = new RssFeedChecker(env);
            await rssFeedChecker.perform();
            console.log("Scheduled RSS check completed successfully");
        } catch (error) {
            console.error("Error in scheduled RSS check:", error);
        }
    },

    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);
        const feedManager = new FeedManager(env.DB);

        try {
            if (url.pathname === "/add-feed" && request.method === "POST") {
                const { feedUrl } = await request.json();
                const feedInfo = await this.validateAndParseFeed(feedUrl);
                const result = await feedManager.addFeed(feedInfo);

                if (result.success) {
                    return new Response(JSON.stringify(result), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    return new Response(JSON.stringify(result), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }

            if (url.pathname === "/list-feeds" && request.method === "GET") {
                const feeds = await feedManager.listFeeds();
                return new Response(JSON.stringify(feeds), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (url.pathname === "/feed-check" && request.method === "GET") {
                const rssFeedChecker = new RssFeedChecker(env);
                await rssFeedChecker.perform();
                return new Response("Scheduled RSS check completed successfully", {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            }

            return new Response("Not Found", { status: 404 });
        } catch (error) {
            console.error("Error processing request:", error);
            return new Response("Internal Server Error", { status: 500 });
        }
    },

    async validateAndParseFeed(feedUrl: string) {
        try {
            const response = await fetch(feedUrl);
            const text = await response.text();

            const titleMatch = text.match(/<title>(.*?)<\/title>/);
            const descriptionMatch = text.match(/<description>(.*?)<\/description>/);

            return {
                url: feedUrl,
                title: titleMatch ? titleMatch[1] : 'Untitled Feed',
                description: descriptionMatch ? descriptionMatch[1] : ''
            };
        } catch (error) {
            throw new Error(`Invalid RSS feed: ${error}`);
        }
    },

    extractTag(content: string, tagName: string) {
        const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
        const match = content.match(regex);
        return match ? match[1].trim() : '';
    }
};
