import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Item from '../Home/Product';

function Product(props) {
    const { id } = useParams();
    const [category, setCategory] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/categories/' + id)
            .then(res => { console.log(res.data); setCategory(res.data); setProducts(res.data.products); })
            .catch(console.error);
    }, [id]);

    return (
        <>
            <div className="container">
                <div className="row w-100">
                    <div className="col-sm-12 text-center">
                        <h2 className="section-title-7"><span className="roboto-slab uppercase">{category.name}</span></h2>
                    </div>
                </div>
                <div className="row">
                    {
                        products.map(product => <Item product={product} key={product.id} />)
                    }
                </div>
           </div>
        </>
    );
}

export default Product;