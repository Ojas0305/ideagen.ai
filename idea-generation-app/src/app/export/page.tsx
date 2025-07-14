'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExportPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Export</h1>
                    <p className="text-gray-600">Export ideas and generate implementation documentation</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            Export functionality will be available in the next release.
                            This will include PDF reports, PowerPoint presentations,
                            Word documents, and JSON exports for API integration.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
} 