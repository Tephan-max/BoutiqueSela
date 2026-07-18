import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import Cabecera from "./Cabecera" // Ajusta la ruta según tus carpetas

function DetalleProducto() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const idProducto = searchParams.get("id")

    const [producto, setProducto] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [imagenSeleccionada, setImagenSeleccionada] = useState(0)
    const [tallaSeleccionada, setTallaSeleccionada] = useState("")
    const [errorTalla, setErrorTalla] = useState(false)
    const [agregado, setAgregado] = useState(false)

    useEffect(() => {
        if (!idProducto) {
            navigate("/")
            return
        }

        const obtenerDetalle = async () => {
            try {
                const res = await fetch(`https://boutiquesela.onrender.com/productos`)
                const data = await res.json()
                // Buscamos el producto específico en el array devuelto por tu API
                const encontrado = data.data.find(p => p._id === idProducto)

                if (encontrado) {
                    setProducto(encontrado)
                } else {
                    navigate("/")
                }
            } catch (error) {
                console.error("Error al obtener el producto:", error)
            } finally {
                setCargando(false)
            }
        }

        obtenerDetalle()
    }, [idProducto, navigate])

    const manejarAgregarCarrito = () => {
        // Validación de talla (Paso crucial para ropa/calzado)
        if (!tallaSeleccionada && producto.categoria !== "Accesorios o Complementos") {
            setErrorTalla(true)
            return
        }

        let carrito = JSON.parse(localStorage.getItem("carrito")) || []

        // Creamos el objeto guardando la talla elegida por el cliente
        const productoParaCarrito = {
            ...producto,
            tallaElegida: tallaSeleccionada || "U"
        }

        carrito.push(productoParaCarrito)
        localStorage.setItem("carrito", JSON.stringify(carrito))

        // Notificamos a la Cabecera para que actualice el contador al instante
        window.dispatchEvent(new Event("cambioCarrito"))

        // Efecto visual de éxito en el botón
        setAgregado(true)
        setTimeout(() => setAgregado(false), 2000)
        // Dentro de manejarAgregarCarrito en DetalleProducto:
        window.dispatchEvent(new Event("cambioCarrito"))

        // 🔥 AÑADE ESTA LÍNEA JUSTO ABAJO PARA QUE SE DESLICE SOLO AL COMPRAR:
        window.dispatchEvent(new Event("abrirCarrito"))
    }

    if (cargando) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Cargando pieza...</p>
            </div>
        )
    }

    if (!producto) return null

    const tieneMultiplesImgs = producto.imgs && producto.imgs.length > 0
    const imagenes = tieneMultiplesImgs ? producto.imgs : ["https://via.placeholder.com/600x800"]
    // Array simulado de tallas premium. Si tu API ya trae tallas, puedes reemplazarlo por producto.tallas
    const listaTallas = producto.categoria === "Calzado" ? ["36", "37", "38", "39"] : ["S", "M", "L"]

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans antialiased pb-20">
            <Cabecera paths={[
                { ruta: '/contacto', texto: 'Contacto' },
                { ruta: '/carrito', texto: 'Carrito' }
            ]} />

            <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 md:pt-16">
                {/* Botón de retorno sutil */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black mb-8 transition-colors duration-200"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Volver al catálogo</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">

                    {/* COLUMNA IZQUIERDA: SISTEMA DE IMÁGENES (7 de 12 columnas) */}
                    <div className="md:col-span-7 flex flex-col-reverse sm:flex-row gap-3">

                        {/* Lista de Miniaturas Laterales (Escondido en móviles pequeños si es incómodo, deslizable) */}
                        {imagenes.length > 1 && (
                            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible justify-start flex-shrink-0 sm:w-16">
                                {imagenes.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setImagenSeleccionada(index)}
                                        className={`w-14 h-20 sm:w-full aspect-[3/4] bg-gray-50 overflow-hidden border transition-all duration-200 flex-shrink-0 ${imagenSeleccionada === index ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Contenedor Imagen Principal */}
                        <div className="w-full bg-gray-50 aspect-[3/4] overflow-hidden relative">
                            <img
                                src={imagenes[imagenSeleccionada]}
                                className="w-full h-full object-cover transition-all duration-500"
                                alt={producto.marca}
                            />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: SECCIÓN EDITORIAL E INFORMACIÓN (5 de 12 columnas) */}
                    <div className="md:col-span-5 flex flex-col space-y-6 md:sticky md:top-28">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-1">
                                {producto.categoria}
                            </span>
                            <h1 className="text-xl md:text-2xl font-light tracking-wider text-gray-900 uppercase">
                                {producto.marca}
                            </h1>
                            <p className="text-base font-semibold text-gray-950 mt-2 tracking-wide">
                                S/ {Number(producto.precio).toFixed(2)}
                            </p>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Descripción simulada / Detalles de calidad de la prenda */}
                        <p className="text-xs text-gray-500 leading-relaxed font-light">
                            Pieza de alta calidad seleccionada meticulosamente para nuestra colección actual. Acabados premium estructurados ideales para elevar cualquier look contemporáneo.
                        </p>

                        {/* SECTOR DE TALLAS (Solo si no es accesorio) */}
                        {producto.categoria !== "Accesorios o Complementos" && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                                        Seleccionar Talla
                                    </span>
                                    {errorTalla && (
                                        <span className="text-[10px] text-red-500 font-medium">
                                            Por favor, elige una talla
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {listaTallas.map((talla) => (
                                        <button
                                            key={talla}
                                            onClick={() => {
                                                setTallaSeleccionada(talla)
                                                setErrorTalla(false)
                                            }}
                                            className={`w-10 h-10 text-xs tracking-wider transition-all duration-200 border flex items-center justify-center ${tallaSeleccionada === talla
                                                    ? "bg-black text-white border-black"
                                                    : "bg-white text-gray-900 border-gray-200 hover:border-black"
                                                }`}
                                        >
                                            {talla}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* BOTÓN PRINCIPAL DE COMPRA */}
                        <div className="pt-4">
                            <button
                                onClick={manejarAgregarCarrito}
                                className={`w-full py-4 text-xs uppercase tracking-[0.2em] transition-all duration-300 font-medium border ${agregado
                                        ? "bg-emerald-900 text-white border-emerald-900"
                                        : "bg-black text-white border-black hover:bg-zinc-800"
                                    }`}
                            >
                                {agregado ? "Añadido con éxito" : "Añadir a la bolsa"}
                            </button>
                        </div>

                        {/* DETALLES DE ENVÍO MINIMALISTAS */}
                        <div className="bg-gray-50 p-4 space-y-2 text-[11px] text-gray-500 font-light tracking-wide">
                            <div className="flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                <p>Envíos inmediatos a todo el Perú de 24 a 48 horas.</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                <p>Garantía boutique de satisfacción en cada prenda.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

export default DetalleProducto