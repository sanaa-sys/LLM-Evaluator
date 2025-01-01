import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LLMResponse({ response }) {
    const { model, text, metrics } = response

    const formatMetric = (value) => {
        return typeof value === 'number' ? value.toFixed(2) : 'N/A'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{model}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">{text}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <strong>Answer Correctness:</strong> {formatMetric(metrics.answerCorrectness)}
                    </div>
                    <div>
                        <strong>Answer Relevancy:</strong> {formatMetric(metrics.answerRelevancy)}
                    </div>
                    <div>
                        <strong>Answer Similarity:</strong> {formatMetric(metrics.answerSimilarity)}
                    </div>
                    <div>
                        <strong>Faithfulness:</strong> {formatMetric(metrics.faithfulness)}
                    </div>
                    <div>
                        <strong>Response Time:</strong> {formatMetric(metrics.responseTime)}ms
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

