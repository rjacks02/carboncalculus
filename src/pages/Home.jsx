import React, {useState} from "react";
import { useNavigate } from "react-router-dom";

import styles from '../css/NPV.module.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className = {styles.home}>
            <div>
                <div className = {styles.title}>
                    <h2>Carbon Calculus™</h2>
                </div>
                <div className = {styles.subtitle}>
                    <h2>"A novel approach to quantify the net present value of carbon dioxide emission reductions (NPV CO2) and assist in more efficiently comparing the value of decarbonization actions"</h2>
                </div>
                <div className = {styles.homeButtonContainer}>
                    <button className = {styles.homeButton}>FAQs/Tutorial</button>
                    <button className = {styles.homeButton} onClick = {() => {navigate('/NPVCarbon')}}>Begin Calculations</button>
                    <button className = {styles.homeButton}>Our Research</button>
                </div>
            </div>
        </div>
    );
};

export default Home;