import axios from 'axios';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Product({ product }) {

    const navigate = useNavigate();


    const addToCart = (id) => {
        let TOKEN;

        if (localStorage.getItem('user')) {
            TOKEN = JSON.parse(localStorage.getItem('user')).token;
            axios({ url: `http://localhost:5000/carts/add/${id}`, data: { quantity: 1 }, method: 'post', headers: { 'authorization': `Bearer ${TOKEN}` } })
                .then((res) =>
                    Swal.fire({ icon: 'success', text: res.data.msg })
                    .then(() => window.location.reload()))
                .catch(error => Swal.fire({ icon: 'error', text: 'Something wrong' }));
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="col-md-4" style={{ borderRadius: '15px', padding: '20px' }} >
            <div className="card">
                <div className="card-header" style={{ height: '200px' }}>
                    <Link to={'/product/' + product.name + '-' + product.id}>
                        <img style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'fill' }} src={product.images[0].href} alt="" className="img-responsive" />
                    </Link>
                </div>
                <div className="card-body">
                    <h4><Link to={'/product/' + product.name + '-' + product.id} style={{ textDecoration: 'none' }} >{product.name}</Link></h4>
                    <p className='card-text' style={{ height: '50px', overflowY: 'hidden' }}>{product.description}</p>
                    <h5 className="card-text" >${product.price}</h5>
                </div>
                <div className="card-footer">
                    <button className="btn btn-info" onClick={() => addToCart(product.id)}>Add to cart</button>
                </div>
            </div>
        </div>
    );
}

export default Product;