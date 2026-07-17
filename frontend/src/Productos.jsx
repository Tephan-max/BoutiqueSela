import { useEffect, useRef, useState } from "react"
import Cabecera from "./componentes/Cabecera";
import socket from './socket.js'
import flecha from './imagenes/flecha.png'
import Producto from "./componentes/Producto.jsx";

function Productos({ categoria, setCategoria, orden, setOrden }) {

    const categoriaRef = useRef(categoria)
    const ordenRef = useRef(orden)

    const [productos, setProductos] = useState([])
    const [productosMostrar, setProductosMostrar] = useState([])
    const [cargando, setCargando] = useState(true)

    // Obtener productos
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

    // Escuchar evento de socket.io cuando haya cambios en productos  
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
                let ejecucionSplice = indexProductoEnCarrito != -1

                if (tipoDml === 'update') {
                    actualizacionProductos[indexProductoEnProductos] = documento
                    if (ejecucionSplice) {
                        carrito.splice(indexProductoEnCarrito, 1, documento)
                        localStorage.setItem('carrito', JSON.stringify(carrito))
                    }
                }

                if (tipoDml === 'delete') {
                    actualizacionProductos.splice(indexProductoEnProductos, 1)
                    if (ejecucionSplice) {
                        carrito.splice(indexProductoEnCarrito, 1)
                        localStorage.setItem('carrito', JSON.stringify(carrito))
                    }
                }
            }

            setProductos(actualizacionProductos)
            actualizarProductosMostrar(obtenerProductosSinCarrito(actualizacionProductos),
                categoria, orden)
        }
        socket.on('actualizacionProductos', handler)
        return () => {
            socket.off('actualizacionProductos')
        }
    }, [productos, categoria, orden])

    // Escuchar evento de cambios en el storage "carrito"
    useEffect(() => {
        const handler = () => {
            actualizarProductosMostrar(obtenerProductosSinCarrito(productosMostrar),
                categoria, orden);
        }

        window.addEventListener("storage", handler);

        return () => {
            window.removeEventListener("storage", handler);
        };

    }, [productos, categoria, orden]);

    // Actualizar los productos que se mostraran
    const actualizarProductosMostrar = (data, categoria, orden) => {
        let copiaProductos = [...data]

        if (categoria !== 'Todas') {
            copiaProductos = copiaProductos.filter((producto) =>
                producto.categoria === categoria)
        }
        if (orden === 'Bajo') {
            copiaProductos.sort((a, b) => a.precio - b.precio)
        } else {
            copiaProductos.sort((a, b) => b.precio - a.precio)
        }

        setProductosMostrar(copiaProductos)
    }

    const agregarAlCarrito = (index) => {
        let productosMostrarNuevo = [...productosMostrar]
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        carrito.push(productosMostrar[index])
        localStorage.setItem('carrito', JSON.stringify(carrito))

        productosMostrarNuevo.splice(index, 1)

        setProductosMostrar(productosMostrarNuevo)
    }

    const obtenerProductosSinCarrito = (productos) => {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || []

        if (carrito != 0) {
            let idsCarrito = carrito.map(producto =>
                producto._id)

            let productosActualizados = productos.filter(producto =>
                !idsCarrito.includes(producto._id))

            return productosActualizados
        }
        return productos
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
            <Cabecera paths={[
                { ruta: '/contacto', texto: 'Contacto' },
                { ruta: '/carrito', texto: 'Carrito' }
            ]} />

            {/* Contenedor fluido de boutique */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

                {/* Sección de Filtros - Minimalista y limpia */}
                <div className="border-b border-gray-100 pb-8 mb-12 flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
                    <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">

                        {/* Selector Categoría */}
                        <div className="flex flex-col gap-1.5 w-full md:w-48">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Categoría</span>
                            <div className="relative">
                                <select
                                    className="w-full border-b border-gray-200 rounded-none py-2 text-xs uppercase tracking-wider text-gray-800 bg-transparent focus:outline-none focus:border-black cursor-pointer appearance-none"
                                    onChange={(e) => { categoriaRef.current = e.target.value }}>
                                    {['Todas', 'Accesorios o Complementos', 'Calzado', 'Ropa'].map(elemento => (
                                        <option key={elemento} value={elemento} selected={elemento === categoria}>
                                            {elemento}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-400 text-[10px]">▼</div>
                            </div>
                        </div>

                        {/* Selector Orden por precio */}
                        <div className="flex flex-col gap-1.5 w-full md:w-48">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ordenar por</span>
                            <div className="relative">
                                <select
                                    className="w-full border-b border-gray-200 rounded-none py-2 text-xs uppercase tracking-wider text-gray-800 bg-transparent focus:outline-none focus:border-black cursor-pointer appearance-none"
                                    onChange={(e) => { ordenRef.current = e.target.value }}>
                                    {['Bajo', 'Alto'].map(elemento => (
                                        <option key={elemento} value={elemento} selected={elemento === orden}>
                                            {elemento === 'Bajo' ? 'Precio: Bajo a Alto' : 'Precio: Alto a Bajo'}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-400 text-[10px]">▼</div>
                            </div>
                        </div>

                    </div>

                    {/* Botón Aplicar */}
                    <button
                        className="w-full md:w-auto px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-300 text-[11px] font-bold uppercase tracking-widest cursor-pointer"
                        onClick={() => {
                            actualizarProductosMostrar(
                                obtenerProductosSinCarrito(productos),
                                categoriaRef.current,
                                ordenRef.current
                            )
                            setCategoria(categoriaRef.current)
                            setOrden(ordenRef.current)
                        }}>
                        Filtrar
                    </button>
                </div>

                {/* LOGICA DE PANTALLAS: CARGANDO -> VACÍO -> PRODUCTOS */}
                {cargando ? (
                    /* Pantalla de Carga Minimalista */
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] animate-pulse">Obteniendo colección...</p>
                    </div>
                ) : productosMostrar.length === 0 ? (
                    /* Pantalla de catálogo vacío */
                    <div className="text-center py-24 border border-gray-100">
                        <p className="text-gray-400 text-xs uppercase tracking-widest">No hay artículos disponibles</p>
                    </div>
                ) : (
                    /* Grid de productos */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {productosMostrar.map((producto, index) => (
                            <Producto  
                                key={producto._id}
                                producto={producto}
                                flecha={flecha}
                                agregarAlCarrito={() => agregarAlCarrito(index)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Productos