import { analyzeFood, type FoodAnalysis } from "$lib/integrations/openai"

export const LLMService = {
  async analyzeFood(apiKey: string, imageDataUrl: string, menuContext?: string): Promise<FoodAnalysis> {
    return analyzeFood(apiKey, imageDataUrl, menuContext)
  },
}
