import { useEffect, useState } from "react"
import Cabecera from "./componentes/Cabecera";
import socket from './socket.js'
import Producto from "./componentes/Producto.jsx";
import Footer from "./componentes/Footer.jsx";

function Productos({ categoria, setCategoria, orden, setOrden }) {

    const [productos, setProductos] = useState([])
    const [productosMostrar, setProductosMostrar] = useState([])
    const [cargando, setCargando] = useState(true)
    const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false)

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const res = await fetch('https://boutiquesela.onrender.com/productos')
                const data = await res.json()
                setProductos(data.data)
                actualizarProductosMostrar(obtenerProductosSinCarrito([...data.data]), categoria, orden)
            } catch (error) {
                console.error("Error al obtener productos:", error)
            } finally {
                setCargando(false)
            }
        }
        obtenerProductos()
    }, [])

    useEffect(() => {
        const handler = (respuesta) => {
            let documento = respuesta.documento
            let tipoDml = respuesta.tipo
            let actualizacionProductos = [...productos]

            if (tipoDml === 'insert') {
                actualizacionProductos.push(documento)
            } else {
                let indexProductoEnProductos = actualizacionProductos.findIndex(producto =>
                    producto._id == documento._id)
                let carrito = JSON.parse(localStorage.getItem("carrito")) || []
                let indexProductoEnCarrito = carrito.findIndex(producto =>
                    producto._id == documento._id)
                let ejecuciónSplice = indexProductoEnCarrito != -1

                if (tipoDml === 'update') {
                    actualizacionProductos[indexProductoEnProductos] = documento
                    if (ejecuciónSplice) {
                        carrito.splice(indexProductoEnCarrito, 1, documento)
                        localStorage.setItem('carrito', JSON.stringify(carrito))
                    }
                }

                if (tipoDml === 'delete') {
                    actualizacionProductos.splice(indexProductoEnProductos, 1)
                    if (ejecuciónSplice) {
                        carrito.splice(indexProductoEnCarrito, 1)
                        localStorage.setItem('carrito', JSON.stringify(carrito))
                    }
                }
            }

            setProductos(actualizacionProductos)
            actualizarProductosMostrar(obtenerProductosSinCarrito(actualizacionProductos), categoria, orden)
        }
        socket.on('actualizacionProductos', handler)
        return () => socket.off('actualizacionProductos')
    }, [productos, categoria, orden])

    useEffect(() => {
        const handler = () => {
            actualizarProductosMostrar(obtenerProductosSinCarrito(productos), categoria, orden);
        }
        window.addEventListener("storage", handler);
        window.addEventListener("cambioCarrito", handler);
        return () => {
            window.removeEventListener("storage", handler);
            window.removeEventListener("cambioCarrito", handler);
        };
    }, [productos, categoria, orden]);

    const actualizarProductosMostrar = (data, catSeleccionada, ordSeleccionado) => {
        let copiaProductos = [...data]

        if (catSeleccionada !== 'Todas') {
            const nombreDb = catSeleccionada === 'Accesorios' ? 'Accesorios o Complementos' : catSeleccionada;
            copiaProductos = copiaProductos.filter((producto) => producto.categoria === nombreDb)
        }
        
        if (ordSeleccionado === 'Bajo') {
            copiaProductos.sort((a, b) => a.precio - b.precio)
        } else {
            copiaProductos.sort((a, b) => b.precio - a.precio)
        }

        setProductosMostrar(copiaProductos)
    }

    const obtenerProductosSinCarrito = (productos) => {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || []
        if (carrito.length !== 0) {
            let idsCarrito = carrito.map(producto => producto._id)
            return productos.filter(producto => !idsCarrito.includes(producto._id))
        }
        return productos
    }

    const alternarOrden = () => {
        const nuevoOrden = orden === 'Alto' ? 'Bajo' : 'Alto';
        setOrden(nuevoOrden);
        actualizarProductosMostrar(obtenerProductosSinCarrito(productos), categoria, nuevoOrden);
    };

    const listaCategorias = ['Todas', 'Accesorios', 'Calzado', 'Ropa'];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
            <Cabecera paths={[
                { ruta: '/contacto', texto: 'Contacto' },
                { ruta: '/carrito', texto: 'Carrito' }
            ]} />

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-12">

                {/* Filtros */}
                <section className="border-b border-gray-100 pb-4 mb-8">
                    <div className="flex justify-between items-center gap-4">
                        
                        {/* 📱 Filtro móvil */}
                        <div className="relative w-1/2 md:hidden">
                            <button
                                onClick={() => setMenuCategoriasAbierto(!menuCategoriasAbierto)}
                                className="flex items-center justify-between w-full px-3 py-2.5 border border-gray-200 bg-white text-left text-xs uppercase tracking-wider text-gray-900 font-medium"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-light mb-1">Categoría</span>
                                    <span className="truncate">{categoria === 'Accesorios o Complementos' ? 'Accesorios' : categoria}</span>
                                </div>
                                <svg className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${menuCategoriasAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuCategoriasAbierto && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuCategoriasAbierto(false)} />
                                    <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-200 shadow-xl z-20">
                                        {listaCategorias.map((cat) => {
                                            const estaActivo = categoria === cat || (cat === 'Accesorios' && categoria === 'Accesorios o Complementos');
                                            return (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        setCategoria(cat);
                                                        actualizarProductosMostrar(obtenerProductosSinCarrito(productos), cat, orden);
                                                        setMenuCategoriasAbierto(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider border-b border-gray-50 last:border-none transition-colors ${estaActivo ? 'bg-black text-white font-medium' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 💻 Filtro escritorio */}
                        <div className="hidden md:flex gap-2 whitespace-nowrap">
                            {listaCategorias.map((cat) => {
                                const estaActivo = categoria === cat || (cat === 'Accesorios' && categoria === 'Accesorios o Complementos');
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setCategoria(cat);
                                            actualizarProductosMostrar(obtenerProductosSinCarrito(productos), cat, orden);
                                        }}
                                        className={`px-4 py-2 text-xs uppercase tracking-wider transition-all duration-200 border ${estaActivo ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900'}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Ordenamiento */}
                        <div className="w-1/2 md:w-auto flex justify-end">
                            <button onClick={alternarOrden} className="flex items-center justify-between w-full md:w-auto px-3 py-2.5 md:p-0 border md:border-none border-gray-200 text-left text-xs uppercase tracking-wider text-gray-900 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center md:space-x-1">
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-light">Precio:</span>
                                    <span className="font-medium block md:inline">{orden === 'Alto' ? 'Mayor a Menor' : 'Menor a Mayor'}</span>
                                </div>
                                <svg className={`w-3 h-3 text-gray-500 md:text-gray-900 transition-transform duration-300 md:ml-1 ${orden === 'Bajo' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                    </div>
                </section>
                
                {/* Catálogo de Productos */}
                {cargando ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Obteniendo colección...</p>
                    </div>
                ) : productosMostrar.length === 0 ? (
                    <div className="text-center py-24 border border-gray-100">
                        <p className="text-gray-400 text-xs uppercase tracking-widest">No hay artículos disponibles</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                        {productosMostrar.map((producto) => (
                            <div 
                                key={producto._id}
                                onClick={() => window.location.href = `/producto?id=${producto._id}`}
                                className="group relative cursor-pointer active:scale-[0.98] transition-transform duration-150 select-none"
                            >
                                {/* 
                                  Contenedor de la Tarjeta Limpia. 
                                  Eliminamos el bloque de texto repetitivo inferior.
                                */}
                                <div className="relative transition-all duration-300 md:group-hover:opacity-90">
                                    <Producto producto={producto} />
                                    
                                    {/* 
                                      ✨ El Indicador Flotante Elegante:
                                      Aparece discretamente solo en la esquina superior derecha de la tarjeta, 
                                      haciendo la función de un botón de exploración visual nativo y limpio.
                                    */}
                                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm w-7 h-7 rounded-full flex items-center justify-center border border-gray-100 shadow-sm transition-transform duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-hover:scale-110">
                                        <svg className="w-3.5 h-3.5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer/>
        </div>
    )
}

export default Productos