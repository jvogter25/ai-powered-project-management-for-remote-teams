import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    priceId: 'price_starter_monthly',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  {
    name: 'Pro',
    price: '$99', 
    priceId: 'price_pro_monthly',
    features: ['Everything in Starter', 'Advanced Feature 1', 'Advanced Feature 2'],
  },
]

export default function PricingCard() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId)
    
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise
      
      const { error } = await stripe!.redirectToCheckout({ sessionId })
      
      if (error) {
        console.error('Error redirecting to checkout:', error)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {pricingPlans.map((plan) => (
        <div key={plan.name} className="bg-white p-8 rounded-lg shadow-lg border">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
          <div className="text-4xl font-bold text-blue-600 mb-6">
            {plan.price}
            <span className="text-lg text-gray-500">/month</span>
          </div>
          
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          
          <button
            onClick={() => handleSubscribe(plan.priceId)}
            disabled={loading === plan.priceId}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading === plan.priceId ? 'Loading...' : `Subscribe to ${plan.name}`}
          </button>
        </div>
      ))}
    </div>
  )
}