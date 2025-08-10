import { motion } from 'framer-motion'
import { useAuthStore } from '@/hooks/useAuth'
import { User, Mail, Calendar, CreditCard } from 'lucide-react'

const ProfilePage = () => {
  const { user } = useAuthStore()

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    className="input-field"
                    defaultValue={user?.name}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email"
                    className="input-field"
                    defaultValue={user?.email}
                    disabled
                  />
                </div>
                <button className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Subscription</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user?.subscriptionTier} Plan</p>
                  <p className="text-sm text-gray-600">
                    {user?.subscriptionTier === 'FREE' && 'Upgrade to unlock more features'}
                    {user?.subscriptionTier === 'PREMIUM' && 'Enjoy premium features'}
                    {user?.subscriptionTier === 'BUSINESS' && 'Full business access'}
                  </p>
                </div>
                <button className="btn-secondary">
                  {user?.subscriptionTier === 'FREE' ? 'Upgrade' : 'Manage'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Member since</p>
                    <p className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email verified</p>
                    <p className="font-medium text-green-600">✓ Verified</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Voice minutes used</p>
                    <p className="font-medium">{user?.voiceMinutesUsed || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full btn-secondary text-left">
                  Download Data
                </button>
                <button className="w-full btn-secondary text-left">
                  Reset Password
                </button>
                <button className="w-full text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors text-left">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage
