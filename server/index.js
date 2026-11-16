require("dotenv").config();
const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: client ? "live" : "demo", model: process.env.OPENAI_MODEL || "gpt-4.1-mini" });
});

function requireText(value, label, maxLength = 12000) {
  if (typeof value !== "string" || !value.trim()) {
    const error = new Error(`${label} is required.`);
    error.status = 400;
    throw error;
  }
  if (value.length > maxLength) {
    const error = new Error(`${label} must be ${maxLength} characters or fewer.`);
    error.status = 400;
    throw error;
  }
  return value.trim();
}

async function askAI(system, user, options = {}) {
  if (!client) return null;
  const userContent = options.image
    ? [{ type: "text", text: user }, { type: "image_url", image_url: { url: options.image, detail: "high" } }]
    : user;
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    messages: [{ role: "system", content: system }, { role: "user", content: userContent }],
    max_completion_tokens: options.maxTokens || 1800,
    ...(options.json ? { response_format: { type: "json_object" } } : {})
  });
  return completion.choices?.[0]?.message?.content?.trim() || "";
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.post("/api/optimize", asyncRoute(async (req, res) => {
  const prompt = requireText(req.body.prompt, "Prompt", 8000);
  const task = String(req.body.task || "General").slice(0, 80);
  const target = String(req.body.target || "General AI assistant").slice(0, 80);
  const result = await askAI(
    "You are an expert prompt engineer. Improve the user's prompt without changing their underlying goal. Return: 1) the optimized prompt in a clean, copy-ready form; 2) a short explanation of the most important improvements; 3) two optional follow-up constraints. Use clear headings. Do not claim that a prompt guarantees a particular model result.",
    `Task category: ${task}\\nTarget model: ${target}\\n\\nOriginal prompt:\\n${prompt}`,
    { maxTokens: 1400 }
  );
  res.json({
    result: result || `ROLE: Act as a capable ${task.toLowerCase()} assistant.\\n\\nOBJECTIVE:\\n${prompt}\\n\\nCONTEXT:\\nAsk concise clarifying questions if essential information is missing. Do not invent facts.\\n\\nOUTPUT REQUIREMENTS:\\n- Organize the answer with descriptive headings.\\n- State assumptions explicitly.\\n- Provide a concise, actionable result.\\n\\nQUALITY CHECK:\\nReview the response for completeness, accuracy, and alignment with the objective.`,
    mode: client ? "live" : "demo"
  });
}));

app.use((err, _req, res, _next) => {
  const status = Number(err.status) || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status === 500
      ? "The request could not be completed. Check the server logs and API configuration."
      : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Application running at http://localhost:${PORT}`);
  console.log(`AI mode: ${client ? "live" : "demo (add OPENAI_API_KEY to .env)"}`);
});
