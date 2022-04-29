import React from 'react';

function Footer(props) {
    return (
        <>
            <div className="container my-5">
                <div className="row">
                    <div className="col-xs-12 mx-auto">
                        <h3 className="">SIGN UP FOR OUR NEWSLETTER &amp; PROMOTIONS</h3>
                    </div>
                    <div className="col-md-12">
                        <input className="form-control" type="search" placeholder="Enter your Email Address" />
                        <div className="row">
                            <button className='btn btn-info mx-auto'>Subscribe</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-md-5 ">
                        <ul className="payment-type">
                            <li className='nav-link'>We Accept &nbsp;</li>
                            <li className='nav-link'><img src="/60x35" alt="" /></li>
                            <li className='nav-link' ><img src="/60x35" alt="" /></li>
                            <li className='nav-link'><img src="/60x35" alt="" /></li>
                            <li className='nav-link'><img src="/60x35" alt="" /></li>
                            <li className='nav-link'><img src="/105x35" alt="" /></li>
                        </ul>
                    </div>
                    <div className="col-md-4 bmargin"> <span>Copyright © 2020 <a href="https://1.envato.market/hasta-html-by-codelayers">Tuan</a> By <a href="https://1.envato.market/codelayers">Codelayers</a> | All rights reserved.</span> </div>
                    <div className="col-md-3 bmargin">
                        <ul className="social-icons-3 dark-2 no-margin-left pull-right">
                            <li className='nav-link'><a href="https://twitter.com/codelayers">twitter</a></li>
                            <li className='nav-link' ><a href="https://www.facebook.com/codelayers">fb</a></li>
                            <li className='nav-link' ><a href="/"><i className="fa fa-linkedin" />linked</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="clearfix" />
            <a href="/" className="scrollup red-4" >^</a>
        </>

    );
}

export default Footer;