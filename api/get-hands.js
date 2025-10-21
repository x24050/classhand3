// メモリ上の挙手データ
let hands = [];

export default function handler(req, res) {
  res.status(200).json(hands);
}
