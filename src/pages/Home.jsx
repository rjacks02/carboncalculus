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
                    <h2>"A novel approach to quantify the net present value of carbon dioxide emission reductions (NPV<sub>CO<sub>2</sub></sub>) and assist in more efficiently comparing the value of decarbonization actions"</h2>
                </div>
                <div className = {styles.homeButtonContainer}>
                    <button className = {styles.homeButton} onClick = {() => {navigate('/NPVCarbon', { state: { fromHome: true } })}}>Begin Calculations</button>
                </div>
            </div>
        </div>
    );
};

export default Home;