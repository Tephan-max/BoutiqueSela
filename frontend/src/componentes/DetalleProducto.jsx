import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Cabecera from "./Cabecera";
import Footer from "./Footer";
import socket from '../socket.js'

function DetalleProducto() {
    const [searchParams] = useSearchParams();
    const idProducto = searchParams.get("id");

    const [producto, setProducto] = useState(null);
    const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [toast, setToast] = useState(null);
    const [eliminado, setEliminado] = useState(false);

    // 🔥 Fuerza a la página a empezar desde arriba cada vez que cambia el producto
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant" // Usamos "instant" para que no se note el salto visual mientras carga
        });
    }, [idProducto]);

    useEffect(() => {
    const handler = (respuesta) => {
        const documento = respuesta.documento
        const tipoDml = respuesta.tipo

        if (documento._id !== idProducto) return

        if (tipoDml === 'update') {
            setProducto(documento)

            const varianteActual = documento.inventario?.find(item => item.talla === tallaSeleccionada)
            if (!varianteActual || varianteActual.stock === 0) {
                const primeraTallaDisponible = documento.inventario?.find(item => item.stock > 0)
                setTallaSeleccionada(primeraTallaDisponible ? primeraTallaDisponible.talla : null)
                mostrarToast("Este producto se actualizó. Revisa la talla seleccionada", 'error')
            }

            // 🔥 Limpiar o ajustar el carrito si este producto está guardado ahí
            let carrito = JSON.parse(localStorage.getItem('carrito')) || []
            let estaEnCarrito = carrito.some(item => item._id === documento._id)

            if (estaEnCarrito) {
                carrito = carrito
                    .map(item => {
                        if (item._id !== documento._id) return item

                        const inventarioItem = documento.inventario?.find(inv => inv.talla === item.talla)

                        if (!inventarioItem || inventarioItem.stock === 0) {
                            return null
                        }

                        const itemActualizado = {
                            ...item,
                            marca: documento.marca,
                            precio: documento.precio,
                            img: documento.imgs?.[0] || item.img,
                            stockMaximo: inventarioItem.stock
                        }

                        if (item.cantidad > inventarioItem.stock) {
                            itemActualizado.cantidad = inventarioItem.stock
                        }

                        return itemActualizado
                    })
                    .filter(item => item !== null)

                localStorage.setItem('carrito', JSON.stringify(carrito))
                window.dispatchEvent(new Event("cambioCarrito"))
            }
        }

        if (tipoDml === 'delete') {
            setEliminado(true)

            let carrito = JSON.parse(localStorage.getItem('carrito')) || []
            let estaEnCarrito = carrito.some(item => item._id === documento._id)

            if (estaEnCarrito) {
                carrito = carrito.filter(item => item._id !== documento._id)
                localStorage.setItem('carrito', JSON.stringify(carrito))
                window.dispatchEvent(new Event("cambioCarrito"))
            }
        }
    }

    socket.on('actualizacionProductos', handler)
    return () => socket.off('actualizacionProductos', handler)
}, [idProducto, tallaSeleccionada])

    useEffect(() => {
        if (!idProducto) {
            setCargando(false);
            return;
        }

        const obtenerDetalle = async () => {
            try {
                const res = await fetch("https://boutiquesela.onrender.com/productos");

                if (!res.ok) throw new Error("Error al obtener el catálogo");

                const json = await res.json();
                const listaProductos = Array.isArray(json) ? json : json.data;
                const productoEncontrado = listaProductos?.find(item => item._id === idProducto);

                if (productoEncontrado) {
                    setProducto(productoEncontrado);

                    const primeraTallaDisponible = productoEncontrado.inventario?.find(item => item.stock > 0);
                    if (primeraTallaDisponible) {
                        setTallaSeleccionada(primeraTallaDisponible.talla);
                    }
                }
            } catch (error) {
                console.error("Error en la carga del detalle:", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerDetalle();
    }, [idProducto]);

    useEffect(() => {
        setCantidad(1);
    }, [tallaSeleccionada]);

    const mostrarToast = (mensaje, tipo = 'info') => {
        setToast({ mensaje, tipo });
        setTimeout(() => setToast(null), 2800);
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-between">
                <Cabecera paths={[{ ruta: '/contacto', texto: 'Contacto' }, { ruta: '/carrito', texto: 'Carrito' }]} />
                <div className="flex flex-col items-center justify-center py-32 space-y-4 flex-grow">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] animate-pulse">Cargando pieza...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-between">
                <Cabecera paths={[{ ruta: '/contacto', texto: 'Contacto' }, { ruta: '/carrito', texto: 'Carrito' }]} />
                <div className="text-center py-32 flex-grow">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Pieza no encontrada</p>
                </div>
                <Footer />
            </div>
        );
    }

    const varianteElegida = producto.inventario?.find(item => item.talla === tallaSeleccionada);
    const tieneStock = varianteElegida ? varianteElegida.stock > 0 : false;
    const stockMaximo = varianteElegida ? varianteElegida.stock : 0;

    const incrementarCantidad = () => {
        if (cantidad < stockMaximo) setCantidad(prev => prev + 1);
    };

    const decrementarCantidad = () => {
        if (cantidad > 1) setCantidad(prev => prev - 1);
    };

    const añadirAlCarrito = () => {
        if (!tallaSeleccionada) {
            mostrarToast("Selecciona una talla para continuar", 'error');
            return;
        }
        if (cantidad < 1 || cantidad > stockMaximo) {
            mostrarToast("Cantidad no válida", 'error');
            return;
        }

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const itemCarritoId = `${producto._id}_${tallaSeleccionada}`;

        const productoParaCarrito = {
            idUnico: itemCarritoId,
            _id: producto._id,
            marca: producto.marca,
            precio: producto.precio,
            img: producto.imgs?.[0] || '',
            talla: tallaSeleccionada,
            cantidad: cantidad,
            stockMaximo: stockMaximo
        };

        const existe = carrito.find(item => item.idUnico === itemCarritoId);

        if (existe) {
            if (existe.cantidad + cantidad <= stockMaximo) {
                existe.cantidad += cantidad;
            } else {
                mostrarToast(`Stock disponible: ${stockMaximo} unidades. Ya tienes ${existe.cantidad} en tu bolsa`, 'error');
                return;
            }
        } else {
            carrito.push(productoParaCarrito);
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));
        window.dispatchEvent(new Event("cambioCarrito"));
        mostrarToast("Añadido al guardarropa", 'exito');
    };

    if (eliminado) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-between">
                <Cabecera paths={[{ ruta: '/contacto', texto: 'Contacto' }, { ruta: '/carrito', texto: 'Carrito' }]} />
                <div className="flex-1 flex flex-col justify-center items-center gap-6 px-4 py-32">
                    <p className="text-center uppercase tracking-[0.25em] text-neutral-400 font-light text-xs">
                        Esta pieza ya no está disponible
                    </p>
                    <Link
                        to="/"
                        className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-900 border-b border-black pb-1 hover:opacity-70 transition-opacity"
                    >
                        Volver a la tienda
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col justify-between select-none">
            <Cabecera paths={[{ ruta: '/contacto', texto: 'Contacto' }, { ruta: '/carrito', texto: 'Carrito' }]} />

            <div className="max-w-6xl mx-auto px-4 pt-6 w-full">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver al catálogo
                </Link>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 flex-grow items-start w-full">

                {/* Contenedor de Imágenes */}
                <div className="w-full md:col-span-7 flex flex-col md:flex-row gap-4">

                    {/* Imagen Principal */}
                    <div className="order-1 md:order-2 flex-1 aspect-[3/4] bg-gray-50 overflow-hidden border border-neutral-100">
                        <img
                            src={producto.imgs?.[imagenSeleccionada] || producto.imgs?.[0]}
                            alt={producto.marca}
                            className="w-full h-full object-cover transition-all duration-300"
                        />
                    </div>

                    {/* Miniaturas: izquierda en PC, abajo en celular */}
                    {producto.imgs && producto.imgs.length > 1 && (
                        <div className="order-2 md:order-1 flex md:flex-col flex-row gap-2.5 max-h-none md:max-h-[500px] pb-2 md:pb-0 overflow-x-auto md:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                            {producto.imgs.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setImagenSeleccionada(index)}
                                    className={`w-16 h-20 md:w-20 md:h-24 flex-shrink-0 bg-neutral-50 overflow-hidden border transition-all cursor-pointer ${imagenSeleccionada === index
                                        ? 'border-black opacity-100 shadow-sm md:scale-[0.98]'
                                        : 'border-gray-200 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detalles y Compra */}
                <div className="w-full md:col-span-5 flex flex-col justify-center pt-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">{producto.categoria}</span>
                    <h1 className="text-xl uppercase tracking-wider font-medium mb-2">{producto.marca}</h1>
                    <p className="text-sm font-semibold mb-6">S/ {Number(producto.precio).toFixed(2)}</p>
                    <p className="text-xs text-gray-600 tracking-wide leading-relaxed mb-8">{producto.descripcion}</p>

                    <div className="mb-6">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-3">Seleccionar Talla</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {producto.inventario?.map((item) => {
                                const sinStock = item.stock === 0;
                                const esSeleccionada = tallaSeleccionada === item.talla;

                                return (
                                    <button
                                        key={item.talla}
                                        disabled={sinStock}
                                        onClick={() => setTallaSeleccionada(item.talla)}
                                        className={`px-4 py-2.5 text-xs uppercase tracking-wider border transition-all duration-200 ${sinStock
                                            ? 'border-gray-100 text-gray-300 line-through cursor-not-allowed bg-gray-50/50'
                                            : esSeleccionada
                                                ? 'bg-black text-white border-black font-medium'
                                                : 'bg-white text-gray-800 border-gray-200 hover:border-black'
                                            }`}
                                    >
                                        {item.talla}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="min-h-[16px]">
                            {tallaSeleccionada && (
                                <p className={`text-[11px] font-medium transition-all duration-200 ${tieneStock ? 'text-gray-500' : 'text-red-500'}`}>
                                    {tieneStock ? `Disponibles: ${stockMaximo} unidades` : 'Agotado en esta talla'}
                                </p>
                            )}
                        </div>
                    </div>

                    {tallaSeleccionada && tieneStock && (
                        <div className="mb-8">
                            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-3">Cantidad</h3>
                            <div className="flex items-center border border-gray-200 w-max rounded-lg overflow-hidden">
                                <button
                                    onClick={decrementarCantidad}
                                    disabled={cantidad <= 1}
                                    className="px-4 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-30 cursor-pointer font-medium"
                                >
                                    —
                                </button>
                                <span className="px-6 py-2 text-xs font-medium w-12 text-center">
                                    {cantidad}
                                </span>
                                <button
                                    onClick={incrementarCantidad}
                                    disabled={cantidad >= stockMaximo}
                                    className="px-4 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-30 cursor-pointer font-medium"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={añadirAlCarrito}
                        disabled={!tallaSeleccionada || !tieneStock}
                        className={`w-full py-4 text-xs uppercase tracking-widest transition-all duration-300 ${tallaSeleccionada && tieneStock
                            ? 'bg-black text-white hover:bg-gray-900 active:scale-[0.99] cursor-pointer'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {!tallaSeleccionada
                            ? 'Selecciona una talla'
                            : !tieneStock
                                ? 'Talla sin stock'
                                : `Añadir ${cantidad} a la bolsa`
                        }
                    </button>
                </div>
            </main>

            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-[fadeInUp_0.3s_ease-out]">
                    <div className={`flex items-center gap-2.5 px-5 py-3 text-[11px] uppercase tracking-widest font-medium shadow-lg ${toast.tipo === 'error' ? 'bg-white text-red-500 border border-red-100' : 'bg-black text-white'
                        }`}>
                        {toast.tipo === 'exito' && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {toast.mensaje}
                    </div>
                </div>
            )}


        </div>
    );
}

export default DetalleProducto;