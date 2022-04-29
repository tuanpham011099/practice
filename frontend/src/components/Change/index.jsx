import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './index.css';

function Change(props) {

    const navigate = useNavigate();

    const [old, setOld] = useState();
    const [newP, setNewP] = useState();
    const [newP2, setNewP2] = useState();

    const validPassword = (password) => {
        return password.trim().match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/);
    };


    const change = (e) => {
        const TOKEN = JSON.parse(localStorage.getItem('user')).token;
        e.preventDefault();
        if (!old || !newP || !newP2)
            return Swal.fire({ icon: 'info', text: 'Please provide current and new password' });
        if (newP !== newP2)
            return Swal.fire({ icon: 'error', text: 'Passwords must match' });
        axios.post('http://localhost:5000/users/change-password', { oldPassword: old, newPassword: newP }, {
            headers: {
                authorization: `Bearer ${TOKEN}`
            }
        }).then(res => {
            if (res.data.status === 200) {
                Swal.fire({ icon: 'success', text: res.data.message });
                localStorage.removeItem('user');
                window.location.reload();
                navigate('/login');
            } else {
                Swal.fire({ icon: 'info', text: res.data.message });
            }
        });
    };

    return (
        <div className="container">
            <form action="#">
                <div className="row justify-content-md-center">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12">
                        <div className="login-screen">
                            <div className="login-box">
                                <a href="#" className="login-logo">
                                    <img src="//ssl.gstatic.com/accounts/ui/logo_2x.png" alt="Bootdey bootstrap snippets bootdey" />
                                </a>
                                <div className="row gutters">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <input type="password" className="form-control abc" style={{ width: '100%' }} placeholder="Current password" name='currPassword' onChange={e => setOld(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row gutters">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <input type="password" className="form-control abc" style={{ width: '100%' }} placeholder="New password" name='newPassword' onChange={e => setNewP(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row gutters">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <input type="password" className="form-control abc" style={{ width: '100%' }} placeholder="New password" name='newPassword' onChange={e => setNewP2(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="actions clearfix">
                                    <button type="submit" className="btn btn-primary btn-block" onClick={change} >Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Change;