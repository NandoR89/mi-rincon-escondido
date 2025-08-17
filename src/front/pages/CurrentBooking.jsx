import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { getCurrentBooking } from "../services/book"
import { calculateNights, calculateTotalStayCost } from "../tools/utilFunctions"

export const CurrentBooking = () => {
  const { id } = useParams()
  const { store, dispatch } = useGlobalReducer()
  const currentBooking = store.bookingsDetail.find(b => b.id === parseInt(id))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentBooking = async bookingId => {
      if (!bookingId) {
        setLoading(false)
        return
      }
      try {
        const data = await getCurrentBooking(bookingId)
        dispatch({ type: "currentBooking", payload: data })
      } catch (err) {
        if (err.message?.includes("Sesión expirada")) {
          dispatch({ type: "logout" })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCurrentBooking(id)
  }, [id, dispatch])

  if (loading) {
    return (
      <div className="bg-hero text-white">
        <div className="min-h-[100svh] flex items-center justify-center p-6">
          <div className="mx-auto max-w-md w-full rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-6 text-center shadow-2xl">
            Cargando detalles de la reserva...
          </div>
        </div>
      </div>
    )
  }

  if (!currentBooking) {
    return (
      <div className="bg-hero text-white">
        <div className="min-h-[100svh] flex items-center justify-center p-6">
          <div className="mx-auto max-w-md w-full rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 p-6 text-center shadow-2xl">
            No se encontró la reserva
          </div>
        </div>
      </div>
    )
  }

  const hutName = currentBooking.hut_to?.name || "Cabaña sin nombre"
  const total = calculateTotalStayCost(
    currentBooking.hut_to.price_per_night,
    calculateNights(currentBooking.start_date, currentBooking.end_date)
  )

  return (
    <div className="bg-hero text-white bg-black/50">
      <div className="min-h-[100svh] p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/10 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-brown-550 to-green-450 px-6 py-5">
            <h2 className="text-2xl font-semibold">Reserva #{currentBooking.id}</h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            <ul className="space-y-4 text-sm sm:text-base">
              <li className="flex justify-between gap-4 pb-3 border-b border-white/10">
                <span className="font-semibold text-white/90">Cabaña</span>
                <span className="text-right min-w-[50%]">
                  <span className="block font-medium">{hutName}</span>
                  <span className="flex flex-col text-white/70 text-xs">
                    <span>{currentBooking.hut_to.location_to.complex}</span>
                    <span>{currentBooking.hut_to.location_to.address}</span>
                    <span>{currentBooking.hut_to.location_to.city}</span>
                  </span>
                </span>
              </li>

              <li className="flex justify-between gap-4 pb-3 border-b border-white/10">
                <span className="font-semibold text-white/90">Fecha de entrada</span>
                <span className="text-white/90">
                  {new Date(currentBooking.start_date).toLocaleDateString("es-ES")}
                </span>
              </li>

              <li className="flex justify-between gap-4 pb-3 border-b border-white/10">
                <span className="font-semibold text-white/90">Fecha de salida</span>
                <span className="text-white/90">
                  {new Date(currentBooking.end_date).toLocaleDateString("es-ES")}
                </span>
              </li>

              <li className="flex justify-between gap-4 pb-3 border-b border-white/10">
                <span className="font-semibold text-white/90">Huéspedes</span>
                <span className="text-white/90">{currentBooking.guests}</span>
              </li>

              <li className="flex justify-between gap-4 pb-3 border-b border-white/10">
                <span className="font-semibold text-white/90">Importe total</span>
                <span className="font-bold">{total} €</span>
              </li>

              <li className="flex justify-between gap-4 pb-3 border-b border-white/10">
                <span className="font-semibold text-white/90">Solicitudes especiales</span>
                <span className="text-white/90">{currentBooking.special_requests || "Ninguna"}</span>
              </li>

              <li className="flex justify-between gap-4 pb-1">
                <span className="font-semibold text-white/90">Estado de la reserva</span>
                <span className="text-white/90">
                  {currentBooking.status_reserved === "active" ? "✅ Confirmado" : "⚠ Pendiente"}
                </span>
              </li>
            </ul>
          </div>

          <div className="px-6 py-4 bg-white/5">
            {store.currentUser?.is_admin ? (
              <div className="flex justify-center">
                <Link
                  to="/bookings"
                  className="bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-250 text-center px-5 py-2 text-white hover:scale-[1.02] transition"
                >
                  Volver a Reservas
                </Link>
              </div>
            ) : (
              <div className="flex justify-center">
                <Link
                  to="/bookings"
                  className="bg-gradient-to-br from-brown-250 to-green-250 rounded-3xl border border-brown-250 text-center px-5 py-2 text-white hover:scale-[1.02] transition"
                >
                  Volver a Mis Reservas
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}