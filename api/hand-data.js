// api/hand-data.js

// メモリ上に挙手データを保持
// { studentId: question }
let handData = {};

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            // 現在の全挙手データを返す
            res.status(200).json(handData);
            break;

        case 'POST':
            // 挙手追加 or 上書き
            const { studentId, question } = req.body || {};
            if (!studentId || !question) {
                return res.status(400).json({ error: "Missing studentId or question" });
            }
            handData[studentId] = question;
            res.status(200).json({ message: "Hand updated", handData });
            break;

        case 'DELETE':
            // 挙手解除
            const { studentId: delId } = req.body || {};
            if (!delId) {
                return res.status(400).json({ error: "Missing studentId" });
            }
            delete handData[delId];
            res.status(200).json({ message: "Hand cleared", handData });
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
