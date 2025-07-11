import React, {useState, useEffect, useRef} from "react";
import styles from '../../css/NPV.module.css';

import BarChart from './BarChart';
import Graph from './Graph';

const Visuals = ({scenarioData, index, units, delay, vertical, emissions}) => {
    const [activeTab, setActiveTab] = useState('Graph');

    function renderVisual(){
        if (activeTab === 'Graph'){
            return (
                <Graph name = {index === 0 ? `(BAU) ${scenarioData[index].name}` : scenarioData[index].name} vertical = {false} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvTotalValues ?? [] : (scenarioData[index]?.npvTotalValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} emissions = {emissions}/>
            )
        }
        else{
            return (
                <BarChart name = {index === 0 ? `(BAU) ${scenarioData[index].name}` : scenarioData[index].name} vertical = {false} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvYearlyValues ?? [] : (scenarioData[index]?.npvYearlyValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} delay = {delay} emissions = {emissions}/>
            )
        }
    }

    return (
        <div>
            {vertical && (<div className = {styles.section}>
                <h2 className = {styles.sectionTitle} onClick = {() => console.log('npv: ' + scenarioData[index].npv)}>Results and Visualizations for <br/> Current Scenario</h2>
                <div className = {styles.npv}>NPV<sub>CO<sub>2</sub></sub>: {(scenarioData[index]?.npv ?? 0).toFixed(2)} {units}</div>
                <Graph name = {index === 0 ? `(BAU) ${scenarioData[index].name}` : scenarioData[index].name} vertical = {true} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvTotalValues ?? [] : (scenarioData[index]?.npvTotalValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} emissions = {emissions}/>
                <BarChart name = {index === 0 ? `(BAU) ${scenarioData[index].name}` : scenarioData[index].name} vertical = {true} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvYearlyValues ?? [] : (scenarioData[index]?.npvYearlyValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} delay = {delay} emissions = {emissions}/>
            </div>)}
            {!vertical && (<div className = {styles.sectionHorizontal}>
                <div className = {styles.npv} onClick = {() => console.log(scenarioData[index])}>NPV<sub>CO<sub>2</sub></sub>: {(scenarioData[index]?.npv ?? 0).toFixed(2)} {units}</div>
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
            </div>)}
        </div>
    );
};

export default Visuals;