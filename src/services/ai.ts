import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export interface AnalysisResult {
  title: string;
  description: string;
  severity: number;
  department: string;
}

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  try {
    const base64Image = await fileToBase64(file);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise esta imagem de um problema urbano. Retorne APENAS um objeto JSON (sem markdown, sem explicações) com o seguinte formato: { \"title\": \"Título curto e técnico\", \"description\": \"Descrição detalhada do problema visível\", \"severity\": número de 1 a 10 (onde 10 é gravíssimo), \"department\": \"Departamento responsável (ex: CET, Limpeza Urbana, Iluminação)\" }",
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content received from AI");

    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Fallback for demo purposes if API fails
    return {
      title: "Erro na Análise de Imagem",
      description: `Não foi possível analisar a imagem com a IA. ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique sua conexão ou tente novamente.`,
      severity: 5,
      department: "Geral",
    };
  }
};
