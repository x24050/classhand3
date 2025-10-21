// api/hand-data.js
const raiseHand = require('./raise-hand');

module.exports = function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");
  res.status(200).json(raiseHand.getHandData());
};
