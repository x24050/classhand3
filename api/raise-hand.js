// api/raise-hand.js
let handData = {}; // メモリ上保持: studentId -> {question, resolved}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { studentId, question } = req.body || {};
  if (!studentId || !question) return res.status(400).json({ error: "Missing fields" });

  // 同じ学籍番号は上書き
  handData[studentId] = { question, resolved: false };

  // Teams通知
  const baseUrl = "https://classhand3.vercel.app/";
  const webhookUrl = process.env.WEBP_WEBHOOK;
  if (!baseUrl || !webhookUrl) return res.status(500).send("Server設定エラー");

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
        "targets": [{ "os": "default", "uri": `${baseUrl.replace(/\/$/, '')}/seatmap.html` }]
      }
    ]
  };

  try {
    // 標準 fetch を使用
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    if (!response.ok) return res.status(500).send("Teams webhook失敗");

    return res.status(200).json({ message: "挙手送信成功!", handData });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};

// メモリ取得用
module.exports.getHandData = () => handData;
