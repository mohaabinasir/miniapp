import Home from '@/pages/Home'
import {BrowserRouter, Routes, Route} from 'react-router'
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
