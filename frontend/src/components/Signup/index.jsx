import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './index.css';


function Signup(props) {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [rePassword, setRePassword] = useState();

    const validPassword = (password) => {
        return password.trim().match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/);
    };


    const register = (e) => {
        e.preventDefault();
        if (!user.email || !user.password || !user.fullname || !user.address || !rePassword)
            return Swal.fire({ icon: 'error', text: 'Please fill all the fields' });
        if (rePassword !== user.password)
            return Swal.fire({ icon: 'error', text: 'Passwords must match' });
        if (!validPassword(user.password))
            return Swal.fire({ icon: 'error', text: 'Password contains atleast 1 special character, 1 number, 1 character' });
        axios.post('http://localhost:5000/users', user)
            .then(res => {
                if (res.data.status === 200) {
                    Swal.fire({ icon: 'success', text: res.data.message }).then(() => {
                        navigate('/login');
                    });
                }
                else if (res.data.status === 402)
                    Swal.fire({ icon: 'error', html: `User exist: ` + '<a href="/fpassword">Forgot password</a>' });
                else Swal.fire({ icon: 'error', text: res.data.message });
            })
            .catch(error => Swal.fire({ icon: 'error', text: 'Something went wrong' }));
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
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                        <div className="form-group">
                                            <input type="email" className="form-control abc" placeholder="Email" name='email' onChange={e => setUser({ ...user, [e.target.name]: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                        <div className="form-group">
                                            <input type="text" className="form-control abc" placeholder="Full name" name='fullname' onChange={e => setUser({ ...user, [e.target.name]: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                        <div className="form-group">
                                            <input type="password" className="form-control abc" placeholder="Password" name='password' onChange={e => setUser({ ...user, [e.target.name]: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                        <div className="form-group">
                                            <input type="password" className="form-control abc" placeholder="Re-password" name='password' onChange={e => setRePassword(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                        <div className="form-group">
                                            <input type="text" className="form-control abc" placeholder="Address" name='address' onChange={e => setUser({ ...user, [e.target.name]: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="actions clearfix">
                                    <button type="submit" className="btn btn-primary btn-block" onClick={register} >Signup</button>
                                </div>

                                <Link to={'/login'} className="additional-link">Have an Account? <span>Login Now</span></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

    );
}

export default Signup;