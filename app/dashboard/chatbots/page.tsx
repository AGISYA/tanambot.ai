import ChatbotsTable from '@/components/dashboard/ChatbotsTable'

export default function ChatbotsPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Chatbots</h1>
              <p className="text-gray-600 mt-1">Manage your chatbots and create new ones</p>
            </div>
          </div>
        </div>
        
        <ChatbotsTable />
      </div>
    </div>
  )
}