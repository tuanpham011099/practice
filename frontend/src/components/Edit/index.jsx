import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Edit(props) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!localStorage.getItem('user')) navigate('/login');
    // const [user, setUser] = useState();
    const [name, setName] = useState();
    const [gender, setGender] = useState();
    const [birthDay, setBirthDay] = useState();
    const [email, setEmail] = useState();
    const [phone, setPhone] = useState();
    const [addr, setAddr] = useState();


    useEffect(() => {
        if (!localStorage.getItem('user')) navigate('/login');
        setName(user.name);
        setGender(user.gender);
        setPhone(user.phone);
        setBirthDay(user.birthday);
        setEmail(user.email);
        setAddr(user.address);
    }, []);

    const updateUser = () => {
        axios.put(`http://localhost:5000/users/${user.id}/update-info`, {
            address: addr, fullname: name, phone, birthday: birthDay, gender, email
        }, {
            headers: {
                authorization: `Bearer ${user.token}`
            }
        }).then(res => { Swal.fire({ icon: 'success', text: 'Updated' }); localStorage.removeItem('user'); })
            .catch(error => Swal.fire({ icon: 'error', text: 'Something wen wrong' }));
    };


    return (
        <section className="sec-bpadding-2">
            <div className="container">
                <div className="row" id="product">
                    <div className="col-sm-12 ">
                        <h4 className="section-title-7"><span className="roboto-slab uppercase">Products</span></h4>
                    </div>
                    <div className="card" style={{ width: "100%" }}>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <label htmlFor="">Name</label>
                                <input type="text" className='form-control' name='name' value={name} onChange={e => setName(e.target.value)} />
                            </li>
                            <li className="list-group-item">
                                <label htmlFor="">Birthday</label>
                                <input type="date" className='form-control' name='birthDay' value={birthDay} onChange={e => setBirthDay(e.target.value)} />
                            </li>
                            <li className="list-group-item">
                                <label htmlFor="">Gender</label>
                                <select name="gender" className='form-control' onChange={e => setGender(e.target.value)} >
                                    <option value={1}>Male</option>
                                    <option value={0}>Female</option>
                                </select>
                            </li>
                            <li className="list-group-item">
                                <label htmlFor="">Phone</label>
                                <input className='form-control' type="number" name='phone' value={phone} onChange={e => setPhone(e.target.value)} />
                            </li>
                            <li className="list-group-item">
                                <label htmlFor="">Email</label>
                                <input className='form-control' type="text" name='email' value={email} onChange={e => setEmail(e.target.value)} />
                            </li>
                            <li className="list-group-item">
                                <label htmlFor="">Address</label>
                                <input className='form-control' type="text" name='address' value={addr} onChange={e => setAddr(e.target.value)} />
                            </li>
                            <li className="list-group-item">
                                <button className="btn btn-success" onClick={updateUser}>Update</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

    );
}

export default Edit;