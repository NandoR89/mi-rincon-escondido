export const PrivacyPolicy = () => {
  return (
    <div className="relative min-h-[100svh]">
      <div className="absolute inset-0 bg-hero bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="relative z-10 flex flex-col items-center mx-auto px-4 py-12">
        <h1 className="text-4xl text-center md:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-br from-brown-450 to-brown-250 bg-clip-text text-transparent">
            Política de Privacidad
          </span>
        </h1>
        <p className="text-white mb-8">
          Última actualización: <strong>14 de agosto de 2025</strong>
        </p>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 mb-8" />
        <div className="max-w-4xl w-full bg-stone-800/50 p-6 rounded-2xl text-white space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Introducción</h2>
            <p>
              En &quot;Mi Rincón Escondido&quot;, respetamos tu privacidad. Esta política describe cómo recopilamos,
              usamos y protegemos tus datos personales cuando usas nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Información que Recopilamos</h2>
            <p>
              Recopilamos información personal que nos proporcionas al hacer una reserva, contactarnos a través del
              formulario o suscribirte a nuestro boletín. Esta información incluye, entre otros, tu nombre, dirección de
              correo electrónico y número de teléfono.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. Uso de la Información</h2>
            <p>
              Utilizamos tus datos personales para procesar reservas, responder consultas y enviarte información
              relacionada con nuestros servicios. También podemos usar tus datos para mejorar la experiencia de usuario en
              nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Protección de la Información</h2>
            <p>
              Tomamos medidas de seguridad para proteger tus datos personales contra accesos no autorizados, divulgación o
              alteración. Sin embargo, no podemos garantizar la seguridad absoluta en Internet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Compartición de la Información</h2>
            <p>
              No compartimos tu información personal con terceros, salvo en los casos necesarios para procesar tus
              reservas, como con proveedores de servicios de pago. Tampoco compartimos tu información con fines
              comerciales sin tu consentimiento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Derechos de Acceso y Control</h2>
            <p>
              Tienes derecho a acceder, corregir o eliminar tus datos personales. Si deseas ejercer estos derechos, puedes
              contactarnos en{" "}
              <a href="mailto:contacto@mirinconescondido.com" className="underline decoration-green-350 underline-offset-4">
                contacto@mirinconescondido.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Cambios en la Política de Privacidad</h2>
            <p>
              Nos reservamos el derecho de actualizar esta política en cualquier momento. Los cambios serán efectivos en el
              momento de su publicación en el sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Contacto</h2>
            <p>
              Si tienes alguna pregunta sobre esta política de privacidad, no dudes en contactarnos a través del correo
              electrónico:{" "}
              <a href="mailto:contacto@mirinconescondido.com" className="underline decoration-green-350 underline-offset-4">
                contacto@mirinconescondido.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}