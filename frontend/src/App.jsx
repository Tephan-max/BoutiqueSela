import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from "react"
import Productos from './Productos'
import DetalleProducto from './componentes/DetalleProducto'

function App() {

  const [categoria, setCategoria] = useState('Todas')
  const [orden, setOrden] = useState('Bajo')

  return (
    <BrowserRouter>
      <Routes>
        {/* Catálogo Principal */}
        <Route path='/' element={
          <Productos
            categoria={categoria}
            setCategoria={setCategoria}
            orden={orden}
            setOrden={setOrden}
          />
        } />

        {/* Detalle del Producto */}
        <Route path='/producto' element={<DetalleProducto />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App