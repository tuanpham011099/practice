import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


function Product(props) {

    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState();
    const [defaultImg, setDefaultImg] = useState();
    const [amount, setAmount] = useState(1);

    useEffect(() => {
        axios.get('http://localhost:5000/products/' + id)
            .then(res => {
                console.log(res.data);
                setProduct(res.data);
                res.data.images.map(item => item.is_default === true && setDefaultImg(item.href));
            })
            .catch(error => console.log(error));
    }, [id]);

    const decreaseAmount = () => {
        if (amount == 1) return;
        setAmount(amount - 1);
    };

    const increaseAmount = () => {
        if (amount == product.amount) return;
        setAmount(Number(amount) + 1);
    };

    const addToCart = (quantity) => {
        if (amount > product.amount) {
            Swal.fire({ icon: 'error', text: 'Product quantity exceed!!!' });
            return;
        }
        let TOKEN;
        if (!localStorage.getItem('user'))
            navigate('/login');
        else {
            TOKEN = JSON.parse(localStorage.getItem('user')).token;
            axios({ url: `http://localhost:5000/carts/add/${id}`, data: { quantity }, method: 'post', headers: { 'authorization': `Bearer ${TOKEN}` } })
                .then((res) => Swal.fire({ icon: 'success', text: res.data.msg })).catch(error => Swal.fire({ icon: 'error', text: 'Something wrong' }));

        }
    };

    return (
        product && <>
            <section>
                <div className="header-inner two">
                    <div className="inner text-center">
                        <h3 className="title text-black uppercase roboto-slab">Product detail</h3>
                    </div>
                    <div className="overlay bg-opacity-5" />
                    <img src="#" alt="" className="img-responsive" /> </div>
            </section>
            <section className="sec-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 col-sm-12 col-xs-12">
                            <div className="product_preview_left bmargin">
                                <div className="gallery">
                                    <div className="full">
                                        <img src={defaultImg} alt="" style={{ width: '300px', height: '300px' }} />
                                    </div>
                                    <div className="previews">{
                                        product.images.map((img, i) =>
                                            i == 1 ? <a className="selected" key={i} data-full={defaultImg}><img src={defaultImg} alt="" width={'50px'} height={'50px'} /></a> : <a data-full={img.href} key={i} ><img src={img.href} alt="" width={'50px'} height={'50px'} /></a>
                                        )
                                    }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-sm-12 col-xs-12 bmargin">
                            <h3 className=" raleway">{product.name}</h3>
                            <div className="divider-line solid light opacity-6" />
                            <br />
                            <div className="col-md-8 col-sm-6">
                                <h3 className="text-red-4">$ {product.price}</h3>
                            </div>
                            <div className="col-md-4 col-sm-6 text-right product-review-stars">
                            </div>
                            <br />
                            <p><strong>Description:</strong> {product.description} </p>
                            <br />
                            <p><strong>Remain quantity:</strong> {product.amount} </p>
                            <br />
                            <div className="form-group">
                                <button onClick={decreaseAmount} className='btn btn-sm' style={{ background: '#bebebe' }} >-</button>
                                <input type="number" name="quantity"  className='quantityInput' min={1} value={amount} max={product.amount} onChange={(e) => setAmount(e.target.value)} />
                                <button onClick={increaseAmount} className='btn btn-sm' style={{ background: '#bebebe' }} >+</button>
                            </div>
                            <button className="btn btn-info" onClick={() => addToCart(amount)} >Add to cart</button>
                            <div className="clearfix" />
                            <br />
                            <br />
                            <ul className="product-details">
                                <li><span>Product ID :</span> {product.id}</li>
                                <li><span>Category  :</span>{product.categories.map(item => item.name + ' ')} </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>

    );
}

export default Product;