import React from "react"; //react imports
import { useNavigate } from "react-router-dom"; //navigation imports

import styles from '../css/NPV.module.css'; //styling imports

const Home = () => {
    const navigate = useNavigate(); //navigation

    return (
        <div className = {styles.home}>
            <div>
                <div className = {styles.title}>
                    <h2>Carbon Calculus™</h2>
                </div>
                <div className = {styles.subtitle}>
                    <h2>"A Novel Approach to Quantify the Net Present Value of Carbon Dioxide Emission Reductions (NPV<sub>CO2</sub>) and Assist in More Efficiently Comparing the Value of Decarbonization Actions."</h2>
                </div>
                <div className = {styles.homeButtonContainer}>
                    <button className = {styles.homeButton} onClick = {() => {navigate('/NPVCarbon', { state: { fromHome: true } })}}>Begin Calculations</button>
                </div>
            </div>
        </div>
    );
};

export default Home;