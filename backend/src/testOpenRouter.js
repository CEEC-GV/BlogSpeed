import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

async function test() {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "google/gemini-3-flash-preview",
      max_tokens: 600,   // 🔥 THIS FIXES EVERYTHING
      messages: [
        {
          role: "user",
          content: "Generate an SEO title for current events blog",
        }
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "SEO AI Blog Generator",
      },
    }
  );

  console.log(response.data.choices[0].message.content);
}

test();
