import { useState, useEffect } from "react"
import Cabecera from "./componentes/Cabecera"
import flecha from './imagenes/flecha.png'

function Carrito() {
    const [productos, setProductos] = useState(
        JSON.parse(localStorage.getItem('carrito')) || []
    )

    const [total, setTotal] = useState(0)

    useEffect(() => {
        const listaPrecio = productos.map(producto => producto.precio)
        const total = listaPrecio.reduce((acc, num) => acc + num, 0)

        setTotal(total)
    }, [productos])

    useEffect(() => {
        window.addEventListener('storage', () => {
            setProductos(
                JSON.parse(localStorage.getItem('carrito')) || []
            )
        })
    }, [])

    const eliminarProducto = (index) => {
        let copiaProductos = [...productos]
        copiaProductos.splice(index, 1)

        localStorage.setItem('carrito', JSON.stringify(copiaProductos))

        setProductos(copiaProductos)
    }

    const cambioImagen = (index, direccion) => {
        let productosMostrarConImagenActualizada = [...productos]
        const producto = productosMostrarConImagenActualizada[index]
        const imagenes = producto.imgs
        const posicionImagen = producto.posicionImagen
        const cantidadImagenes = imagenes.length

        if (cantidadImagenes > 1) {
            if (direccion == 1) {
                if (posicionImagen + 1 < cantidadImagenes) {
                    productosMostrarConImagenActualizada[index].posicionImagen++
                } else {
                    productosMostrarConImagenActualizada[index].posicionImagen = 0
                }
            } else {
                if (posicionImagen - 1 >= 0) {
                    productosMostrarConImagenActualizada[index].posicionImagen--
                } else {
                    productosMostrarConImagenActualizada[index].posicionImagen = cantidadImagenes - 1
                }
            }
        }
        setProductos(productosMostrarConImagenActualizada)
    }

    const consultarProductos = () => {
        const mensajeConsultaProductos =
            "Buenas, estoy interesado en comprar estos productos:\n\n" +
            productos
                .map(producto =>
                    `Categoria: ${producto.categoria}\nMarca: ${producto.marca}\nTalla: ${producto.talla}\nPrecio: S/ ${producto.precio}\n`
                )
                .join("\n");

        window.open(
            `https://wa.me/51965856201?text=${encodeURIComponent(mensajeConsultaProductos)}`,
            "_blank"
        );
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
            <Cabecera paths={[
                { ruta: '/contacto', texto: 'Contacto' },
                { ruta: '/', texto: 'Catalogo' }
            ]} />

            {/* Total acumulado - Flotante elegante en la esquina derecha */}
            {productos.length > 0 && (
                <div className="sticky top-20 md:top-24 z-40 flex justify-end w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 border border-gray-100 shadow-sm flex items-center gap-2 pointer-events-auto">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total:</span>
                        <span className="text-sm font-bold tracking-wide">S/ {Number(total).toFixed(2)}</span>
                    </div>
                </div>
            )}

            {productos.length === 0 ? (
                <div className="text-center py-32 max-w-7xl mx-auto px-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">Tu carrito está vacío</p>
                    <a href="/" className="inline-block border-b border-black text-xs uppercase tracking-widest font-bold pb-1 hover:opacity-70 transition-opacity">
                        Volver al catálogo
                    </a>
                </div>
            ) : (
                <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
                    <div className="border-b border-gray-100 pb-4 mb-8">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Tu selección ({productos.length})</h2>
                    </div>

                    {/* Grid Responsivo Minimalista */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {productos.map((producto, index) => (
                            <div
                                key={producto._id}
                                className="group bg-white flex flex-col justify-between border-b border-gray-100 pb-6 md:border-b-0 md:pb-0"
                            >
                                {/* Contenedor de Imagen (Aspecto 3:4 idéntico al catálogo) */}
                                <div className="relative overflow-hidden aspect-[4/4] bg-gray-50">
                                    <img
                                        src={producto.imgs[producto.posicionImagen]}
                                        className="w-full h-full transition-transform duration-700 group-hover:scale-102"
                                        alt={producto.marca}
                                    />

                                    {/* Flechas de navegación adaptadas al estilo Zara */}
                                    {producto.imgs.length > 1 && (
                                        <div className="absolute inset-0 flex items-center justify-between px-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={() => cambioImagen(index, -1)}
                                                className="w-8 h-8 bg-white/95 hover:bg-white flex items-center justify-center border border-gray-200 cursor-pointer transition-transform active:scale-95"
                                            >
                                                <img className="w-3.5 h-3.5 rotate-180 opacity-60" src={flecha} alt="Anterior" />
                                            </button>

                                            <button
                                                onClick={() => cambioImagen(index, 1)}
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
                                        onClick={() => eliminarProducto(index)}
                                        className="mt-5 w-full bg-transparent hover:bg-red-50 text-red-500 border border-red-100 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors duration-200 cursor-pointer"
                                    >
                                        Quitar artículo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botón de Enviar Pedido por WhatsApp */}
                    <div className="flex justify-center md:justify-end mt-16 pt-8 border-t border-gray-100">
                        <button
                            onClick={consultarProductos}
                            className="w-full md:w-80 py-4 bg-black text-white hover:bg-gray-800 transition-colors duration-300 font-bold uppercase text-[11px] tracking-widest cursor-pointer active:scale-99 shadow-sm"
                        >
                            Completar Pedido por WhatsApp
                        </button>
                    </div>
                </main>
            )}
        </div>
    )
}

export default Carrito