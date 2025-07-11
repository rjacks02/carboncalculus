import React from "react";
import { useNavigate } from "react-router-dom";

import styles from '../css/NPV.module.css'

const Header = ({vertical, setVertical, units, setUnits, convertToKilograms, convertToTons, emissions, setEmissions}) => {
    const navigate = useNavigate();

    return (
        <div className = {styles.headerContainer}>
            <h2 className = {styles.header}>Carbon Calculus™</h2>
            <button className = {styles.navButton} onClick = {() => {navigate('/Home')}}>Home</button>
            <button className = {styles.navButton} onClick = {() => {navigate('/FAQs')}}>FAQs/Tutorial</button>
            <button className = {styles.navButton}>Our Research</button>
            <div className={styles.dropdown}>
                <button className={styles.navButton}>More Options</button>
                <div className={styles.dropdownContent}>
                <a onClick={() => {setEmissions(prev => !prev);}}>Switch Mode: {emissions ? `Reductions` : 'Emissions'}</a>
                    <a onClick={() => {setVertical(prev => !prev);}}>Switch Layout: {vertical ? `Horizontal` : 'Vertical'}</a>
                    <a onClick={() => {setUnits(prev => {if (prev === 'Kilograms'){convertToTons(); return 'Metric Tons'} else{convertToKilograms(); return 'Kilograms';}})}}>Switch Units: {units === 'Kilograms' ? `Metric Tons` : 'Kilograms'}</a>
                </div>
            </div>
        </div>
    );
};

export default Header;