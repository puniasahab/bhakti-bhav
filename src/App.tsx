import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './screens/Home'
import TermsAndConditions from './screens/termsAndConditions'
import PrivacyPolicy from './screens/privacyPolicy'
import AboutUs from './screens/aboutUs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/termsAndConditions" element={<TermsAndConditions />} />
        <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/aboutUs" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
