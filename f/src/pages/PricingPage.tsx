import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'

const PricingPage = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for trying out SOLAR",
      features: [
        "50 voice minutes/month",
        "Unlimited text translation",
        "10 supported languages",
        "Basic voice quality",
        "Email support"
      ],
      cta: "Start Free",
      popular: false,
      color: "gray"
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "/month",
      description: "Best for individuals and small teams",
      features: [
        "1,000 voice minutes/month",
        "Unlimited text translation",
        "Real-time call translation",
        "HD voice quality",
        "Priority processing",
        "Custom voice selection",
        "Priority support"
      ],
      cta: "Upgrade to Premium",
      popular: true,
      color: "primary"
    },
    {
      name: "Business",
      price: "$49.99",
      period: "/month",
      description: "For teams and organizations",
      features: [
        "10,000 voice minutes/month",
        "Unlimited text translation",
        "Team management",
        "Conference call translation",
        "API access",
        "Analytics dashboard",
        "Custom integrations",
        "24/7 dedicated support"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "solar"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your translation needs. 
            Upgrade or downgrade at any time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card relative ${
                plan.popular 
                  ? 'ring-2 ring-primary-500 shadow-xl scale-105' 
                  : 'hover:shadow-lg'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 text-lg">{plan.period}</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-left">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to="/register"
                  className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                      : plan.color === 'solar'
                      ? 'bg-solar-500 text-white hover:bg-solar-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any charges or credits.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my voice minutes?
              </h3>
              <p className="text-gray-600">
                If you exceed your monthly voice minutes, you'll be prompted to upgrade your plan. 
                Text translations remain unlimited on all plans.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600">
                Yes! All paid plans come with a 7-day free trial. You can cancel anytime during 
                the trial period without being charged.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer enterprise pricing?
              </h3>
              <p className="text-gray-600">
                Absolutely! For organizations with specific needs or high-volume usage, 
                we offer custom enterprise plans. Contact our sales team for more information.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-primary-500 to-solar-500 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to break language barriers?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust SOLAR for their translation needs. 
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-200"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PricingPage
