import { Link } from "react-router-dom"

export const TermsAndConditions = () => {
  return (
    <div className="relative min-h-[100svh]">
      <div className="absolute inset-0 bg-hero bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="relative z-10 flex flex-col items-center mx-auto px-4 py-12">
        <h1 className="text-4xl text-center md:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">
            Términos y Condiciones
          </span>
        </h1>
        <p className="text-white mb-8">
          Última actualización: <strong>14 de agosto de 2025</strong>
        </p>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8" />
        <div className="max-w-4xl w-full bg-stone-800/50 p-6 rounded-2xl text-white space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Aceptación de los Términos</h2>
            <p>
              Al utilizar este sitio web, aceptas cumplir con estos términos y condiciones, así como con cualquier
              actualización o cambio de los mismos. Si no estás de acuerdo con estos términos, por favor no uses el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Uso del Sitio Web</h2>
            <p>
              Este sitio web está diseñado para ofrecer servicios relacionados con el alquiler de cabañas en entornos
              naturales y tranquilos bajo el nombre de &quot;Mi Rincón Escondido&quot;. Te comprometes a usar el sitio de
              manera legal y respetuosa, sin infringir ninguna ley o derecho de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. Derechos de Propiedad Intelectual</h2>
            <p>
              Todo el contenido de este sitio web, incluidos textos, imágenes, gráficos y logotipos, están protegidos por
              derechos de autor y son propiedad de &quot;Mi Rincón Escondido&quot;. Queda prohibido copiar, reproducir o
              distribuir cualquier contenido sin el consentimiento expreso del propietario.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Protección de Datos</h2>
            <p>
              Nos comprometemos a proteger tu privacidad. Los datos personales que nos proporcionas se utilizarán únicamente
              para los fines establecidos en nuestra{" "}
              <Link to="/privacyandpolicy" className="underline decoration-green-350 underline-offset-4">
                Política de Privacidad
              </Link>
              . Nunca compartiremos tu información con terceros sin tu consentimiento, excepto en los casos previstos por la
              ley.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Limitación de Responsabilidad</h2>
            <p>
              El sitio web y los servicios proporcionados se ofrecen &quot;tal cual&quot;. No nos hacemos responsables de
              ningún daño, pérdida o perjuicio relacionado con el uso del sitio, incluyendo pero no limitado a daños a tu
              equipo, pérdida de datos o interrupciones del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Cancelaciones</h2>
            <p>
              Para cualquier cancelación de reserva, es necesario ponerse en contacto con nosotros a través de nuestro
              correo electrónico o teléfono. Las cancelaciones realizadas con menos de 48 horas de antelación serán{" "}
              <span className="font-bold">facturadas</span>. Apreciamos tu comprensión.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar o actualizar estos términos en cualquier momento. Te recomendamos
              revisar periódicamente esta página para estar al tanto de cualquier cambio. Las modificaciones entrarán en
              vigor en el momento de su publicación en el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Contacto</h2>
            <p>
              Si tienes alguna pregunta sobre estos términos, no dudes en contactarnos a través del correo electrónico:{" "}
              <a href="mailto:contacto@mirinconescondido.com" className="underline decoration-green-350 underline-offset-4">
                contacto@mirinconescondido.com
              </a>{" "}
              o llamando al teléfono:{" "}
              <a href="tel:+34123456789" className="underline decoration-green-350 underline-offset-4">
                +34 123 456 789
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}