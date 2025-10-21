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

  // 環境変数チェック
  const webhookUrl = process.env.WEBP_WEBHOOK;
  const baseURL = process.env.BASE_URL;
  if (!webhookUrl) {
    console.error("WEBP_WEBHOOKが設定されていません！");
    return res.status(500).send("サーバー設定エラー: WEBHOOK未設定");
  }
  if (!baseURL) {
    console.error("BASE_URL環境変数が設定されていません。");
    return res.status(500).send("サーバー設定エラー: BASE_URLが未設定です。");
  }

  // 質問内容をURLエンコード
  const encodedQuestion = encodeURIComponent(question);
  const seatmapLink = `${baseURL}/seatmap.html?studentId=${encodeURIComponent(studentId)}&question=${encodedQuestion}`;

  // Teams MessageCard形式で送信
  const message = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    "summary": "新しい挙手",
    "themeColor": "DC143C", // 赤系統でハイライト
    "title": `🔴 挙手通知: ${studentId}`,
    "text": `**学籍番号:** ${studentId}\n**質問:** ${question}`,
    "potentialAction": [
      {
        "@type": "OpenUri",
        "name": "座席表で確認する",
        "targets": [
          {
            "os": "default",
            "uri": seatmapLink
          }
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

    return res.status(200).json({ message: "Sent to Teams with seat link!" });
  } catch (err) {
    console.error("Exception:", err);
    return res.status(500).send("Server error");
  }
}
