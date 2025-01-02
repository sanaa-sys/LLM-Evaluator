'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LLMResponse from './LLMResponse'
import MetricsChart from './MetricsChart'
import { auth, db, provider } from '../lib/firebase'
import { signInWithPopup, signOut } from "firebase/auth"
import { collection, addDoc, query, orderBy, limit, onSnapshot } from "firebase/firestore"

const formatTimestamp = (timestamp) => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString();
  } else if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  } else if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  } else if (typeof timestamp === 'number') {
    return new Date(timestamp).toLocaleString();
  }
  return 'Unknown date';
};

export default function LLMComparison() {
    const [prompt, setPrompt] = useState('')
    const [responses, setResponses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedMetric, setSelectedMetric] = useState('answerCorrectness')
    const [previousExperiments, setPreviousExperiments] = useState([])
    const [user, setUser] = useState(null)
    const responsesRef = useRef(null)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user)
            if (user) {
                const q = query(collection(db, 'chatHistory'), limit(5))
                const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const experimentsArray = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    setPreviousExperiments(experimentsArray)
                })
                return () => unsubscribeSnapshot()
            }
        })
        return () => unsubscribe()
    }, [])



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

            if (user) {
                await addDoc(collection(db, 'chatHistory'), {
                    prompt,
                    timestamp: new Date(),
                    responses: data,
                    userId: user.uid
                })
            }
        } catch (error) {
            console.error('Error:', error)
        }
        setIsLoading(false)
    }

    const metrics = [
        { value: 'answerCorrectness', label: 'Answer Correctness' },
        { value: 'answerRelevancy', label: 'Answer Relevancy' },
        { value: 'answerSimilarity', label: 'Answer Similarity' },
        { value: 'faithfulness', label: 'Faithfulness' },
    ]

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Together AI LLM Comparison Tool</h1>
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
                <Button type="submit" disabled={isLoading || !user}>
                    {isLoading ? 'Comparing...' : 'Compare LLMs'}
                </Button>
            </form>
            <div ref={responsesRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {responses.map((response, index) => (
                    <LLMResponse key={index} response={response} />
                ))}
            </div>
            {responses.length > 0 && (
                <div className="mb-4">
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                            {metrics.map((metric) => (
                                <SelectItem key={metric.value} value={metric.value}>
                                    {metric.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {responses.length > 0 && <MetricsChart data={responses} selectedMetric={selectedMetric} />}
    
            {user && (
                <>
                    <h2 className="text-2xl font-bold mt-8 mb-4">Previous Experiments</h2>
                    {previousExperiments.length > 0 ? (
                        previousExperiments.map((experiment) => (
                            <div key={experiment.id} className="mb-4 p-4 border rounded">
                                <h3 className="font-bold">Prompt: {experiment.prompt}</h3>
                                <p>Timestamp: {formatTimestamp(experiment.timestamp)}</p>
                                <Button
                                    onClick={() => {
                                        setResponses(experiment.responses)
                                        responsesRef.current?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                    className="mt-2"
                                >
                                    View Results
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p>No previous experiments found. Try running a comparison!</p>
                    )}
                </>
            )}
        </div>
    )
}

