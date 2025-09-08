'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AgencyPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Agensi</h1>
        <p className="text-gray-600">Kelola pengaturan agensi dan tim Anda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen Agensi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Halaman agensi segera hadir...</p>
        </CardContent>
      </Card>
    </div>
  )
}