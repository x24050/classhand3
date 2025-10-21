// api/raise-hand.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { studentId, question } = req.body || {};
  if (!studentId || !question) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // BASE_URLチェック
  const baseUrl = https://classhand3.vercel.app/;
  if (!baseUrl) {
    console.error("BASE_URL is未設定!");
    return res.status(500).send("サーバー設定エラー: BASE_URLが未設定です。");
  }

  // hand-data API URL生成
  const handApiUrl = `${baseUrl.replace(/\/$/, '')}/api/hand-data`;

  try {
    // 挙手データを保存
    const saveResponse = await fetch(handApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, question }),
    });

    if (!saveResponse.ok) {
      const text = await saveResponse.text();
      console.error("hand-data保存エラー:", text);
      return res.status(500).send("挙手データ保存失敗");
    }

    // Teams 送信用
    const webhookUrl = process.env.WEBP_WEBHOOK;
    if (!webhookUrl) {
      console.error("WEBHOOK_URL is missing!");
      return res.status(500).send("Server configuration error");
    }

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
            { "os": "default", "uri": `${baseUrl.replace(/\/$/, '')}/seatmap.html` }
          ]
        }
      ]
    };

    const teamsResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!teamsResponse.ok) {
      const text = await teams
