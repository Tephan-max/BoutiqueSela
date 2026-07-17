import { useEffect, useState } from "react"

function ProductoCarrito({ producto, flecha, eliminarProducto }) {

    const [posicion, setPosicion] = useState(0)

    useEffect(() => {
        const tamañoImagenes = producto.imgs.length
        if (posicion >= tamañoImagenes) {
            setPosicion(tamañoImagenes - 1)
        }
    }, [producto.imgs.length])

    const cambioImagen = (direccion) => {
        const cantidadImagenes = producto.imgs.length

        if (cantidadImagenes > 1) {
            if (direccion == 1) {
                if (posicion + 1 < cantidadImagenes) {
                    setPosicion(posicion + 1)
                } else {
                    setPosicion(0)
                }
            } else {
                if (posicion - 1 >= 0) {
                    setPosicion(posicion - 1)
                } else {
                    setPosicion(cantidadImagenes - 1)
                }
            }
        }
    }

    return (
        <>
            <div
                className="group bg-white flex flex-col justify-between border-b border-gray-100 pb-6 md:border-b-0 md:pb-0"
            >
                {/* Contenedor de Imagen (Aspecto 3:4 idéntico al catálogo) */}
                <div className="relative overflow-hidden aspect-[4/4] bg-gray-50">
                    <img
                        src={producto.imgs[posicion]}
                        className="w-full h-full transition-transform duration-700 group-hover:scale-102"
                        alt={producto.marca}
                    />

                    {/* Flechas de navegación adaptadas al estilo Zara */}
                    {producto.imgs.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={() => cambioImagen(-1)}
                                className="w-8 h-8 bg-white/95 hover:bg-white flex items-center justify-center border border-gray-200 cursor-pointer transition-transform active:scale-95"
                            >
                                <img className="w-3.5 h-3.5 rotate-180 opacity-60" src={flecha} alt="Anterior" />
                            </button>

                            <button
                                onClick={() => cambioImagen(1)}
                                className="w-8 h-8 bg-white/95 hover:bg-white flex items-center justify-center border border-gray-200 cursor-pointer transition-transform active:scale-95"
                            >
                                <img className="w-3.5 h-3.5 opacity-60" src={flecha} alt="Siguiente" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Detalles del producto en el carrito */}
                <div className="pt-4 flex flex-col flex-grow justify-between text-center">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 text-xs tracking-wider uppercase">
                            {producto.marca}
                        </h3>
                        <p className="text-[10px] text-gray-400 tracking-widest uppercase">
                            TALLA {producto.talla}
                        </p>
                        <p className="text-xs font-bold text-gray-900 pt-1 tracking-wide">
                            S/ {Number(producto.precio).toFixed(2)}
                        </p>
                    </div>

                    {/* Botón de eliminar elegante y sutil en lugar de rojo chillón */}
                    <button
                        onClick={() => eliminarProducto()}
                        className="mt-5 w-full bg-transparent hover:bg-red-50 text-red-500 border border-red-100 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors duration-200 cursor-pointer"
                    >
                        Quitar artículo
                    </button>
                </div>
            </div>
        </>
    )
}

export default ProductoCarrito