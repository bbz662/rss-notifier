export class DiscordNotifier {
    constructor(private webhookUrl: string) { }

    async perform(payload: { title: string, link: string }) {
        const { title, link } = payload;

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `New Article: ${title}\n${link}` })
            });

            if (!response.ok) {
                throw new Error(`Discord API responded with status ${response.status}`);
            }
            console.log(`Notification sent: ${title}`);
        } catch (error) {
            console.error("Error sending notification to Discord:", error);
            throw error;
        }
    }
}
