import { useState } from "react"
import { postContact } from "../services/contact"
import { toast } from "react-toastify"

export const Contact = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [comment, setComment] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await postContact({ name, email, message: comment })
      toast.success("¡Mensaje enviado con éxito!", { position: "top-center", autoClose: 3000, theme: "colored" })
      setName("")
      setEmail("")
      setComment("")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Hubo un error al enviar el formulario", { position: "top-center", autoClose: 3000, theme: "colored" })
    }
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-black/50">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://hips.hearstapps.com/hmg-prod/images/woodnest-caban-a-madera-bosque-15-1604313527.jpg?resize=980:*"
          alt=""
          className="w-full h-full object-cover blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/50 via-green-950/30 to-brown-950/40" />
      </div>

      <div className="flex flex-col items-center mx-auto px-4 py-12 text-white min-h-[100svh]">
        <h1 className="text-4xl text-center md:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">Contáctanos</span>
        </h1>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8" />

        <form onSubmit={handleSubmit} className="flex items-center justify-center w-full px-5 md:px-0">
          <div className="flex flex-col rounded-2xl w-full max-w-4xl gap-6 md:max-w-xl p-6 bg-white/15 backdrop-blur-md ring-1 ring-white/10">

            <h2 className="text-green-150">Cuéntanos en qué podemos ayudarte.</h2>

            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              id="name"
              name="name"
              className="border w-full bg-stone-300/10 px-4 py-3 rounded-lg text-lg outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-green-350"
              value={name}
              required
              placeholder="Tu nombre"
              autoComplete="name"
            />

            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              name="email"
              className="border w-full bg-stone-300/10 px-4 py-3 rounded-lg text-lg outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-green-350"
              value={email}
              required
              placeholder="tu@correo.com"
              autoComplete="email"
            />

            <textarea
              onChange={(e) => setComment(e.target.value)}
              id="comment"
              name="message"
              className="min-h-[150px] w-full border bg-stone-300/10 p-4 rounded-lg text-lg max-h-[400px] outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-green-350 placeholder:text-stone-300"
              placeholder="Escribe tu mensaje aquí"
              value={comment}
              required
            />

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <button
                type="button"
                onClick={() => { setName(""); setEmail(""); setComment("") }}
                className="w-full sm:w-1/2 bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-450 text-xl p-3 hover:scale-[1.02]"
              >
                Borrar
              </button>
              <button
                type="submit"
                className="w-full sm:w-1/2 bg-gradient-to-br from-brown-550 to-green-450 rounded-3xl border border-brown-250 text-xl p-3 hover:scale-[1.02]"
              >
                Enviar
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}