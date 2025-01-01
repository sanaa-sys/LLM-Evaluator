import { NextResponse } from 'next/server'
import Together from 'together-ai'

const together = new Together(process.env.TOGETHER_AI_API_KEY)

const models = [
    { name: 'Nemotron 70B', model: 'nvidia/Llama-3.1-Nemotron-70B-Instruct-HF' },
    { name: 'Mixtral 8x7B', model: 'mistralai/Mixtral-8x7B-Instruct-v0.1' },
    { name: 'DeepSeek 67B', model: 'deepseek-ai/deepseek-llm-67b-chat' },
]

const referenceModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
const evaluationModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'

async function getModelResponse(model, prompt) {
    const startTime = Date.now()
    const completion = await together.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
    })
    const responseTime = Date.now() - startTime
    return {
        text: completion.choices[0].message.content,
        responseTime
    }
}

async function evaluateResponse(prompt, response, expected) {
    const evaluationPrompt = `
    Given the following:
    Prompt: "${prompt}"
    Response: "${response}"
    Expected: "${expected}"

    Please evaluate the response on the following criteria:
    1. Answer Correctness (0-100): How correct is the response compared to the expected answer?
    2. Answer Relevancy (0-100): How relevant is the response to the given prompt?
    3. Answer Similarity (0-100): How similar is the response to the expected answer?
    4. Faithfulness (0-100): How faithful is the response to the information provided in the prompt?

    Provide your evaluation as a JSON object with these four scores. Use the following format:
    {
      "answerCorrectness": 0,
      "answerRelevancy": 0,
      "answerSimilarity": 0,
      "faithfulness": 0
    }
    Replace the 0 values with your actual scores. Do not include any other text or explanation in your response.
  `

    const evaluation = await getModelResponse(evaluationModel, evaluationPrompt)
    try {
        // Extract JSON from the response
        const jsonMatch = evaluation.text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('No JSON found in the response')
        }
        const jsonString = jsonMatch[0]
        const scores = JSON.parse(jsonString)

        // Validate and normalize scores
        const normalizeScore = (score) => {
            const numScore = Number(score)
            return isNaN(numScore) ? 0 : Math.max(0, Math.min(numScore, 100)) / 100
        }

        return {
            answerCorrectness: normalizeScore(scores.answerCorrectness),
            answerRelevancy: normalizeScore(scores.answerRelevancy),
            answerSimilarity: normalizeScore(scores.answerSimilarity),
            faithfulness: normalizeScore(scores.faithfulness),
        }
    } catch (error) {
        console.error('Error parsing evaluation result:', error)
        console.error('Raw evaluation text:', evaluation.text)
        return {
            answerCorrectness: 0,
            answerRelevancy: 0,
            answerSimilarity: 0,
            faithfulness: 0,
        }
    }
}

export async function POST(req) {
    const { prompt } = await req.json()

    // Get expected output from reference model
    const { text: expectedOutput } = await getModelResponse(referenceModel, prompt)

    const responses = await Promise.all(
        models.map(async ({ name, model }) => {
            const { text, responseTime } = await getModelResponse(model, prompt)

            // Evaluate the response using our custom evaluation function
            const metrics = await evaluateResponse(prompt, text, expectedOutput)
            metrics.responseTime = responseTime

            return { model: name, text, metrics }
        })
    )

    return NextResponse.json(responses)
}

