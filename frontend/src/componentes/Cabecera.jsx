import { Link, useNavigate } from "react-router-dom"

function Cabecera({ paths }) {

    const navigate = useNavigate()

    return (
        <>
            <header className="bg-white border-b p-3">
                <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
                    <h1 className="font-serif text-3xl">
                        Boutique Sela
                    </h1>

                    <nav className="flex gap-6">
                        {paths.map((path) =>
                            path.ruta === "/contacto" ? (
                                <a
                                    key={path.ruta}
                                    href="https://wa.me/51965856201"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[rgb(133,76,8)] transition-colors"
                                >
                                    {path.texto}
                                </a>
                            ) : (
                                <Link
                                    key={path.ruta}
                                    to={path.ruta}
                                    className="hover:text-[rgb(133,76,8)] transition-colors"
                                >
                                    {path.texto}
                                </Link>
                            )
                        )}
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Cabecera