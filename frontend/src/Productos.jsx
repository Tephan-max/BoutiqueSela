import { useEffect, useRef, useState } from "react"
import Cabecera from "./componentes/Cabecera";
import socket from './socket.js'
import flecha from './imagenes/flecha.png'

function Productos({ categoria, setCategoria,
    orden, setOrden }) {

    const categoriaRef = useRef(categoria)
    const ordenRef = useRef(orden)

    const [productos, setProductos] = useState([])
    const [productosMostrar, setProductosMostrar] = useState([])

    //Obtener productos
    useEffect(() => {
        fetch('http://localhost:3000/productos')
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

    //Escuchar evento de socket.io cuando haya cambios en productos  
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

            actualizacionProductos = agregarPosicionProductos(actualizacionProductos)
            setProductos(actualizacionProductos)
            actualizarProductosMostrar(obtenerProductosSinCarrito(actualizacionProductos),
                categoria, orden)
        }
        socket.on('actualizacionProductos', handler)
        return () => {
            socket.off('actualizacionProductos')
        }
    }, [productos, categoria, orden])

    //Escuchar evento de cambios en el storage "carrito"
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

    //Actualizar los productos que se mostraran
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
        <>
            <Cabecera paths={[
                { ruta: '/contacto', texto: 'Contacto' },
                { ruta: '/carrito', texto: 'Carrito' }
            ]} />

            <div className="p-8">
                <div className="bg-white p-5 mb-8 rounded-2xl border flex gap-5 items-end">
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">Categoria</h3>
                        <select
                            className="border rounded"
                            onChange={(e) => { categoriaRef.current = e.target.value }}>
                            {['Todas', 'Carteras', 'Calzado', 'Ropa'].map(elemento => {
                                if (elemento == categoria) {
                                    return <option selected>{elemento}</option>
                                }
                                return <option>{elemento}</option>
                            })}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">Precio</h3>
                        <select
                            className="border rounded"
                            onChange={(e) => { ordenRef.current = e.target.value }}>
                            {['Bajo', 'Alto'].map(elemento => {
                                if (elemento == orden) {
                                    return <option selected>{elemento}</option>
                                }
                                return <option>{elemento}</option>
                            })}
                        </select>
                    </div>
                    <button
                        className="border cursor-pointer px-2 bg-[rgb(189,170,147)] rounded
                        hover:bg-[rgb(177,156,131)] "
                        onClick={() => {
                            actualizarProductosMostrar(
                                obtenerProductosSinCarrito(productos),
                                categoriaRef.current,
                                ordenRef.current
                            )
                            setCategoria(categoriaRef.current)
                            setOrden(ordenRef.current)
                        }}>Buscar</button>
                </div>

                {productosMostrar.length == 0 ? <span>No hay productos</span> :
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                        {productosMostrar.map((producto, index) => (
                            <div
                                key={producto._id}
                                className="rounded-xl border bg-white overflow-hidden"
                            >

                                <div className="relative">

                                    <img
                                        src={producto.imgs[producto.posicionImagen]}
                                        className="w-full aspect-square"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-between ">
                                        <img
                                            onClick={() =>
                                                cambioImagen(index, -1)
                                            }
                                            className="ml-1 rounded-full p-1 bg-amber-50 w-8 rotate-180 cursor-pointer"
                                            src={flecha}
                                        />

                                        <img
                                            onClick={() =>
                                                cambioImagen(index, 1)
                                            }
                                            className="w-8 cursor-pointer mr-1 rounded-full p-1 bg-amber-50"
                                            src={flecha}
                                        />
                                    </div>

                                </div>

                                <div className="p-4 space-y-2">
                                    <h2 className="font-semibold text-lg">
                                        {producto.marca}
                                    </h2>

                                    <p className="text-gray-500">
                                        Talla {producto.talla}
                                    </p>

                                    <p className="text-emerald-600 text-xl font-bold">
                                        S/ {producto.precio}
                                    </p>

                                    <button
                                        className="mt-4 w-full rounded-lg
                                        bg-[rgb(184,163,138)]
                                        py-3
                                        font-medium
                                        hover:brightness-95
                                        transition
                                        cursor-pointer"
                                        onClick={() => agregarAlCarrito(index)}
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </>
    )
}

export default Productos