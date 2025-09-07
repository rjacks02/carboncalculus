import React, {useState} from "react"; //react imports

import styles from '../../css/NPV.module.css'; //styling imports

//component imports
import BarChart from './BarChart';
import Graph from './Graph';

import info from './info.json' //more info about terms

const Visuals = ({scenarioData, index, units, delay, vertical, emissions}) => {
    const [activeTab, setActiveTab] = useState('Graph'); //tab is Graph or Bar Chart
    const [showInfo, setShowInfo] = useState(false); //show info popup

    function renderVisual(){
        if (activeTab === 'Graph'){
            return (
                <Graph name = {scenarioData[index].name} vertical = {false} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvTotalValues ?? [] : (scenarioData[index]?.npvTotalValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} emissions = {emissions}/>
            )
        }
        else{
            return (
                <BarChart name = {scenarioData[index].name} vertical = {false} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvYearlyValues ?? [] : (scenarioData[index]?.npvYearlyValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} delay = {delay} emissions = {emissions}/>
            )
        }
    }

    return (
        <div>
            {vertical && (
                <div className = {styles.section}>
                    <h2 className = {styles.sectionTitle}>Results and Visualizations for <br/> Current Scenario</h2>
                    <div className = {styles.npv}>
                        <span className = {styles.info}>
                            <i className="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
                        </span>
                        NPV<sub>CO<sub>2</sub></sub>: {(scenarioData[index]?.npv ?? 0).toFixed(2)} {units} Today
                    </div>
                    <Graph name = {scenarioData[index].name} vertical = {true} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvTotalValues ?? [] : (scenarioData[index]?.npvTotalValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} emissions = {emissions}/>
                    <BarChart name = {scenarioData[index].name} vertical = {true} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvYearlyValues ?? [] : (scenarioData[index]?.npvYearlyValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} delay = {delay} emissions = {emissions}/>
                </div>
            )}

            {!vertical && (
                <div className = {styles.sectionHorizontal}>
                    <div className = {styles.npv}>
                        <span className = {styles.info}>
                            <i className="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
                        </span>
                        NPV<sub>CO<sub>2</sub></sub>: {(scenarioData[index]?.npv ?? 0).toFixed(2)} {units} Today
                    </div>
                    <div className = {styles.visualContainer}>
                        <div className={styles.tabsContainer}>
                            {[{label: (
                                    <>
                                    Cumulative NPV<sub>CO<sub>2</sub></sub>
                                    </>
                                ),
                                value: 'Graph'
                                },
                                {label: (
                                    <>
                                    Yearly PV<sub>CO<sub>2</sub></sub>
                                    </>
                                ),
                                value: 'Bar Chart'
                                }
                            ].map(({ label, value }) => (
                                <div
                                    key={value}
                                    className={`${styles.tab} ${activeTab === value ? styles.active : ''}`}
                                    onClick={() => setActiveTab(value)}>
                                    {label}
                                </div>
                            ))}

                        </div>
                        <div className = {styles.visualOptionsContainer}>
                            {renderVisual()}
                        </div>
                    </div>
                </div>
            )}
            
            {showInfo && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>NPV<sub>CO<sub>2</sub></sub></h2>
                        <p>{info[`NPV<sub>CO2</sub>`]}</p>
                        <div className = {styles.popup2Container}> 
                            <button className = {styles.popupButton} onClick={() => {setShowInfo(false);}}>Close</button>
                            <button className = {styles.popupButton} onClick={() => {setShowInfo(false);}}>Read More</button>
                        </div>
                    </div>
                </div>
            )}
        
        </div>
        
    );
};

export default Visuals;