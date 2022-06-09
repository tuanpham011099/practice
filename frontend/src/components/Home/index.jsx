import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Product from './Product';
import './index.css';

function Home({ q }) {

    const [products, setProducts] = useState([]);
    const [name, setName] = useState('ASC');
    const [price, setPrice] = useState('ASC');
    const [count, setCount] = useState();
    const [page, setPage] = useState(1);

    const onPriceSortChange = value => {
        setPrice(value);
    };
    const onNameSortChange = value => {
        setName(value);
    };

    const pageChange = value => {
        setPage(value);
    }

    useEffect(() => {
        axios.get(`http://localhost:5000/products?name=${name}&price=${price}&q=${q}&page=${page}`)
            .then(res => { console.log(res.data); setProducts(res.data.rows); setCount(Math.ceil(res.data.count/5))})
            .catch(error => console.log(error));
    }, [name, price, q, page]);

    return (
        <div className="container">
            <div className="row py-5">
                <div className="col-sm-12 text-center">
                    <h3 className="uppercase">Products</h3>
                </div>
            </div>
            <div className='row'>
                <div className="col-sm-12 ">
                    <label htmlFor="">Price: </label>
                    <select name="price" className='selectBox' onChange={(e) => onPriceSortChange(e.target.value)} >
                        <option value="ASC">Increment</option>
                        <option value="DESC">Decrement</option>
                    </select>
                    <label htmlFor="">Name: </label>
                    <select name="name" className='selectBox' onChange={(e) => onNameSortChange(e.target.value)} >
                        <option value="ASC">a-z</option>
                        <option value="DESC">z-a</option>
                    </select>
                </div>
            </div>
            <div className="row my-3">
                {products.map(product => <Product product={product} key={product.id} />)}
            </div>
            <div className="row">
                <nav aria-label="Page navigation">
                    <ul className="pagination">
                        {[...Array(count)].map((x, i) => 
                            <li className="page-item" key={i}>
                                <button className="btn page-link" disabled={page===i+1 ? true : false} onClick={() => pageChange(i + 1)}>{i + 1}</button>
                            </li>
                        )}
                    </ul>
                </nav>

            </div>
        </div>

    );
}

export default Home;
