import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [orders, setOrders] = useState();
    const [selectedFile, setSelectedFile] = useState();
    const [date, setDate] = useState('ASC');
    const [detail, setDetail] = useState([]);
    const [orderId, setOrderId] = useState();

    if (!localStorage.getItem('user')) {
        navigate('/login');
        return;
    }

    const TOKEN = JSON.parse(localStorage.getItem('user')).token;

    useEffect(() => {
        axios.get('http://localhost:5000/users/profile', { headers: { authorization: `Bearer ${TOKEN}` } })
            .then(res => setUser(res.data));
        axios({ url: `http://localhost:5000/orders/user/${id}?date=${date}`, method: 'GET', headers: { authorization: `Bearer ${TOKEN}` } })
            .then(res => {
                let temp = res.data.map(item => item.orders);
                setOrders(temp);
            })
            .catch(error => console.log(error));
    }, [id, date]);

    const uploadAvatar = async () => {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        axios({ method: 'patch', url: `http://localhost:5000/users/${id}/update-avatar`, data: formData, headers: { authorization: `Bearer ${TOKEN}` } })
            .then(res => Swal.fire({ icon: 'success', text: res.data.msg }))
            .catch(error => Swal.fire({ icon: 'error', text: 'Something went wrong' }));
    };

    const fetchOrder = (orderId) => {
        axios.get(`http://localhost:5000/orders/${orderId}`, { headers: { authorization: `Bearer ${TOKEN}` } })
            .then(res => setDetail(res.data))
            .catch(error => console.log(error));
    };

    useEffect(() => {
        fetchOrder(orderId);
    }, [orderId]);


    return (
        <>
            <div className="container py-5 px-5">
                <div className="row" id="product">
                    <div className="col-md-4" style={{ zIndex: '99' }}>
                        {user && <div className="card" style={{ width: " 18rem", border: '1px solid #c7c5c5', padding: '10px', width: '100%', borderRadius: '5px' }}>
                            <img className="card-img-top" src={user.avatar} style={{ maxHeight: '100px', maxWidth: '100%' }} alt="Card image cap" />
                            <input type="file" name="avatar" id="avatar" className='form-control' onChange={(e) => setSelectedFile(e.target.files[0])} />
                            <button className='btn btn-secondary' onClick={uploadAvatar} >upload</button>
                            <div className="card-body" style={{ borderBottom: '1px solid grey' }}>
                                <h4 className="card-title"> {user.name}</h4>
                                <p className="card-text">Birthday: {user.birthday.split('T')[0]}</p>
                                <p className='card-text'>Gender: {user.gender ? 'Male' : 'Female'}</p>
                            </div>
                            <div className="card-footer">
                                <p className="card-text">Email: {user.email}</p>
                                <p className="card-text">Phone: {user.phone}</p>
                                <Link to={`/profile/edit/${id}`} className='btn btn-success'>Edit profile</Link>
                                <Link className='btn btn-warning' to={`/profile/changepass/${id}`} >Change password</Link>
                            </div>
                        </div>}
                    </div>
                    <div className="col-md-8" style={{ maxHeight: '500px', overflowY: 'scroll' }}>
                        <div className="row" >
                            <label htmlFor="">Date: </label>
                            <select name="name" className='form-control' onChange={(e) => setDate(e.target.value)} >
                                <option value="ASC">a-z</option>
                                <option value="DESC">z-a</option>
                            </select>
                        </div>
                        <div className="row">
                            <table style={{ overflowY: 'scroll' }} className='table-bordered table'>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Completed</th>
                                        <th>Order day</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders && orders.map(order =>
                                        <tr key={order.orderId}  >
                                            <td>{order.status}</td>
                                            <td>{order.payment}</td>
                                            <td>{order.completedDay ? order.completedDay.split('T')[0] : 'Not yet complete'}</td>
                                            <td>{order.orderDay.split('T')[0]}</td>
                                            <td ><button style={{ margin: '5px 25px' }} className="btn btn-success" onClick={() => setOrderId(order.orderId)} >Detail</button></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row mx-auto" style={{ background: 'white', padding: '20px' }}>
                    <div className="col-md-12 mx-auto">
                        {
                            detail && <div className='w-100'>
                                <h5>Order ID:  <span style={{ color: 'red' }}>{detail.orderId}</span> </h5>
                                <h5>Payment:  <span style={{ color: 'red' }}>{detail.payment}</span> </h5>
                                <h5> Day of Order: <span style={{ color: 'red' }}>  {detail.orderDay&&detail.orderDay.split('T')[0]}</span> </h5>
                                <h5>Completed:  <span style={{ color: 'red' }}>{detail.completedDay ? detail.completedDay.split('T')[0] : 'Not yet completed'}</span>
                                </h5>
                                <h5>Total: <span style={{ color: 'red' }}>  $ {detail.totalPrice}</span> </h5>
                            </div>
                        }
                        <table style={{ overflowY: 'scroll', maxHeight: '500px' }} className='table-bordered table' >
                            <thead>
                                <tr>
                                    <th>Thumbnail</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>To money</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    detail.products && detail.products.map(product =>
                                        <Details product={product} key={product.id} />
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

function Details({product}) {
    return <tr >
        <td>{product.images && <img width={'50px'} height={'50px'} src={product.images[0].href} />}</td>
        <td>{product.name}</td>
        <td>{product.description}</td>
        <td>${product.price}</td>
        <td>{product.quantity}</td>
        <td>$ {product.total}</td>
        <td ><Link style={{ margin: '5px 25px' }} to={`/product/${product.name}-${product.id}`} className="btn btn-success">Detail</Link></td>
    </tr>;
}

export default Profile;