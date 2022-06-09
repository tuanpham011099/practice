import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';
import Item from './Item';

function Cart({ cart, setCart }) {

    const [payment, setPayment] = useState('cash');

console.log(cart)

    const navigate = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem('user'))
            navigate('/login');
    }, []);

    const order = () => {

    };

    return (
        <div className="container px-3 my-5 clearfix" style={{ height: '100%', marginBottom: '20px' }}>
            <div className="row w-100">
                <div className="card w-100">
                    <div className="card-header">
                        <h2>Shopping Cart</h2>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered m-0">
                                <thead>
                                    <tr>
                                        <th className="text-center py-3 px-4" style={{ minWidth: '400px' }}>Product Name &amp; Details</th>
                                        <th className="text-right py-3 px-4" style={{ width: '100px' }}>Price</th>
                                        <th className="text-center py-3 px-4" style={{ width: '120px' }}>Quantity</th>
                                        <th className="text-right py-3 px-4" style={{ width: '100px' }}>Total</th>
                                        <th className="text-center align-middle py-3 px-0" style={{ width: '40px' }}><a href="#" className="shop-tooltip float-none text-light" data-original-title="Clear cart"><i className="ino ion-md-trash" /></a></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.products && cart.products.map((item, index) =>
                                        <Item product={item} key={index} cartId={cart.cartId} setCart={setCart} />
                                    )}
                                </tbody>
                            </table>
                            <div className="justify-content-right">
                                <div className="font-weight-normal m-0">Total price: <h4>${cart.products && cart.products.reduce((acc, curr) => acc + curr.totalPrice, 0)}</h4></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row w-100">
                <div className="col-md-8 w-100">
                    <div className="card ">
                        <h5>Select payment method</h5>
                        <div className="form-group">
                            <label htmlFor="">Cash: </label>
                            <input type="radio" id="cash" name="payment" onChange={(e) => setPayment(e.target.value)} value="cash" defaultChecked />
                            <br />
                            <label htmlFor="">Visa: </label>
                            <input type="radio" id="visa" name="payment" onChange={(e) => setPayment(e.target.value)} value="visa" />
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <Link to={'/'} className="btn btn-lg btn-secondary md-btn-flat mt-2 mr-3">Back to shopping</Link>
                    <Link type="button" to={`/cart/${cart.cartId}/checkout-payment=${payment}`} className="btn btn-lg btn-primary mt-2" >Checkout</Link>

                </div>
            </div>
        </div>

    );
}

export default Cart;