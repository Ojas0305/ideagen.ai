'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AIPersonasPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AI Personas</h1>
                    <p className="text-gray-600">Configure and manage AI thinking styles for idea generation</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            AI personas configuration interface will be available in the next release.
                            This will include creating custom personas, editing system prompts,
                            and managing thinking styles and personalities.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
} 