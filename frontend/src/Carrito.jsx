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
        <>
            <Cabecera paths={[
                { ruta: '/contacto', texto: 'Contacto' },
                { ruta: '/', texto: 'Catalogo' }
            ]} />

            {productos.length > 0 &&
                <div className=" fixed p-8 z-2 flex justify-end w-full">
                    <div className="bg-white py-3 text-center w-25 rounded border ">
                        <span className="">Total: S/ {total}</span>
                    </div>
                </div>
            }
            {productos.length == 0 ? <span className="p-8 block">No hay productos</span> :
                <div className="p-8 mt-19">

                    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                        {productos.map((producto, index) => (
                            <div
                                key={producto._id}
                                className="rounded-xl border bg-white overflow-hidden">
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
                                        bg-[rgb(194,51,51)]
                                        py-3
                                        font-medium
                                        hover:brightness-95
                                        transition
                                        cursor-pointer"
                                        onClick={() => { eliminarProducto(index) }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                    <div onClick={consultarProductos} className="flex justify-end mt-8">
                        <button className="w-50 py-2 rounded bg-green-600
                            hover:bg-green-500 cursor-pointer font-medium">
                            Consultar productos
                        </button>
                    </div>
                </div>
            }
        </>
    )
}

export default Carrito