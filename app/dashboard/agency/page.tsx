import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AgencyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agency</h1>
        <p className="text-gray-600 mt-2">
          Manage your agency settings and client accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agency Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Agency Features</h3>
            <p className="text-gray-600 mb-6">
              Manage multiple client accounts and chatbots from one dashboard.
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center text-left">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Multi-client management</span>
              </div>
              <div className="flex items-center text-left">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">White-label solutions</span>
              </div>
              <div className="flex items-center text-left">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Bulk operations</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}