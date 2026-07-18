function Producto({ producto }) {
    // 🔥 Imagen por defecto elegante si el producto no tiene fotos
    const IMAGEN_FALLBACK = "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=600&auto=format&fit=crop"

    // Comprobamos de forma segura si existen imágenes en el array
    const imagenSrc = producto.imgs && producto.imgs.length > 0 
        ? producto.imgs[0] 
        : IMAGEN_FALLBACK;

    return (
        <div className="flex flex-col">
            {/* Contenedor de la Imagen */}
            <div className="aspect-[3/4] w-full bg-neutral-50 overflow-hidden border border-neutral-100">
                <img
                    src={imagenSrc}
                    alt={`${producto.marca} - ${producto.categoria}`}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            {/* Información del Producto */}
            <div className="mt-3">
                <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-[0.15em]">
                    {producto.categoria}
                </span>
                <h3 className="text-sm font-light text-neutral-900 mt-1">
                    {producto.marca}
                </h3>
                <p className="text-sm font-medium text-neutral-900 mt-1">
                    S/ {producto.precio.toFixed(2)}
                </p>
               
            </div>
        </div>
    )
}

export default Producto