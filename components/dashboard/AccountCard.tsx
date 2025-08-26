import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AccountCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Basic</div>
            <div className="text-sm text-gray-600">Current Plan</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">2,450</div>
            <div className="text-sm text-gray-600">Messages Left</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">23</div>
            <div className="text-sm text-gray-600">Days Remaining</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}