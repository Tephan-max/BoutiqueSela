import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import CarritoDrawer from "./CarritoDrawer" 

function Cabecera({ paths }) {
    const navigate = useNavigate()
    const [cantidadCarrito, setCantidadCarrito] = useState(0)

    const calcularCantidad = () => {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || []
        const totalUnidades = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0)
        setCantidadCarrito(totalUnidades)
    }

    useEffect(() => {
        calcularCantidad()
        window.addEventListener("storage", calcularCantidad)
        window.addEventListener("cambioCarrito", calcularCantidad)

        return () => {
            window.removeEventListener("storage", calcularCantidad)
            window.removeEventListener("cambioCarrito", calcularCantidad)
        }
    }, [])

    return (
        <>
            <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
                    
                    {/* Logo */}
                    <div onClick={() => navigate('/')} className="cursor-pointer select-none text-left">
                        <h1 className="font-light text-xl md:text-2xl tracking-[0.25em] uppercase text-gray-900 transition-opacity hover:opacity-80">
                            Boutique Sela
                        </h1>
                    </div>

                    {/* Navegación */}
                    <nav className="flex gap-6 items-center justify-end">
                        {paths?.map((path) => {
                            // Caso 1: Enlace externo a WhatsApp (Contacto)
                            if (path.ruta === "/contacto") {
                                return (
                                    <a
                                        key={path.ruta}
                                        href="https://wa.me/51965856201"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500 hover:text-black transition-colors duration-300 py-1 group"
                                    >
                                        {path.texto}
                                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
                                    </a>
                                )
                            }

                            // Caso 2: Botón disparador del Carrito Drawer
                            if (path.ruta === "/carrito") {
                                return (
                                    <button
                                        key={path.ruta}
                                        onClick={() => window.dispatchEvent(new Event("abrirCarrito"))} 
                                        className="relative p-2 text-gray-500 hover:text-black transition-colors duration-300 group flex items-center cursor-pointer"
                                        aria-label="Ver carrito"
                                    >
                                        <svg className="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>

                                        {cantidadCarrito > 0 && (
                                            /* 🌟 CORRECCIÓN: 'min-w-[18px]' y 'px-1' evita deformaciones cuando la cantidad pasa a 10+ unidades */
                                            <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] font-bold min-w-[18px] h-4.5 rounded-full flex items-center justify-center scale-90 px-1 transition-all select-none">
                                                {cantidadCarrito}
                                            </span>
                                        )}
                                    </button>
                                )
                            }

                            // Caso 3: Soporte para rutas internas estándar (p. ej., Catálogo, Nosotros)
                            return (
                                <Link
                                    key={path.ruta}
                                    to={path.ruta}
                                    className="relative text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500 hover:text-black transition-colors duration-300 py-1 group"
                                >
                                    {path.texto}
                                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </header>

            {/* Instancia única global del Drawer */}
            <CarritoDrawer />
        </>
    )
}

export default Cabecera