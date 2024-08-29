import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { fromBuffer } from "file-type";

export default class GeminiService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  private model: GenerativeModel;
  public static instance: GeminiService;

  constructor() {
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new GeminiService();
    }

    return this.instance;
  }

  private async generateMimiType(base64Image: string): Promise<string> {
    const buffer = Buffer.from(base64Image, "base64");
    const type = await fromBuffer(buffer);
    return type ? type.mime : "";
  }

  public async getMeasureFromImage(
    base64Image: string
  ): Promise<{ value: string; measureUnit: string }> {
    const prompt = `Return the value and the measure unit like { "value": measured value, "measureUnit": measure unit }.`;

    const mimeType = await this.generateMimiType(base64Image);

    const image = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const result = await this.model.generateContent([prompt, image]);

    return JSON.parse(result.response.text());
  }
}
