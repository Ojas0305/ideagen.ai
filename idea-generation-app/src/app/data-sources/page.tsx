'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DataSourcesPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
                    <p className="text-gray-600">Manage external data connections and integrations</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            Data sources management interface will be available in the next release.
                            This will include connections to market research APIs, social media monitoring,
                            competitor analysis tools, and industry reports.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
} 