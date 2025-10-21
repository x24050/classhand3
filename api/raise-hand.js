// api/raise-hand.js

export default async function handler(req, res) {
  // メソッドチェック
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // ボディ取得
  const { studentId, question } = req.body || {};
  if (!studentId || !question) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // BASE_URL 環境変数（未設定の場合は暫定値）
  const baseURL = process.env.BASE_URL || "https://classhand3.vercel.app";
  if (!process.env.BASE_URL) {
    console.warn("⚠ BASE_URL が未設定です。暫定値を使用します:", baseURL);
  }

  const seatmapLink = `${baseURL}/seatmap.html?studentId=${encodeURIComponent(studentId)}&question=${encodeURIComponent(question)}`;

  // Webhook URL
  const webhookUrl = process.env.WEBP_WEBHOOK;
  if (!webhookUrl) {
    console.error("WEBP_WEBHOOK が未設定です!");
    return res.status(500).send("Server configuration error");
  }

  // Teams 送信メッセージ作成
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
          { "os": "default", "uri": seatmapLink }
        ]
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

    return res.status(200).json({ message: "Sent to Teams!", seatmapLink });
  } catch (err) {
    console.error("Exception:", err);
    return res.status(500).send("Server error");
  }
}
