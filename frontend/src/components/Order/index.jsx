import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Order(props) {
    const [orders, setOrders] = useState();

    const { id } = useParams();

    useEffect(() => {

    }, []);

    return (
        <table style={{ border: '1px solid grey' }}>
            <tr>
                <th>ID</th>
                <th>Payment method</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Complete day</th>
            </tr>

            {
                orders && orders.map(item =>
                    <tr>
                        <td>{item.orderId}</td>
                        <td>{item.payment}</td>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>${item.total}</td>
                        <td>${item.completedDay}</td>
                    </tr>)
            }

        </table>
    );
}

export default Order;