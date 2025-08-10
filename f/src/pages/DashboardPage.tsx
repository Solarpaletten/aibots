import { motion } from 'framer-motion'
import { useAuthStore } from '@/hooks/useAuth'
import { Mic, Phone, BarChart3, Clock } from 'lucide-react'

const DashboardPage = () => {
  const { user } = useAuthStore()

  const stats = [
    {
      name: 'Voice Minutes Used',
      value: user?.voiceMinutesUsed || 0,
      limit: user?.subscriptionTier === 'FREE' ? 50 : user?.subscriptionTier === 'PREMIUM' ? 1000 : 10000,
      icon: Mic,
      color: 'text-blue-600'
    },
    {
      name: 'Translations Today',
      value: 12,
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      name: 'Active Calls',
      value: 0,
      icon: Phone,
      color: 'text-purple-600'
    },
    {
      name: 'Total Sessions',
      value: 48,
      icon: Clock,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-gray-600 mb-8">
          Here's your translation activity overview
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}{stat.limit && `/${stat.limit}`}
                  </p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Translate</h3>
            <p className="text-gray-600 mb-4">Start translating text or voice instantly</p>
            <button className="btn-primary">
              Start Translation
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Call</h3>
            <p className="text-gray-600 mb-4">Create a real-time translation call</p>
            <button className="btn-secondary">
              Create Call
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardPage
