import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Nav({ cart, setQ }) {

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState();

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
        axios.get('http://localhost:5000/categories')
            .then(res => setCategories(res.data))
            .catch(error => console.log(error));

    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        window.location.reload();
        navigate('/');
    };

    return (
        <div id="app" className="container">
            <nav className="navbar navbar-expand-md navbar-light bg-light">
                <a className="navbar-brand" href="/">This is Logo</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item active">
                            <a className="nav-link" href="/">Home <span className="sr-only"></span></a>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                                Categories
                            </a>
                            <div className="dropdown-menu">
                                {categories.map(category =>
                                    <Link key={category.id} className="dropdown-item" to={`/category/${category.name}-${category.id}`}>{category.name}</Link>
                                )}
                            </div>
                        </li>

                    </ul>
                    <ul className="navbar-nav">
                        <li className="nav-item mx-2">
                            <input className="form-control mr-sm-2" type="text" placeholder="Search" onChange={e => setQ(e.target.value)} />
                        </li>
                        {user ? <>
                            <li className="nav-item">
                                <Link to={`/profile/${user.name}-${user.id}`} className="pull-right btn btn-success">{user.name}</Link>
                            </li>
                            <li className="nav-item">
                                <Link to={`/cart`} ><img src="https://www.kindpng.com/picc/m/174-1749302_shopping-cart-png-download-image-shopping-cart-svg.png" width={'40px'} style={{ border: '1px solid #dbd8d8', borderRadius: '10px' }} />{cart.products && cart.products.length}</Link>
                            </li>
                            <li className="nav-item">
                                <button className="btn" onClick={logout}>Log out</button>
                            </li>
                        </> : <>
                            <li className="nav-item">
                                <Link to="/login" className="pull-right btn btn-info">Sign In</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/signup" className=" pull-right btn">Sign up</Link>
                            </li>
                        </>}
                    </ul>
                </div>
            </nav>
        </div>
    );
}

export default Nav;