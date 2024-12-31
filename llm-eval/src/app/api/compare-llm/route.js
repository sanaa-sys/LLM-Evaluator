import { NextResponse } from 'next/server'
import Together from 'together-ai'
import {
    AnswerCorrectness,
    AnswerRelevancy,
    AnswerSimilarity,
    Faithfulness
} from "autoevals"

const together = new Together(process.env.TOGETHER_API_KEY)

const models = [
    { name: 'Nemotron 70B', model: 'nvidia/Llama-3.1-Nemotron-70B-Instruct-HF' },
    { name: 'Mixtral 8x7B', model: 'mistralai/Mixtral-8x7B-Instruct-v0.1' },
    { name: 'DeepSeek 67B', model: 'deepseek-ai/deepseek-llm-67b-chat' },
]

const referenceModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'

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

async function getExpectedOutput(prompt) {
    const { text } = await getModelResponse(referenceModel, prompt)
    return text
}

export async function POST(req) {
    const { prompt } = await req.json()

    // Get expected output from reference model
    const expectedOutput = await getExpectedOutput(prompt)

    const responses = await Promise.all(
        models.map(async ({ name, model }) => {
            const { text, responseTime } = await getModelResponse(model, prompt)

            // Evaluate the response using AutoEvals
            const [
                answerCorrectnessScore,
                answerRelevancyScore,
                answerSimilarityScore,
                faithfulnessScore
            ] = await Promise.all([
                AnswerCorrectness({
                    input: prompt, output: text, expected: expectedOutput,
                    model: 'gpt-3.5-turbo', }),
                AnswerRelevancy({
                    input: prompt, context: prompt, output: text, expected: expectedOutput,
                    model: 'gpt-3.5-turbo', }),
                AnswerSimilarity({
                    input: prompt, context: prompt, output: text, expected: expectedOutput,
                    model: 'gpt-3.5-turbo', }),
                Faithfulness({
                    input: prompt, context: prompt, output: text, expected: expectedOutput,
                    model: 'gpt-3.5-turbo', })
            ])

            const metrics = {
                answerCorrectness: answerCorrectnessScore.score,
                answerRelevancy: answerRelevancyScore.score,
                answerSimilarity: answerSimilarityScore.score,
                faithfulness: faithfulnessScore.score,
                responseTime,
            }

            return { model: name, text, metrics }
        })
    )

    return NextResponse.json(responses)
}

