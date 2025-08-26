import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { pricingPlans } from '@/lib/data'
import Link from 'next/link'

export default function Pricing() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Pilih Paket yang Tepat
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Mulai gratis dan upgrade sesuai kebutuhan bisnis Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-2 border-green-500 shadow-lg md:scale-105'
                  : 'border border-gray-200 hover:border-green-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-center py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
                  Paling Popular
                </div>
              )}

              <CardHeader className={plan.popular ? 'pt-8 sm:pt-12' : 'pt-4 sm:pt-6'}>
                <CardTitle className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">
                    {plan.price}
                    <span className="text-sm sm:text-base md:text-lg font-normal text-gray-500">
                      {plan.period}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="px-4 sm:px-6">
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block">
                  <Button
                    className={`w-full py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                        : 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                    }`}
                    variant={plan.popular ? 'primary' : 'outline'}
                  >
                    Mulai Sekarang
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}