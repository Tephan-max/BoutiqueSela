import { Link, useNavigate } from "react-router-dom"

function Cabecera({ paths }) {
    const navigate = useNavigate()

    return (
        <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 md:h-24 flex flex-col md:flex-row md:items-center md:justify-between justify-center gap-2">
                
                {/* Logo / Título de la marca */}
                <div 
                    onClick={() => navigate('/')} 
                    className="cursor-pointer select-none text-center md:text-left"
                >
                    <h1 className="font-light text-2xl md:text-3xl tracking-[0.25em] uppercase text-gray-900 transition-opacity hover:opacity-80">
                        Boutique Sela
                    </h1>
                </div>

                {/* Menú de navegación */}
                <nav className="flex gap-8 justify-center md:justify-end items-center">
                    {paths.map((path) =>
                        path.ruta === "/contacto" ? (
                            <a
                                key={path.ruta}
                                href="https://wa.me/51965856201"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500 hover:text-black transition-colors duration-300 py-1 group"
                            >
                                {path.texto}
                                {/* Línea animada al pasar el mouse (hover) */}
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ) : (
                            <Link
                                key={path.ruta}
                                to={path.ruta}
                                className="relative text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500 hover:text-black transition-colors duration-300 py-1 group"
                            >
                                {path.texto}
                                {/* Línea animada al pasar el mouse (hover) */}
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        )
                    )}
                </nav>

            </div>
        </header>
    )
}

export default Cabecera