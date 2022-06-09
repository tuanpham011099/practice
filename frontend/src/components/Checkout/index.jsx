import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

function Checkout(props) {

    const { cartId, payment } = useParams();

    const [orders, setOrders] = useState();

    useEffect(() => {
        let TOKEN = JSON.parse(localStorage.getItem('user')).token;
        axios.post(`http://localhost:5000/orders/${cartId}/checkout?payment=${payment}`, {}, {
            headers: { authorization: `Bearer ${TOKEN}` }
        }).then(res => {  setOrders(res.data)})
            .catch(error => Swal.fire({ icon: 'error', text: error }));
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="mx-auto">
                    <h4>Your order</h4>
                </div>

            </div>
            <div className="row">
                <div className="col-md-10 offset-md-1">
                    <table style={{ border: '1px solid grey' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Payment method</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Complete day</th>
                            </tr>
                       </thead>

                        <tbody>
                            {
                                orders && orders.map(item =>
                                    <tr key={item.orderId}>
                                        <td>{item.orderId}</td>
                                        <td>{item.payment}</td>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>${item.total}</td>
                                        <td>{item.completedDay}</td>
                                    </tr>)
                            }
                       </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
}

export default Checkout;