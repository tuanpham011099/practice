import React, { useEffect, useState } from "react";
import Home from './components/Home';
import Nav from './components/Nav';
import Footer from './components/Footer';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Products from './components/Products';
import Product from './components/Product';
import Login from './components/Login';
import Cart from "./components/Cart";
import axios from "axios";
import Checkout from "./components/Checkout";
import Profile from "./components/Profile";
import Edit from "./components/Edit";
import Signup from "./components/Signup";
import Reset from "./components/Reset";
import Change from "./components/Change";
import Order from "./components/Order";
import './App.css';

function App() {

    const [cart, setCart] = useState([]);
    const [q, setQ] = useState('');


    useEffect(() => {
        let TOKEN;

        if (localStorage.getItem('user')) {
            TOKEN = JSON.parse(localStorage.getItem('user')).token;
            axios.get('http://localhost:5000/carts', { headers: { authorization: `Bearer ${TOKEN}` } })
                .then(res => {
                    setCart(res.data);
                })
                .catch(error => console.log(error));
        }
    }, []);

    return (
        <>
            <Router>
                <Nav cart={cart} setQ={setQ} />
                <Routes>
                    <Route path="/" element={<Home q={q} />} />
                    <Route path="/category/:name-:id" element={<Products />} />
                    <Route path="/product/:productname-:id" element={<Product />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/fpassword" element={<Reset />} />
                    <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
                    <Route path="/profile/:user-:id" element={<Profile />} />
                    <Route path="/profile/edit/:id" element={<Edit />} />
                    <Route path="/profile/order/:id" element={<Order />} />
                    <Route path="/profile/changepass/:id" element={<Change />} />
                    <Route path="/cart/:cartId/checkout-payment=:payment" element={<Checkout />} />
                </Routes>
                <Footer />
            </Router>
        </>
    );
}

export default App;