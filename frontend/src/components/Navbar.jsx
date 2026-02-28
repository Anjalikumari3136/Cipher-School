import React from 'react';
import { Terminal, Database } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar__logo">
                <div className="icon-wrapper">
                    <Terminal size={22} strokeWidth={3} />
                </div>
                <span>Cipher<span>SQL</span></span>
            </div>
            <div className="navbar__user">
                <div className="user-info">
                    <p>Anjali Kumari</p>
                    <span>Member</span>
                </div>
                <div className="avatar">AK</div>
            </div>
        </nav>
    );
};

export default Navbar;
