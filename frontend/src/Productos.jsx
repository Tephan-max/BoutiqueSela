import { useEffect, useRef, useState } from "react"
import Cabecera from "./componentes/Cabecera";
import socket from './socket.js'
import flecha from './imagenes/flecha.png'

function Productos({ categoria, setCategoria, orden, setOrden }) {

    const categoriaRef = useRef(categoria)
    const ordenRef = useRef(orden)

    const [productos, setProductos] = useState([])
    const [productosMostrar, setProductosMostrar] = useState([])

    // Obtener productos
    useEffect(() => {
        fetch('https://boutiquesela.onrender.com/productos')
            .then(res => res.json())
            .then(data => {
                let productos = data.data
                productos = productos.map(producto => {
                    producto.posicionImagen = 0
                    return producto
                })
                setProductos(productos)
                actualizarProductosMostrar(obtenerProductosSinCarrito([...productos]),
                    categoria, orden)
            })
    }, [])

    // Escuchar evento de socket.io cuando haya cambios en productos  
    useEffect(() => {
        const handler = (respuesta) => {
            let documento = respuesta.documento
            let tipoDml = respuesta.tipo
            let actualizacionProductos = [...productos]

            documento.posicionImagen = 0

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

            // Mapeo corregido para evitar errores de referencia
            actualizacionProductos = actualizacionProductos.map(producto => {
                producto.posicionImagen = 0;
                return producto;
            });

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

    const cambioImagen = (index, direccion) => {
        let productosMostrarConImagenActualizada = [...productosMostrar]
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

        actualizarProductosMostrar(productosMostrarConImagenActualizada, categoria, orden)
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
                                    {['Todas', 'Carteras', 'Calzado', 'Ropa'].map(elemento => (
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

                {/* Mostrar productos u hoja de vacío */}
                {productosMostrar.length === 0 ? (
                    <div className="text-center py-24 border border-gray-100">
                        <p className="text-gray-400 text-xs uppercase tracking-widest">No hay artículos disponibles</p>
                    </div>
                ) : (
                    /* Grid Responsivo Minimalista:
                       - 1 columna en móvil para apreciar los detalles de la ropa
                       - 2 en móvil ancho/tablet
                       - 3 en desktop estándar
                       - 4 en pantallas amplias
                    */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {productosMostrar.map((producto, index) => (
                            <div
                                key={producto._id}
                                className="group bg-white flex flex-col justify-between transition-all duration-300 border-b border-gray-100 pb-6 md:border-b-0 md:pb-0"
                            >
                                {/* Contenedor de Imagen con proporción editorial (3:4) */}
                                <div className="relative overflow-hidden aspect-[4/4] bg-gray-50">
                                    <img
                                        src={producto.imgs[producto.posicionImagen]}
                                        className="w-full h-full transition-transform duration-700 group-hover:scale-102"
                                        alt={producto.marca}
                                    />

                                    {/* Flechas de navegación para imágenes múltiples.
                                        Fijas en táctil (móvil) y hover elegante en PC */}
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
                                        onClick={() => agregarAlCarrito(index)}
                                    >
                                        Añadir al carrito
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Productos