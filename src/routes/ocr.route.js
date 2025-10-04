const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const sharp = require("sharp");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

// Initialize Gemini client with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    const { url, language = "eng", isOverlayRequired = false } = req.body;

    if (!req.file && !url) {
      return res.status(400).json({ error: "No image file or URL provided." });
    }

    // Step 1: Perform OCR via ocr.space
    const ocrForm = new FormData();
    if (req.file) {
      const processedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 1024 })
        .toBuffer();
      ocrForm.append("file", processedImageBuffer, req.file.originalname);
    } else {
      ocrForm.append("url", url);
    }

    ocrForm.append("language", language);
    ocrForm.append("isOverlayRequired", isOverlayRequired.toString());

    const ocrResponse = await axios.post(
      "https://api.ocr.space/parse/image",
      ocrForm,
      {
        headers: {
          ...ocrForm.getHeaders(),
          apikey: process.env.OCR_SPACE_API_KEY,
        },
      }
    );

    const ocrText = ocrResponse.data?.ParsedResults?.[0]?.ParsedText;
    if (!ocrText || ocrText.trim().length === 0) {
      return res.status(400).json({ error: "OCR failed or returned no text." });
    }

    // Step 2: Use Gemini to structure data
    const prompt = `
From the OCR text below, extract product details. Respond with only a valid JSON object matching the specified schema.

ProductSchema:
- name: string
- description: string
- category: string (e.g., "Electronics", "Groceries", "Fashion")
- mrp: number
- tags: array of strings
- unit: enum ("kg", "g", "ltr", "ml", "pcs", "pack", "box")
- variants: array of { label: string, value: string }

Rules:
- If a value isn't found, omit its key from the JSON.
- If don't get some details, you can generate by yourself via description based on schema.
- Do not include keys like "seller" or "images".
- Ensure the output is a single, clean JSON object without any extra text, comments, or markdown like \`\`\`json.

OCR Text:
"""
${ocrText}
"""
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Gemini did not return usable content.");
    }

    // Clean up any markdown from Gemini response
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let structuredData;
    try {
      structuredData = JSON.parse(cleanText);
    } catch (e) {
      throw new Error(
        `Failed to parse Gemini output: ${e.message}\nRaw response:\n${cleanText}`
      );
    }

    // Step 3: Send structured data back to client
    return res.json({
      result: {
        response: JSON.stringify(structuredData),
      },
    });
  } catch (err) {
    console.error("Processing failed:", err);
    return res.status(500).json({
      error: "Failed to extract or process data.",
      details: err.message,
    });
  }
});

module.exports = router;