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
      model: "openai/gpt-4o-2024-11-20",
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
      model: "openai/gpt-4o-2024-11-20",
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

/**
 * Generate quiz questions based on document summary using OpenRouter's JSON schema
 * @param summary - The document summary to create quiz from
 * @returns Promise<QuizQuestion[]> - Array of generated quiz questions
 */
export async function generateQuizQuestions(summary: string): Promise<QuizQuestion[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        "HTTP-Referer": process.env.EXPO_PUBLIC_SITE_URL || "",
        "X-Title": process.env.EXPO_PUBLIC_SITE_NAME || "",
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-2024-11-20',
        messages: [
          {
            role: 'system',
            content: 'You are an educational quiz generator. Create exactly 5 multiple choice questions in Bahasa Indonesia based on the provided document summary. Each question must test understanding of key concepts from the content. Questions should be a mix of factual and conceptual. Each question must have exactly 4 plausible options with only one correct answer.'
          },
          {
            role: 'user',
            content: `Generate 5 multiple choice questions from this document summary:

${summary}

Requirements:
- All text in Bahasa Indonesia
- Questions should test understanding of key concepts
- Mix of factual and conceptual questions  
- Options should be plausible but only one correct
- Ensure questions cover different aspects of the content`
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'quiz_questions',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                questions: {
                  type: 'array',
                  description: 'Array of exactly 5 quiz questions',
                  items: {
                    type: 'object',
                    properties: {
                      question: {
                        type: 'string',
                        description: 'The quiz question text in Bahasa Indonesia'
                      },
                      options: {
                        type: 'array',
                        description: 'Exactly 4 multiple choice options',
                        items: {
                          type: 'string'
                        },
                        minItems: 4,
                        maxItems: 4
                      },
                      correctAnswer: {
                        type: 'integer',
                        description: 'Index of the correct answer (0-3)',
                        minimum: 0,
                        maximum: 3
                      }
                    },
                    required: ['question', 'options', 'correctAnswer'],
                    additionalProperties: false
                  },
                  minItems: 5,
                  maxItems: 5
                }
              },
              required: ['questions'],
              additionalProperties: false
            }
          }
        },
        temperature: 0.3,
        max_completion_tokens: 4500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No quiz questions generated');
    }

    // Parse the JSON response
    const parsedQuestions = JSON.parse(content);
    
    if (!parsedQuestions.questions || !Array.isArray(parsedQuestions.questions)) {
      throw new Error('Invalid quiz questions format');
    }

    return parsedQuestions.questions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

// Type definition for quiz questions
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
} 