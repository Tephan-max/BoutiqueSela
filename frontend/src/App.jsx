import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from "react"
import Productos from './Productos'
import Carrito from './Carrito'

function App() {

  const [categoria, setCategoria] = useState('Todas')
  const [orden, setOrden] = useState('Bajo')

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <Productos 
            categoria={categoria} 
            setCategoria={setCategoria}
            orden={orden}
            setOrden={setOrden}
            />}/>
        <Route path='/carrito' element= {<Carrito/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
