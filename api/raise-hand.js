// api/raise-hand.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method not allowed");
    }

    const { studentId, question } = req.body || {};
    if (!studentId || !question) {
        return res.status(400).json({ error: "Missing fields" });
    }

    // --- 1. 挙手データをメモリ版APIに保存 ---
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/hand-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, question }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("hand-data API error:", text);
            return res.status(500).send("Failed to save hand data");
        }
    } catch (err) {
        console.error("Exception saving hand-data:", err);
        return res.status(500).send("Server error");
    }

    // --- 2. Teams通知 ---
    const webhookUrl = process.env.WEBP_WEBHOOK;
    if (!webhookUrl) {
        console.error("WEBHOOK_URL is missing!");
        return res.status(500).send("Server configuration error");
    }

    try {
        const message = {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": "新しい挙手",
            "themeColor": "DC143C",
            "title": `🔴 挙手通知: ${studentId}`,
            "text": `**学籍番号:** ${studentId}\n**質問:** ${question}`,
            "potentialAction": [
                {
                    "@type": "OpenUri",
                    "name": "座席表で確認する",
                    "targets": [
                        {
                            "os": "default",
                            "uri": `${process.env.BASE_URL}/seatmap.html`
                        }
                    ]
                }
            ]
        };

        const resp = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message),
        });

        if (!resp.ok) {
            const text = await resp.text();
            console.error("Teams webhook error:", text);
            return res.status(500).send("Teams webhook failed");
        }

        return res.status(200).json({ message: "Sent to Teams and saved!" });
    } catch (err) {
        console.error("Exception sending Teams:", err);
        return res.status(500).send("Server error");
    }
}
