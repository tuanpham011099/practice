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
            .then(res => { setCategory(res.data); setProducts(res.data.products); })
            .catch(console.error);
    }, [id]);

    return (
        <>
            <div className="col-sm-12 ">
                <h4 className="section-title-7"><span className="roboto-slab uppercase">{category.name}</span></h4>
            </div>
            {
                products.map(product => <Item product={product} key={product.id} />)
            }
        </>
    );
}

export default Product;