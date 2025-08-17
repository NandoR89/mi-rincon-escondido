import forestBirds from "../assets/audio/forest-birds.mp3"
import { useState, useEffect } from "react"
import { getRandomReview } from "../services/reviews"

export const Home = () => {
  const [randomReview, setRandomReview] = useState(null)

  useEffect(() => {
    const fetchRandomReview = async () => {
      try {
        const review = await getRandomReview()
        setRandomReview(review)
      } catch (err) {
        console.error("Error fetching reviews", err)
      }
    }
    fetchRandomReview()
  }, [])

  return (
    <div className="bg-hero text-white">
      <div className="flex min-h-[100svh] flex-col px-5 py-6 md:py-10">
        <section className="ml-5 mt-4 md:ml-10 md:mt-6">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">MI</span><br />
            <span className="bg-gradient-to-br from-brown-350 to-green-250 bg-clip-text text-transparent">RINCÓN</span><br />
            <span className="bg-gradient-to-br from-green-450 to-green-150 bg-clip-text text-transparent">ESCONDIDO</span>
          </h1>
        </section>

        <section className="mt-auto flex flex-col items-center gap-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <article className="hidden sm:flex">
            <audio
              src={forestBirds}
              controls
              className="[&::-webkit-media-controls-panel]:bg-gradient-to-br from-green-550 via-green-250 to-brown-550/80 [&::-webkit-media-controls-current-time-display]:text-white [&::-webkit-media-controls-time-remaining-display]:text-white accent-green-350"
            />
          </article>

          <article className="flex justify-center">
            <div className="max-w-sm rounded-3xl bg-white/10 p-5 text-center backdrop-blur-md ring-1 ring-white/10 shadow-lg">
              <h3 className="font-bold tracking-tight">Opiniones de nuestros clientes</h3>
              {randomReview ? (
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-green-550/70 to-green-350/70 p-4">
                  <p className="italic">“{randomReview.comment}”</p>
                  <p className="mt-2 text-sm">- {randomReview.user_name} -</p>
                </div>
              ) : (
                <p className="mt-3 text-white/90">No hay reseñas disponibles</p>
              )}
            </div>
          </article>

          <button
            onClick={() => (window.location.href = "/maps")}
            className="flex items-center rounded-full bg-gradient-to-br from-brown-550 to-green-450 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 sm:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Abrir Mapa
          </button>

          <article className="flex sm:hidden">
            <audio
              src={forestBirds}
              controls
              className="[&::-webkit-media-controls-panel]:bg-gradient-to-br from-green-550 via-green-250 to-brown-550/80 [&::-webkit-media-controls-current-time-display]:text-white [&::-webkit-media-controls-time-remaining-display]:text-white accent-green-350"
            />
          </article>

          <button
            onClick={() => (window.location.href = "/maps")}
            className="hidden items-center rounded-full bg-gradient-to-br from-brown-550 to-green-450 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 sm:flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Abrir Mapa
          </button>
        </section>
      </div>
    </div>
  )
}
