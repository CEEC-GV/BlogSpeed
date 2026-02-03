import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "LOADED" : "MISSING");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function test() {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: "Generate an SEO title for current events blog",
      },
    ],
  });

  console.log(response.choices[0].message.content);
}

test();
