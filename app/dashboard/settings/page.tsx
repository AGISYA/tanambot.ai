'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan</h1>
        <p className="text-gray-600">Kelola pengaturan akun dan preferensi Anda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Halaman pengaturan segera hadir...</p>
        </CardContent>
      </Card>
    </div>
  )
}