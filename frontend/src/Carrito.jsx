import { useState, useEffect } from "react"
import Cabecera from "./componentes/Cabecera"
import flecha from './imagenes/flecha.png'
import ProductoCarrito from "./componentes/ProductoCarrito"

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

            {productos.length == 0 ?
                <Cabecera paths={[
                    { ruta: '/contacto', texto: 'Contacto' }
                ]} />
                :
                <Cabecera paths={[
                    { ruta: '/contacto', texto: 'Contacto' },
                    { ruta: '/', texto: 'Catalogo' }
                ]} />
            }

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
                            <ProductoCarrito  
                                key={producto._id}
                                producto={producto}
                                flecha={flecha}
                                eliminarProducto={() => eliminarProducto(index)}
                            />
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