import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import NPVCarbon from './pages/NPVCarbon'
import FAQs from './pages/FAQs';
import CaseStudies from './pages/CaseStudies';
import Lifecycle from './pages/Lifecycle';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/NPVCarbon" element={<NPVCarbon />} />
        <Route path="/CaseStudies" element={<CaseStudies />} />
        <Route path="/Lifecycle" element={<Lifecycle />} />
        <Route path="/FAQs" element={<FAQs />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);