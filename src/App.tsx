import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Home from '@/pages/Home'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router'
import {PopupProvider} from '@/hooks/usePopup'
import {useRipple} from '@/hooks/useRipple'
import {Edit} from '@/pages/Edit'

function App() {
  useRipple()
  return (
    <div>
       <PopupProvider>
       <BrowserRouter>
           <Routes>
               <Route path="/" element={<Home />} />
               <Route path="/edit" element={<Edit />} />
               <Route path="/*" element={<Home />} />
           </Routes>
       </BrowserRouter>
       </PopupProvider>
    </div>
  )
}

export default App
