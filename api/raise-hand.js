let activeHands = []; // サーバー起動中のみ有効（メモリ）

export default async function handler(req, res) {
  const webhookUrl = process.env.WEBP_WEBHOOK;
  if (!webhookUrl) return res.status(500).send("Server configuration error");

  if (req.method === "POST") {
    const { studentId, question } = req.body || {};
    if (!studentId || !question) return res.status(400).json({ error: "Missing fields" });

    // 同じ studentId があれば上書き、なければ追加
    const existing = activeHands.find(h => h.studentId === studentId);
    if (existing) {
      existing.question = question;
      existing.updatedAt = new Date();
    } else {
      activeHands.push({ studentId, question, createdAt: new Date() });
    }

    // Teams送信
    const baseURL = process.env.BASE_URL || "https://classhand3.vercel.app";
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
          "targets": [{ "os": "default", "uri": `${baseURL}/seatmap.html` }]
        }
      ]
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("Teams webhook error:", text);
      }
    } catch (err) {
      console.error("Teams webhook exception:", err);
    }

    return res.status(200).json({ message: "挙手保存済み", activeHands });
  }

  if (req.method === "GET") {
    return res.status(200).json(activeHands);
  }

  if (req.method === "DELETE") {
    const { studentId } = req.body || {};
    if (!studentId) return res.status(400).json({ error: "Missing studentId" });
    activeHands = activeHands.filter(h => h.studentId !== studentId);
    return res.status(200).json({ message: "対応済みに設定しました", activeHands });
  }

  return res.status(405).send("Method not allowed");
}
