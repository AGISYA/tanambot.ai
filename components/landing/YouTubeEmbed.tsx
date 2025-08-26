export default function YouTubeEmbed() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Lihat TANAM dalam Aksi
          </h2>
          <p className="text-lg text-gray-600">
            Demo lengkap cara kerja chatbot WhatsApp TANAM
          </p>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="TANAM Chatbot Demo"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="text-center mt-8">
          <a
            href="https://youtube.com/@tanam"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors duration-200"
          >
            <span>Lihat video lainnya di channel kami</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}