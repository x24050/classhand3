// submit.hand.js
let activeHands = {}; // 学籍番号をキーにして質問内容を保持

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { studentId, question } = req.body || {};
  if (!studentId || !question) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 環境変数チェック
  const webhookUrl = process.env.WEBP_WEBHOOK;
  if (!webhookUrl) {
    console.error("WEBHOOK_URL is missing!");
    return res.status(500).send("Server configuration error");
  }

  // --- メモリ上に保存 & 上書き ---
  activeHands[studentId] = question;

  // 座席表に反映させるURL（固定）
  const baseURL = process.env.BASE_URL;
  if (!baseURL) {
    console.error("BASE_URLが未設定です");
    return res.status(500).send("サーバー設定エラー");
  }

  const seatmapLink = `${baseURL}/seatmap.html`;

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
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Teams webhook error:", text);
      return res.status(500).send("Teams webhook failed");
    }

    return res.status(200).json({ message: "挙手送信完了", activeHands });
  } catch (err) {
    console.error("Exception:", err);
    return res.status(500).send("Server error");
  }
}

// 他ファイルから挙手データを取得できるようにエクスポート
export { activeHands };
