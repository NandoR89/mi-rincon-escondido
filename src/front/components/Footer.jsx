import { Link } from "react-router-dom"

export const Footer = () => {

	const linkHover =
		"px-3 py-1 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-green-200 hover:ring-1 hover:ring-green-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60"

	const iconHover =
		"p-2 rounded-full transition-all duration-200 hover:bg-white/10 hover:text-green-200 hover:ring-1 hover:ring-green-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60"

	return (
		<footer className="bg-black/90 text-white">
			<div className="mx-auto max-w-7xl px-4 py-6">
				<div className="h-px w-full bg-gradient-to-r from-transparent via-white/60 to-transparent mb-6" />

				<div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
					<Link to="/" className="inline-flex items-center gap-3 hover:opacity-90 transition">
						<svg className="shrink-0" width="28" height="28" viewBox="0 0 479 479" fill="currentColor">
							<path d="M394.902,95.52L242.667,0.904c-1.939-1.205-4.395-1.205-6.334,0L84.097,95.52c-1.762,1.095-2.833,3.021-2.833,5.096v26.004 c0,2.179,1.181,4.186,3.085,5.244c1.903,1.06,4.232,1.002,6.082-0.148l7.703-4.788v196.231c0,3.313,2.687,6,6,6h4.642v24.653 c0,3.313,2.687,6,6,6h19.082V473c0,3.313,2.687,6,6,6h22.754c3.313,0,6-2.687,6-6v-50.77l62.407-62.418h16.959l62.407,62.418V473 c0,3.313,2.687,6,6,6h22.754c3.313,0,6-2.687,6-6V359.812h19.082c3.313,0,6-2.687,6-6v-24.653h4.642c3.313,0,6-2.687,6-6V126.927 l7.704,4.788c0.968,0.602,2.066,0.904,3.167,0.904c1.003,0,2.008-0.251,2.915-0.756c1.904-1.059,3.085-3.065,3.085-5.244v-26.004 C397.735,98.542,396.664,96.615,394.902,95.52z" />
						</svg>
						<span className="text-lg font-semibold tracking-wide">Mi Rincón Escondido</span>
					</Link>

					<nav className="flex flex-wrap items-center justify-center gap-3 text-sm">
						<Link to="/huts" className={linkHover}>Cabañas</Link>
						<Link to="/contact" className={linkHover}>Contacto</Link>
						<Link to="/termsandconditions" className={linkHover}>Términos</Link>
						<Link to="/privacyandpolicy" className={linkHover}>Privacidad</Link>
					</nav>

					<div className="flex flex-col items-end justify-end gap-2 min-w-[116px]">
						<a href="mailto:contacto@mirinconescondido.com"
							className="px-3 py-1 rounded-lg text-sm bg-white/10 hover:bg-white/15 ring-1 ring-white/10 hover:ring-white/20 transition">
							contacto@mirinconescondido.com
						</a>
						<a href="tel:+34123456789"
							className="px-3 py-1 rounded-lg text-sm bg-white/10 hover:bg-white/15 ring-1 ring-white/10 hover:ring-white/20 transition">
							+34 123 456 789
						</a>
					</div>
				</div>

				<div className="mt-6 text-center text-xs text-white/70">
					Mi Rincón Escondido · Proyecto para 4GEEKS ACADEMY
				</div>
			</div>
		</footer>
	)
}