import { hands } from "./raise-hand";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { studentId } = req.body;
  if (!studentId) return res.status(400).json({ error: "Missing studentId" });

  const hand = hands.find(h => h.studentId === studentId && !h.resolved);
  if (hand) hand.resolved = true;

  res.status(200).json({ message: "Resolved!" });
}
