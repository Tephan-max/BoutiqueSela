import React from 'react';

function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 text-gray-900 font-sans mt-20">
            {/* Sección Superior: Instagram Link */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 text-center">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">Síguenos en nuestro diario visual</p>
                <a 
                    href="https://www.instagram.com/bouti_quesela/"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-medium hover:text-gray-500 transition-colors duration-300"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>@boutiquesela</span>
                </a>
            </div>

            {/* Sección Inferior: Copyright */}
            <div className="bg-gray-50 py-6 text-center text-[10px] uppercase tracking-[0.15em] text-gray-400 px-4 border-t border-gray-100">
                © {new Date().getFullYear()} Boutique Sela. Todos los derechos reservados.
            </div>
        </footer>
    );
}

export default Footer;