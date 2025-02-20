import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">SAKILA</Link>
      </div>
      <div className="navbar-right">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/films">Films</Link></li>
          <li><Link to="/customers">Customers</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
