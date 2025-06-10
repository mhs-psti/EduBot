import OpenAI from 'openai';

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": process.env.EXPO_PUBLIC_SITE_URL,
    "X-Title": process.env.EXPO_PUBLIC_SITE_NAME,
  },
});

/**
 * Generate a document summary in Bahasa Indonesia
 * @param content - The document content to summarize
 * @returns Promise<string> - The generated summary
 */
export async function generateDocumentSummary(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Summarize the following document in Bahasa Indonesia. Provide only the summary content directly, without any introductory sentences or explanations:\n\n" + content,
            },
          ],
        },
      ],
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    
    if (!summary) {
      throw new Error('No summary generated');
    }

    return summary;
  } catch (error) {
    console.error('Error generating document summary:', error);
    throw error;
  }
}

/**
 * Generate a short session name based on user's first message
 * @param userMessage - The user's first message
 * @returns Promise<string> - The generated session name
 */
export async function generateShortSessionName(userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-preview",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are a session name generator. Your ONLY job is to create short, descriptive session names in Bahasa Indonesia. You must respond with ONLY the session name - no explanations, no reasoning, no additional text.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Create a concise session name (2-4 words) in Bahasa Indonesia for this question:

"${userMessage}"

Examples:
- "Apa itu Pancasila?" → Pengertian Pancasila
- "Bagaimana cara belajar matematika?" → Tips Belajar Matematika  
- "Jelaskan tentang fotosintesis" → Materi Fotosintesis
- "Sebutkan sila-sila Pancasila" → Sila-sila Pancasila

Respond with ONLY the session name:`,
            },
          ],
        }
      ],
      temperature: 0.1
    });

    const generatedName = completion.choices[0]?.message?.content?.trim();

    if (generatedName) {
      return generatedName;
    } else {
      // Fallback to a simple name if OpenAI fails
      return userMessage;
    }
  } catch (error) {
    console.error('Error generating session name:', error);
    // Fallback to a simple name
    return userMessage;
  }
} 