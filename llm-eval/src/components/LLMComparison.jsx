'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import LLMResponse from './LLMResponse'

export default function LLMComparison() {
    const [prompt, setPrompt] = useState('')
    const [responses, setResponses] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await fetch('/api/compare-llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })
            const data = await res.json()
            setResponses(data)
        } catch (error) {
            console.error('Error:', error)
        }
        setIsLoading(false)
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Together AI LLM Comparison Tool with AutoEvals</h1>
            <h2 className="text-xl mb-2">Models: Nemotron 70B, Mixtral 8x7B, DeepSeek 67B</h2>
            <h3 className="text-lg mb-2">Reference Model: Llama 3.1 8B Turbo</h3>
            <h4 className="text-md mb-2">Metrics: Answer Correctness, Answer Relevancy, Answer Similarity, Faithfulness</h4>
            <form onSubmit={handleSubmit} className="mb-4">
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    className="mb-2"
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Comparing...' : 'Compare LLMs'}
                </Button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {responses.map((response, index) => (
                    <LLMResponse key={index} response={response} />
                ))}
            </div>
        </div>
    )
}

