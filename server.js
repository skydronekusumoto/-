const express = require("express");
const OpenAI = require("openai");

const app = express();
const port = 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set.");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `あなたは日本料理スクールの受付AIです。

# 出力ルール（最重要）
必ずJSON形式で返答：

① AI対応
{
  "type": "ai",
  "message": "返信文"
}

② 人間対応
{
  "type": "human",
  "message": "スタッフが対応いたします。少々お待ちください。"
}

※JSON以外は禁止

---

# スクール情報
・初心者歓迎
・和食（出汁・寿司・天ぷら）
・大阪開催
・体験レッスン：5,000円

---

# ルール
・丁寧で親しみやすい
・2〜4文で簡潔
・最後は予約導線

---

# HUMAN条件
・アレルギー
・日程調整
・キャンセル
・クレーム
・不明点`;

function parseModelJson(text) {
  const trimmed = (text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch (_e) {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) {
      return JSON.parse(fenced[1].trim());
    }
    const firstObj = trimmed.match(/\{[\s\S]*\}/);
    if (firstObj) {
      return JSON.parse(firstObj[0]);
    }
    throw new Error("Invalid JSON from model");
  }
}

app.use(express.json());
app.use(express.static("public"));

app.post("/chat", async (req, res) => {
  const userMessage = req.body?.message;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({
      ok: false,
      error: "message is required",
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const parsed = parseModelJson(raw);

    const type = parsed?.type === "human" ? "human" : "ai";
    const message =
      typeof parsed?.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : type === "human"
          ? "スタッフが対応いたします。少々お待ちください。"
          : "お問い合わせありがとうございます。詳細を確認し、最適なレッスンをご案内します。まずはご希望日をお知らせください。";

    return res.json({
      ok: true,
      type,
      message,
      human: type === "human",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      type: "human",
      message: "スタッフが対応いたします。少々お待ちください。",
      human: true,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
