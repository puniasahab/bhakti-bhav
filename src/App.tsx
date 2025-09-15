import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import {Provider} from 'react-redux';
import Home from './screens/Home'
import TermsAndConditions from './screens/termsAndConditions'
import PrivacyPolicy from './screens/privacyPolicy'
import AboutUs from './screens/aboutUs'
import Wallpapers from './screens/wallpapers'
import Rashifal from './screens/rashifal';
import { store } from "../store";

function App() {
  return (
    <Provider store = {store} >
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/termsAndConditions" element={<TermsAndConditions />} />
        <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="/wallpapers" element={<Wallpapers />} />
        <Route path="/rashifal" element={<Rashifal />} />
      </Routes>
    </BrowserRouter>
    </Provider>
  )
}

export default App
