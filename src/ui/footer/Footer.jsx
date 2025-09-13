import React from 'react';
import {Link} from "react-router-dom";

const Footer = () => {
    return (
        <div>
            <footer style={styles.footer}>
                <div>
                    <h3>GearTalk</h3>
                    <p>Forum for automotive enthusiasts</p>
                </div>
                <div>
                    <Link to="/" style={styles.footerLink}>Home</Link>
                    <Link to="/threads" style={styles.footerLink}>Threads</Link>
                    <Link to="/cars" style={styles.footerLink}>Cars</Link>
                    <Link to="/carspecs" style={styles.footerLink}>Compare</Link>
                </div>
                <div>
                    <p>Follow us:</p>
                    <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    footer: {
        backgroundColor: "#1f1f1f", color: "white",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "2rem 4rem", paddingTop:"22px", flexWrap: "wrap", gap: "1rem"
    },
    footerLink: {
        display: "block",
        color: "white",
        textDecoration: "none",
        margin: "0.3rem 0"
    },
}

export default Footer;
