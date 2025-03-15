import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './home';
import Films from './films';
import Customers from './customers';
import './App.css';


 


const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/"element={<Home />} />
        { <Route path="/films" element={<Films />} /> }
        <Route path="/customers" element={<Customers />} />
      </Routes>
    </Router>
  );
}


export default App;
