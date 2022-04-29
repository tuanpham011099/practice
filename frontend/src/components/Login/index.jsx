import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Login(props) {

    const [a, setA] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user)
            navigate('/');
    }, []);

    const login = (e) => {
        e.preventDefault();
        if (!a || !a.email || !a.password) {
            Swal.fire({ icon: 'error', text: 'Error', title: 'Missing data' });
        }
        axios({ method: 'post', url: 'http://localhost:5000/users/login', data: a })
            .then(res => { window.location.reload(); localStorage.setItem('user', JSON.stringify(res.data)); navigate('/'); })
            .catch(error => console.log(error));
    };


    return (
        <div className="container my-5">
            <div className='row'>
                <div className="col-md-6 offset-md-3" style={{ boxShadow: '0px 0px 25px -5px rgba(0,0,0,0.75)', borderRadius: '15px', padding: '20px', border: '1px solid #707070bf' }}>
                    <div className="card-title">
                        <h2 >Log in</h2>
                    </div>
                    <form onSubmit={login} >
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="text" id="login" className="form-control" name="email" placeholder="Email" onChange={(e) => setA({ ...a, [e.target.name]: e.target.value })} />

                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" className="form-control" name="password" placeholder="password" onChange={(e) => setA({ ...a, [e.target.name]: e.target.value })} />
                        </div>
                        <button type='submit' className='btn btn-primary mx-auto'>Log in</button>
                    </form>
                    <div id="card-footer">
                        <a href="/fpassword">Forgot Password?</a>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Login;