import { useEffect, useState } from "react"

function CarritoDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const [items, setItems] = useState([])

    const cargarCarrito = () => {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || []
        setItems(carrito)
    }

    useEffect(() => {
        cargarCarrito()

        // Escuchar cuando se abre manualmente o cuando se añade un producto
        const abrirCarrito = () => {
            cargarCarrito()
            setIsOpen(true)
        }

        window.addEventListener("abrirCarrito", abrirCarrito)
        window.addEventListener("cambioCarrito", cargarCarrito) // Mantener sincronizado

        return () => {
            window.removeEventListener("abrirCarrito", abrirCarrito)
            window.removeEventListener("cambioCarrito", cargarCarrito)
        }
        if (isOpen) {
            document.body.style.overflow = "hidden" // Bloquea el scroll de la web
        } else {
            document.body.style.overflow = "unset"  // Libera el scroll al cerrar
        }

        return () => {
            document.body.style.overflow = "unset" // Limpieza preventiva
            // ... tus removeEventListener ...
        }
    }, [isOpen])

    const eliminarItem = (index) => {
        let nuevoCarrito = [...items]
        nuevoCarrito.splice(index, 1)
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito))

        // Sincronizar estados globales
        setItems(nuevoCarrito)
        window.dispatchEvent(new Event("cambioCarrito"))
    }

    const total = items.reduce((acc, item) => acc + Number(item.precio), 0)

    return (
        <>
            {/* Backdrop (Fondo oscuro difuminado) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Contenedor Lateral */}
            <div className={`fixed top-0 right-0 h-screen w-full sm:w-[440px] bg-white z-[101] shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${isOpen ? "translate-x-0" : "translate-x-full"
                }`}>

                {/* Cabecera del Carrito */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-gray-900">
                        Bolsa de Compras ({items.length})
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-black transition-colors p-1"
                    >
                        <svg className="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Lista de productos (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-2 pb-20">
                            <p className="text-xs uppercase tracking-widest text-gray-400">Tu bolsa está vacía</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] uppercase tracking-wider text-black underline underline-offset-4"
                            >
                                Continuar mirando
                            </button>
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start border-b border-gray-50 pb-4">
                                <div className="w-20 aspect-[3/4] bg-gray-50 overflow-hidden flex-shrink-0">
                                    <img src={item.imgs?.[0] || item.imagen} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-1">
                                    <div>
                                        <h3 className="text-xs uppercase tracking-wider text-gray-900 truncate font-medium">{item.marca}</h3>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">Talla: {item.tallaElegida || 'U'}</p>
                                    </div>
                                    <div className="flex justify-between items-baseline pt-2">
                                        <p className="text-xs font-semibold text-gray-900">S/ {Number(item.precio).toFixed(2)}</p>
                                        <button
                                            onClick={() => eliminarItem(index)}
                                            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Fijo con Totales y Botón de Checkout */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Subtotal</span>
                            <span className="text-base font-semibold text-gray-900">S/ {total.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                            Los costos de envío y descuentos aplicables se gestionarán en el siguiente paso.
                        </p>
                        <button
                            onClick={() => {
                                // Redirección al checkout o pasarela directa por WhatsApp si lo deseas
                                window.location.href = `https://wa.me/51965856201?text=Hola!%20Me%20interesa%20comprar%20estos%20productos%20de%20la%20Boutique.`
                            }}
                            className="w-full py-4 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-zinc-800 transition-colors duration-300"
                        >
                            Procesar Pedido
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default CarritoDrawer