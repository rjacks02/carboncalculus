import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import NPVCarbon from './pages/NPVCarbon'
import FAQs from './pages/FAQs';
import CaseStudies from './pages/CaseStudies';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/carboncalculus">
      <Routes>
        <Route index element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/NPVCarbon" element={<NPVCarbon />} />
        <Route path="/CaseStudies" element={<CaseStudies />} />
        <Route path="/FAQs" element={<FAQs />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);