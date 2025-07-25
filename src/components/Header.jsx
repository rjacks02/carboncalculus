import React from "react";
import { useNavigate } from "react-router-dom";

import styles from '../css/NPV.module.css'

const Header = ({setPage}) => {
    const navigate = useNavigate();

    return (
        <div className = {styles.headerContainer}>
            <h2 className = {styles.header}>Carbon Calculus™</h2>
            <button className = {styles.navButton} onClick = {() => {navigate('/Home')}}>Home</button>
            <button className = {styles.navButton} onClick = {() => {setPage('npv')}}>Calculator</button>
            <button className = {styles.navButton} onClick = {() => {setPage('faqs')}}>FAQs/Tutorial</button>
            <button className = {styles.navButton} onClick = {() => {}}>Our Research</button>
        </div>
    );
};

export default Header;