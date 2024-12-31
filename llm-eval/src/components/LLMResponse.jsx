import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LLMResponse({ response }) {
    const { model, text, metrics } = response

    return (
        <Card>
            <CardHeader>
                <CardTitle>{model}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">{text}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <strong>Answer Correctness:</strong> {metrics.answerCorrectness.toFixed(2)}
                    </div>
                    <div>
                        <strong>Answer Relevancy:</strong> {metrics.answerRelevancy.toFixed(2)}
                    </div>
                    <div>
                        <strong>Answer Similarity:</strong> {metrics.answerSimilarity.toFixed(2)}
                    </div>
                    <div>
                        <strong>Context Entity Recall:</strong> {metrics.contextEntityRecall.toFixed(2)}
                    </div>
                    <div>
                        <strong>Context Precision:</strong> {metrics.contextPrecision.toFixed(2)}
                    </div>
                    <div>
                        <strong>Context Recall:</strong> {metrics.contextRecall.toFixed(2)}
                    </div>
                    <div>
                        <strong>Context Relevancy:</strong> {metrics.contextRelevancy.toFixed(2)}
                    </div>
                    <div>
                        <strong>Faithfulness:</strong> {metrics.faithfulness.toFixed(2)}
                    </div>
                    <div>
                        <strong>Response Time:</strong> {metrics.responseTime.toFixed(2)}ms
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

