'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EvaluationPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evaluation</h1>
                    <p className="text-gray-600">Assess and score generated ideas across multiple criteria</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            Idea evaluation interface will be available in the next release.
                            This will include feasibility scoring, market potential analysis,
                            uniqueness assessment, and implementation planning.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
} 