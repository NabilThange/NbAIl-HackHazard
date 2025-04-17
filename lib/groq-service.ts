import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const getGroqChatCompletion = async (userMessage: string) => {
  const systemPrompt = `> You are a **conversational AI** with advanced contextual understanding, emotional adaptability, and subject-mastery across technical, creative, academic, and real-world domains. You respond to queries like an expert human assistant, maintaining the following principles:

---

### 🎯 OBJECTIVES

1.  **Context Awareness**
    *   Always keep track of ongoing conversations.
    *   Build your answers based on previous messages and adjust tone accordingly.
    *   Avoid repeating context the user already knows unless clarification is needed.

2.  **Tone & Personality Adaptation**
    *   Match the user's **tone**, **mood**, and **style**:
        *   Friendly and casual when the user is relaxed.
        *   Professional and precise when the user is formal.
        *   Empathetic when the topic is emotional or sensitive.
    *   Use contractions, rhetorical flow, and nuanced expressions when appropriate.

3.  **Structured Responses**
    *   Organize information clearly with titles, bullets, steps, or summaries.
    *   Use Markdown-like styling (bold titles, italics, emojis if casual).
    *   Avoid walls of text — break information into digestible parts.

4.  **Precision + Depth**
    *   Ensure your answers are accurate, well-researched, and cite best practices when needed.
    *   Use analogies, examples, and comparisons to help explain complex ideas simply.
    *   Never make up facts — say "I don't know" if needed, or suggest what to look for.

5.  **Creative & Logical Balance**
    *   Capable of both **creative tasks** (writing poetry, branding, design ideas) and **logical tasks** (math, code, research).
    *   Know when to be imaginative and when to be factual.

6.  **Multimodal Flexibility** *(if supported)*
    *   Capable of understanding and describing text, images, charts, diagrams, or even audio/video.
    *   Answer accordingly when files are uploaded or referenced.

7.  **Memory & Continuity**
    *   If given access, remember key facts and preferences shared by the user throughout the session or across conversations.

---

### 🧠 EXAMPLES OF BEHAVIOR:

*   **Coding help?** Give step-by-step logic first, then show clean code, with optional explanations.
*   **Design request?** Start with principles (contrast, hierarchy), then offer suggestions or mock copy/design.
*   **Confused user?** Slow down, rephrase simply, check if they understand before moving on.
*   **In a rush?** Give a summary first, then offer details if the user asks.
*   **Technical document?** Use formal language, inline definitions, and modular explanations.

---

### 🧬 Your Role:

> You are not just answering — you are **collaborating**, **adapting**, and **enhancing** how the user thinks and works.

---

Always format your responses using clear Markdown syntax (bold, italics, lists, headings, code blocks) for structure and readability.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      model: 'llama3-8b-8192', // Or your preferred model
    });
    return chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error getting Groq chat completion:', error);
    return 'Sorry, there was an error processing your request.';
  }
};

export const getGroqTranscription = async (audioFile: File) => {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3", // Or your preferred model
      language: "en", // Add language hint for potentially better accuracy
      response_format: "json", // Get transcription text
    });
    return transcription.text || ""; // Return the transcribed text
  } catch (error) {
    console.error("Error getting Groq transcription:", error);
    return "Sorry, there was an error transcribing the audio.";
  }
};

export const getGroqVisionCompletion = async (userPrompt: string, imageBase64: string, imageType: string) => {
  // Ensure the base64 string has the correct prefix (e.g., data:image/jpeg;base64,)
  // The FileReader already provides this, but double-check or construct if needed.
  const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:${imageType};base64,${imageBase64}`;

  try {
    console.log("Sending to Groq Vision..."); // Debug log
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        // Add a system prompt for general vision tasks
        {
            role: "system",
            content: "You are a highly intelligent, multimodal AI assistant. A user has provided an image. Your task is to:\n\nClearly and accurately describe the visual content of the image in a structured and detailed way.\n\nIdentify and describe any objects, people, environment, or notable visual elements.\n\nIf there is text present in the image (such as on books, screens, signs, labels, or documents), read and include that text in your output.\n\nUse descriptive language to help the user visualize the image through your words, especially if the image contains diagrams, interfaces, screenshots, or real-world scenes"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image_url",
              image_url: {
                "url": imageUrl,
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Use the specified Llama 4 Scout vision model
      max_tokens: 1024, // Example limit, adjust as needed
    });
    console.log("Received from Groq Vision:", chatCompletion.choices[0]?.message?.content);
    return chatCompletion.choices[0]?.message?.content || "Sorry, I could not process the image.";
  } catch (error) {
    console.error("Error getting Groq vision completion:", error);
    // Check for specific error types if needed (e.g., size limits)
    if (error instanceof Error && error.message.includes('413')) {
        return "Sorry, the uploaded image is too large.";
    }
    return "Sorry, there was an error processing the image.";
  }
};

// Specific function for AR mode or general vision queries
export const getGroqVisionAnalysis = async (
  base64ImageData: string, // Expecting data URL like "data:image/jpeg;base64,..."
  prompt: string,
) => {
  if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    throw new Error("Groq API key not configured.");
  }
  if (!base64ImageData || !base64ImageData.startsWith("data:image")) {
      throw new Error("Invalid image data provided.");
  }

  // Extract base64 content and determine MIME type
  const mimeType = base64ImageData.substring(base64ImageData.indexOf(":") + 1, base64ImageData.indexOf(";"));
  const base64Content = base64ImageData.substring(base64ImageData.indexOf(",") + 1);

  console.log(`Sending to Groq Vision: Prompt - "${prompt}", MimeType - ${mimeType}, Size approx ${Math.round(base64Content.length * 3/4 / 1024)} KB`);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant with vision capabilities designed for AR Mode. Analyze the provided image based on the user's query. Pay close attention to any text visible in the image (like human facial gesture,posture,book titles, signs, labels, or screen content) and include it accurately in your description. Provide a concise, informative response detailing what you see.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: base64ImageData, // Send the full data URL
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      // Optional: Add parameters like max_tokens, temperature if needed
      // max_tokens: 150,
    });

    const responseContent = completion.choices[0]?.message?.content;
    console.log("Groq Vision API Response:", responseContent);

    if (!responseContent) {
      throw new Error("Received an empty response from Groq Vision API.");
    }

    return responseContent;

  } catch (error) {
    console.error("Error calling Groq Vision API:", error);
    // Rethrow or handle appropriately
    if (error instanceof Error) {
       throw new Error(`Groq Vision API Error: ${error.message}`);
    } else {
       throw new Error("An unknown error occurred while contacting Groq Vision API.");
    }
  }
}; 