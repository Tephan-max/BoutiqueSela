import { useEffect, useState } from "react"

function Producto({producto, flecha, agregarAlCarrito }) {

    const [posicion, setPosicion] = useState(0)

    useEffect(() => {
        setPosicion(0)
    }, [producto.imgs?.length])

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
                className="group bg-white flex flex-col justify-between transition-all duration-300 border-b border-gray-100 pb-6 md:border-b-0 md:pb-0"
            >
                {/* Contenedor de Imagen con proporción editorial (3:4) */}
                <div className="relative overflow-hidden aspect-[4/4] bg-gray-50">
                    <img
                        src={producto.imgs[posicion]}
                        className="w-full h-full transition-transform duration-700 group-hover:scale-102"
                        alt={producto.marca}
                    />

                    {/* Flechas de navegación para imágenes múltiples */}
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

                {/* Información del Producto alineada y espaciada */}
                <div className="pt-4 flex flex-col flex-grow justify-between text-center">
                    <div className="space-y-1">
                        <h2 className="font-semibold text-gray-900 text-xs tracking-wider uppercase">
                            {producto.marca}
                        </h2>
                        <p className="text-[10px] text-gray-400 tracking-widest uppercase">
                            TALLA {producto.talla}
                        </p>
                        <p className="text-xs font-bold text-gray-900 pt-1 tracking-wide">
                            S/ {Number(producto.precio).toFixed(2)}
                        </p>
                    </div>

                    {/* Botón de Añadir sólido, plano y minimalista */}
                    <button
                        className="mt-5 w-full bg-black text-white py-3.5 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors duration-300 cursor-pointer active:scale-99"
                        onClick={() => agregarAlCarrito()}
                    >
                        Añadir al carrito
                    </button>
                </div>
            </div>
        </>
    )
}

export default Producto