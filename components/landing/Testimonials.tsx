import { testimonials } from '@/lib/data'
import Image from 'next/image'

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Apa Kata Mereka
          </h2>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Testimoni dari client yang sudah merasakan manfaat TANAM
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="rounded-full mr-3 sm:mr-4 w-10 h-10 sm:w-12 sm:h-12"
                />
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
              <div className="flex mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-700 italic leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        {/* Client logos */}
        <div className="mt-8 sm:mt-12 lg:mt-16 pt-8 sm:pt-12 border-t border-gray-200">
          <h3 className="text-center text-base sm:text-lg font-medium text-gray-500 mb-6 sm:mb-8 px-4">
            Dipercaya oleh 500+ bisnis di Indonesia
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 opacity-60">
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-lg text-sm sm:text-base font-semibold text-gray-700">TechStart</div>
            <div className="px-6 py-3 bg-gray-100 rounded-lg font-semibold text-gray-700">Fashion Store</div>
            <div className="px-6 py-3 bg-gray-100 rounded-lg font-semibold text-gray-700">Resto Nusantara</div>
            <div className="px-6 py-3 bg-gray-100 rounded-lg font-semibold text-gray-700">Digital Agency</div>
          </div>
        </div>
      </div>
    </section>
  )
}