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

        const abrirCarrito = () => {
            cargarCarrito()
            setIsOpen(true)
        }

        window.addEventListener("abrirCarrito", abrirCarrito)
        window.addEventListener("cambioCarrito", cargarCarrito)

        return () => {
            window.removeEventListener("abrirCarrito", abrirCarrito)
            window.removeEventListener("cambioCarrito", cargarCarrito)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            // 🔥 OPTIMIZACIÓN: Evita que el fondo "tiemble" al calcular el ancho exacto del scrollbar
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
            document.body.style.overflow = "hidden"
            document.body.style.paddingRight = `${scrollbarWidth}px`
        } else {
            document.body.style.overflow = "unset"
            document.body.style.paddingRight = "0px"
        }

        return () => {
            document.body.style.overflow = "unset"
            document.body.style.paddingRight = "0px"
        }
    }, [isOpen])

    const guardarCarrito = (nuevoCarrito) => {
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito))
        setItems(nuevoCarrito)
        window.dispatchEvent(new Event("cambioCarrito"))
    }

    // ⚡ CORRECCIÓN: Ahora filtramos y editamos buscando por idUnico en vez de confiar en índices volátiles
    const eliminarItem = (idUnico) => {
        const nuevoCarrito = items.filter(item => item.idUnico !== idUnico)
        guardarCarrito(nuevoCarrito)
    }

    const incrementarCantidad = (idUnico) => {
        const nuevoCarrito = items.map(item => {
            if (item.idUnico === idUnico) {
                if (item.stockMaximo && item.cantidad >= item.stockMaximo) return item
                return { ...item, cantidad: item.cantidad + 1 }
            }
            return item
        })
        guardarCarrito(nuevoCarrito)
    }

    const decrementarCantidad = (idUnico) => {
        let nuevoCarrito = items.map(item => {
            if (item.idUnico === idUnico) {
                return { ...item, cantidad: item.cantidad - 1 }
            }
            return item
        }).filter(item => item.cantidad > 0) // Si llega a 0 se elimina automáticamente de la lista
        
        guardarCarrito(nuevoCarrito)
    }

    const total = items.reduce((acc, item) => acc + (Number(item.precio) * (item.cantidad || 1)), 0)

    const generarMensajePedido = () => {
        let mensaje = "¡Hola Boutique Sela! Quiero hacer un pedido:\n\n"

        items.forEach((item) => {
            mensaje += `• ${item.marca} - Talla ${item.talla || 'U'} - Cantidad: ${item.cantidad || 1} - S/ ${(Number(item.precio) * (item.cantidad || 1)).toFixed(2)}\n`
        })

        mensaje += `\nTotal: S/ ${total.toFixed(2)}\n\n¿Está disponible para coordinar la entrega?`

        return encodeURIComponent(mensaje)
    }

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Panel del Drawer */}
            <div className={`fixed top-0 right-0 h-screen w-full sm:w-[440px] bg-white z-[101] shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${
                isOpen ? "translate-x-0" : "translate-x-full"
            }`}>

                {/* Cabecera del Drawer */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-gray-900">
                        Bolsa de Compras ({items.length})
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-black transition-colors p-1 cursor-pointer"
                    >
                        <svg className="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Lista de productos */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-2 pb-20">
                            <p className="text-xs uppercase tracking-widest text-gray-400">Tu bolsa está vacía</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] uppercase tracking-wider text-black underline underline-offset-4 cursor-pointer"
                            >
                                Continuar mirando
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            // 🔥 CORRECCIÓN: idUnico garantiza que React modifique exactamente la fila correcta
                            <div key={item.idUnico} className="flex gap-4 items-start border-b border-gray-50 pb-4">
                                <div className="w-20 aspect-[3/4] bg-gray-50 overflow-hidden flex-shrink-0 rounded-lg border border-gray-100">
                                    <img src={item.img || item.imgs?.[0]} className="w-full h-full object-cover" alt={item.marca} />
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2">
                                    <div>
                                        <h3 className="text-xs uppercase tracking-wider text-gray-900 truncate font-medium">{item.marca}</h3>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">
                                            Talla: {item.talla || 'U'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                            <button
                                                onClick={() => decrementarCantidad(item.idUnico)}
                                                className="px-2.5 py-1 text-xs hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                                            >
                                                —
                                            </button>
                                            <span className="px-3 py-1 text-[11px] font-medium w-8 text-center bg-gray-50/30">
                                                {item.cantidad || 1}
                                            </span>
                                            <button
                                                onClick={() => incrementarCantidad(item.idUnico)}
                                                disabled={item.stockMaximo ? item.cantidad >= item.stockMaximo : false}
                                                className="px-2.5 py-1 text-xs hover:bg-gray-50 transition-colors disabled:opacity-30 font-medium cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => eliminarItem(item.idUnico)}
                                            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                        >
                                            Quitar
                                        </button>
                                    </div>

                                    <p className="text-xs font-semibold text-gray-900">
                                        S/ {(Number(item.precio) * (item.cantidad || 1)).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer de totales fijo abajo */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Subtotal</span>
                            <span className="text-base font-semibold text-gray-900">S/ {total.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                            Los costos de envío y descuentos aplicables se gestionarán en el siguiente paso.
                        </p>
                        <a
                            href={`https://wa.me/51965856201?text=${generarMensajePedido()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-4 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-zinc-800 transition-colors duration-300 text-center"
                        >
                            Procesar Pedido
                        </a>
                    </div>
                )}
            </div>
        </>
    )
}

export default CarritoDrawer