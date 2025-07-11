import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import NPVFinance from './pages/NPVFinance';
import NPVCarbon from './pages/NPVCarbon'
import FAQs from './pages/FAQs';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <div>
    <HashRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path = 'Home' element={<Home />} />
        <Route path = 'NPVFinance' element={<NPVFinance />} />
        <Route path = 'NPVCarbon' element={<NPVCarbon />} />
        <Route path = 'FAQs' element={<FAQs />} />
      </Routes>
    </HashRouter>
</div>
);