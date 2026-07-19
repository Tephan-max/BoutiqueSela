import { useEffect, useState } from "react"

function CarritoDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const [items, setItems] = useState([])
    const [validando, setValidando] = useState(false)

    const cargarCarrito = async () => {
        const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || []

        if (carritoGuardado.length === 0) {
            setItems([])
            return
        }

        setValidando(true)

        try {
            const res = await fetch('https://boutiquesela.onrender.com/productos')
            const data = await res.json()
            const productosActuales = data.data || []

            const carritoValidado = carritoGuardado
                .map(item => {
                    const productoActual = productosActuales.find(p => p._id === item._id)

                    if (!productoActual) return null

                    const inventarioItem = productoActual.inventario?.find(inv => inv.talla === item.talla)

                    if (!inventarioItem || inventarioItem.stock === 0) return null

                    const itemActualizado = {
                        ...item,
                        marca: productoActual.marca,
                        precio: productoActual.precio,
                        img: productoActual.imgs?.[0] || item.img,
                        stockMaximo: inventarioItem.stock
                    }

                    if (item.cantidad > inventarioItem.stock) {
                        itemActualizado.cantidad = inventarioItem.stock
                    }

                    return itemActualizado
                })
                .filter(item => item !== null)

            localStorage.setItem("carrito", JSON.stringify(carritoValidado))
            setItems(carritoValidado)

            window.dispatchEvent(new Event("cambioCarrito"))
        } catch (error) {
            console.error("Error al validar el carrito:", error)
            setItems(carritoGuardado)
        } finally {
            setValidando(false)
        }
    }

    useEffect(() => {
        cargarCarrito()

        const abrirCarrito = () => {
            cargarCarrito()
            setIsOpen(true)
        }

        const sincronizar = () => {
            const carrito = JSON.parse(localStorage.getItem("carrito")) || []
            setItems(carrito)
        }

        window.addEventListener("abrirCarrito", abrirCarrito)
        window.addEventListener("cambioCarrito", sincronizar)

        return () => {
            window.removeEventListener("abrirCarrito", abrirCarrito)
            window.removeEventListener("cambioCarrito", sincronizar)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }

        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    const guardarCarrito = (nuevoCarrito) => {
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito))
        setItems(nuevoCarrito)
        window.dispatchEvent(new Event("cambioCarrito"))
    }

    const eliminarItem = (index) => {
        let nuevoCarrito = [...items]
        nuevoCarrito.splice(index, 1)
        guardarCarrito(nuevoCarrito)
    }

    const incrementarCantidad = (index) => {
        let nuevoCarrito = [...items]
        const stockMaximo = nuevoCarrito[index].stockMaximo

        if (stockMaximo && nuevoCarrito[index].cantidad >= stockMaximo) return

        nuevoCarrito[index].cantidad += 1
        guardarCarrito(nuevoCarrito)
    }

    const decrementarCantidad = (index) => {
        let nuevoCarrito = [...items]

        if (nuevoCarrito[index].cantidad <= 1) {
            nuevoCarrito.splice(index, 1)
        } else {
            nuevoCarrito[index].cantidad -= 1
        }

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
            <div
    className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}
    onClick={() => setIsOpen(false)}
/>

            <div className={`fixed top-0 right-0 h-screen w-full sm:w-[440px] bg-white z-[101] shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${isOpen ? "translate-x-0" : "translate-x-full"
                }`}>

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

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    {validando ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3">
                            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Verificando disponibilidad...</p>
                        </div>
                    ) : items.length === 0 ? (
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
                                    <img src={item.img || item.imgs?.[0]} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2">
                                    <div>
                                        <h3 className="text-xs uppercase tracking-wider text-gray-900 truncate font-medium">{item.marca}</h3>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">
                                            Talla: {item.talla || 'U'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => decrementarCantidad(index)}
                                                className="px-2.5 py-1 text-xs hover:bg-gray-50 transition-colors font-medium"
                                            >
                                                —
                                            </button>
                                            <span className="px-3 py-1 text-[11px] font-medium w-8 text-center">
                                                {item.cantidad || 1}
                                            </span>
                                            <button
                                                onClick={() => incrementarCantidad(index)}
                                                disabled={item.stockMaximo ? item.cantidad >= item.stockMaximo : false}
                                                className="px-2.5 py-1 text-xs hover:bg-gray-50 transition-colors disabled:opacity-30 font-medium"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => eliminarItem(index)}
                                            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
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
                                window.location.href = `https://wa.me/51965856201?text=${generarMensajePedido()}`
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