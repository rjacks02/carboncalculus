import React, {useState, useEffect, useRef} from "react";
import styles from '../../css/NPV.module.css';

import BarChart from './BarChart';
import Graph from './Graph';

const HorizontalVisuals = ({scenarioData, index}) => {

    const [activeTab, setActiveTab] = useState('Graph');

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

    function renderVisual(){
        if (activeTab === 'Graph'){
            return (
                <Graph vertical = {false} vals = {scenarioData[index]?.npvTotalValues}/>
            )
        }
        else{
            return (
                <BarChart vertical = {false} vals = {scenarioData[index]?.npvYearlyValues}/>
            )
        }
    }

    return (
        <div className = {styles.sectionHorizontal}>
            <div className = {styles.npv}>Net Present Value: {formatNPV(scenarioData[index]?.npv)}</div>
            <div className = {styles.visualContainer}>
                        <div className={styles.tabsContainer}>
                            {['Graph', 'Bar Chart'].map((tab) => (
                            <div
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab)}>
                                {tab}
                            </div>
                            ))}
                        </div>
                        <div className = {styles.visualOptionsContainer}>
                                {renderVisual()}
                        </div>
            </div>
        </div>
    );
};

export default HorizontalVisuals;