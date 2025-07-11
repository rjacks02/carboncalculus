import React, {useState, useEffect, useRef} from "react";
import styles from '../../css/NPV.module.css';

import BarChart from './BarChart';
import Graph from './Graph';

const Visuals = ({scenarioData, index}) => {
    const compare = useRef(['Base 5%', 'Base 10%']);

    function formatNPV(npv){
        if (npv){
            let stringNPV = npv.toString();
            if(stringNPV.substring(0,1) === '-'){
                return ('-$' + stringNPV.substring(1));
            }
            else{
                return ('$' + stringNPV);
            }
        }
    }

    return (
        <div className = {styles.section}>
            <h2 className = {styles.sectionTitle}>Results and Visualizations for <br/> Current Scenario</h2>
            <div className = {styles.npv}>Net Present Value: {formatNPV(scenarioData[index]?.npv)}</div>
            <Graph vertical = {true} vals = {scenarioData[index]?.npvTotalValues}/>
            <BarChart vertical = {true} vals = {scenarioData[index]?.npvYearlyValues}/>
        </div>
    );
};

export default Visuals;