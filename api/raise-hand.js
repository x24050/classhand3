let hands = []; // メモリ上で管理

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { studentId, question } = req.body || {};
  if (!studentId || !question) return res.status(400).json({ error: "Missing fields" });

  // 挙手データを追加
  hands.push({ studentId, question, resolved: false });

  // ここで Teams 送信
  const webhookUrl = process.env.WEBP_WEBHOOK;
  if (!webhookUrl) return res.status(500).send("Server configuration error");

  const baseURL = process.env.BASE_URL || "https://classhand3.vercel.app/";

  const seatmapLink = `${baseURL}/seatmap.html?studentId=${studentId}&question=${encodeURIComponent(question)}`;

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
        "targets": [{ "os": "default", "uri": seatmapLink }]
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
      return res.status(500).send("Teams webhook failed");
    }

    res.status(200).json({ message: "Sent to Teams!" });
  } catch (err) {
    console.error("Exception:", err);
    res.status(500).send("Server error");
  }
}

// 他の API からも同じ hands にアクセスできるようエクスポート
export { hands };
