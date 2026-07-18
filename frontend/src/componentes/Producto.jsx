import { useState } from "react"

function Producto({ producto }) {
    const [hovered, setHovered] = useState(false)
    const tieneMultiplesImgs = producto.imgs && producto.imgs.length > 1

    // Controlamos el hover por JS de forma segura
    const handleMouseEnter = () => {
        // window.matchMedia analiza si el dispositivo soporta hover real (PC)
        if (window.matchMedia("(hover: hover)").matches) {
            setHovered(true)
        }
    }

    const handleMouseLeave = () => {
        setHovered(false)
    }

    const imagenAMostrar = (hovered && tieneMultiplesImgs) ? producto.imgs[1] : producto.imgs[0]

    return (
        <div
            className="group bg-white flex flex-col transition-all duration-300 pb-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Contenedor de Imagen Limpio */}
            <div className="relative overflow-hidden aspect-[3/4] bg-gray-50 mb-3">
                <img
                    src={imagenAMostrar}
                    /* 
                       🔥 TRUCO CON TAILWIND: 
                       Usamos 'md:group-hover:scale-105' para que el zoom sutil 
                       en la foto ocurra ÚNICAMENTE en ordenadores.
                    */
                    className="w-full h-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-105"
                    alt={producto.marca}
                />
            </div>

            {/* Información del Producto - Estilo Minimalista y Editorial */}
            <div className="flex justify-between items-baseline gap-2 w-full px-1">
                <h2 className="font-medium text-gray-900 text-[11px] sm:text-xs tracking-wider uppercase truncate max-w-[70%]">
                    {producto.marca}
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-900 tracking-wide flex-shrink-0">
                    S/ {Number(producto.precio).toFixed(2)}
                </p>
            </div>
        </div>
    )
}

export default Producto