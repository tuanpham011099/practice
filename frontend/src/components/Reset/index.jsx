import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Reset(props) {
    const navigate = useNavigate();
    const [email, setEmail] = useState();

    const reset = (e) => {
        e.preventDefault();
        if (!email)
            return Swal.fire({ icon: 'error', text: 'Please input your email!' });
        axios.post('http://localhost:5000/users/forgot-password', { email }).then(res => {
            if (res.data.status === 200)
                Swal.fire({ icon: 'success', text: 'Please go to your mail and change password' }).then(() => {
                    navigate('/login');
                });
            else
                Swal.fire({ icon: 'error', text: res.data.message });
        }).catch(error => { console.log(error); });
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
                                            <input type="email" className="form-control abc" style={{ width: '100%' }} placeholder="Email" name='email' onChange={e => setEmail(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="actions clearfix">
                                    <button type="submit" className="btn btn-primary btn-block" onClick={reset} >Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Reset;