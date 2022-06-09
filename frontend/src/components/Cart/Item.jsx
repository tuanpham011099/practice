import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function Item({ product, cartId, setCart }) {

    const [quantity, setAmount] = useState(product.quantity);
    const TOKEN = JSON.parse(localStorage.getItem('user')).token;


    const updateCart = (id, quantity) => {
        setAmount(quantity);
        axios.post(`http://localhost:5000/carts/add/${id}`, { quantity }, {
            headers: {
                authorization: `Bearer ${TOKEN}`
            }
        })
            .then(res => {
                if (res.data.status === 400) {
                   return Swal.fire({icon:'error',text:res.data.message})
               }
                fetchCart();
            })
            .catch(error => console.log(error));
    };

    const fetchCart = () => {
        axios.get('http://localhost:5000/carts', { headers: { authorization: `Bearer ${TOKEN}` } })
            .then(res => {
                setCart(res.data);
            })
            .catch(error => console.log(error));
    };


    const removeFromCart = () => {
        axios.delete(`http://localhost:5000/carts/${cartId}/product/${product.productId}`, { headers: { authorization: `Bearer ${TOKEN}` } })
            .then(res =>
                Swal.fire({ icon: 'success', text: res.data.msg })
                    .then(() => window.location.reload())
            )
            .catch(console.error);
    };


    return (
        <tr key={product.cartId}>
            <td className="p-4">
                <div className="media align-items-center">
                    {product.images.map(img => img.is_default === true && <img key={img.id} src={img.href} className="d-block ui-w-40 ui-bordered mr-4" alt="" />)}
                    <div className="media-body">
                        <Link to={`/product/${product.name}-${product.productId}`} className="d-block text-dark">{product.name}</Link>
                    </div>
                </div>
            </td>
            <td className="text-right font-weight-semibold align-middle">${product.price}</td>
            <td style={{ display: 'flex' }}>
                <input type="number" min={1} style={{ display: 'inline', padding: '0' }} className="form-control abc" value={quantity} onChange={(e) => updateCart(product.productId, e.target.value)} />
            </td>
            <td className="text-right font-weight-semibold align-middle">${product.totalPrice}</td>
            <td className="text-center align-middle px-0"><a href="#" className="shop-tooltip close float-none text-danger" data-original-title="Remove" onClick={removeFromCart} >×</a></td>
        </tr>
    );
}

export default Item;