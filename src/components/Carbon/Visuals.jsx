import React, {useState, useEffect, useRef} from "react";
import styles from '../../css/NPV.module.css';

import BarChart from './BarChart';
import Graph from './Graph';

const Visuals = ({scenarioData, index, units, delay, vertical, emissions}) => {
    const [activeTab, setActiveTab] = useState('Graph');
    const [showInfo, setShowInfo] = useState(false);

    let info = {'Upfront Emissions': 'Upfront emissions are the amount of carbon released at the beginning of a project or intervention. They occur immediately in year 0 and thus carry full weight in Carbon Calculus, significantly influencing a scenario’s climate impact.',
    'Discount Rate': 'Carbon’s “discount” rate represents the effective annual dissipation rate of CO2 in the atmosphere through the flux of the global carbon cycle. We recommend using a discount rate somewhere in the range of 2% to 5%; 3.355% is the default, as it is aligned with prior literature and the 100-year global warming potential of CO2.',
    'Total Years': 'This refers to the full length of time modeled by the scenario. The first year is labeled as year 0, and the final year is represented by this value.',
    'Years Delayed': 'This is the number of years before a scenario begins generating or reducing emissions. Both upfront and annual emissions are affected by this delay. As the delay increases, the climate impact of those emissions or reductions decreases due to the discount rate.',
    'Long-Term Value': 'Enabling this function accounts for the limit of your scenario, taking your final year’s emission rate and assuming that rate continues for many years to come. This is encouraged as a default setting, as most real-world emissions will not stop at the end of your chosen time horizon, but that ultimately depends on your scenario.',
    'NPV<sub>CO<sub>2</sub></sub>': 'This is the cumulative net discounted CO2 emitted into the atmosphere per your scenario, valued from the perspective of emissions today. For example, at a 3.355% annual discount rate, 1 ton of CO2 emitted annually, indefinitely, has a net present value (NPV_CO_2) of 30.8 tons of CO2 emitted only once, today. The term “value” here is a proxy for “impact,” as quantity emitted, when those emissions occur, and the rate at which those emissions dissipate all contribute to the impact that CO2 in the atmosphere has on global radiative forcing (the greenhouse effect, global average temperature increase).',
    'BAU (Business As Usual)': 'This is a scenario that represents the current projected annual emissions rate if today’s actions are continued. This is likely a continuation of today’s emissions rate indefinitely, depending on one’s assumptions for what their “business as usual” is. This should not reflect targets or commitments for emissions reductions, which can be modeled as its own scenario.',
    'D<sub>Eff</sub> (Effective Decarbonization)': 'This represents the relative difference between a scenario’s emissions (emissions resulting from taking some sort of action) and BAU emissions (a continuation of today’s emissions, the “do nothing” case). This metric helps to answer the question, “how effective is this scenario compared to what is currently happening?”. While NPV_CO_2 is an absolute metric, this is a metric relative to BAU.'
};

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
            {vertical && (<div className = {styles.section}>
                <h2 className = {styles.sectionTitle}>Results and Visualizations for <br/> Current Scenario</h2>
                <div className = {styles.npv}><span className = {styles.info}><i className="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
                            </span>NPV<sub>CO<sub>2</sub></sub>: {(scenarioData[index]?.npv ?? 0).toFixed(2)} {units} Today</div>
                <Graph name = {scenarioData[index].name} vertical = {true} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvTotalValues ?? [] : (scenarioData[index]?.npvTotalValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} emissions = {emissions}/>
                <BarChart name = {scenarioData[index].name} vertical = {true} vals = {scenarioData[index]?.longTerm ? scenarioData[index]?.npvYearlyValues ?? [] : (scenarioData[index]?.npvYearlyValues ?? []).slice(0, parseInt(scenarioData[index]?.totalYears)+parseInt(scenarioData[index]?.delay)+1)} units = {units} delay = {delay} emissions = {emissions}/>
            </div>)}
            {!vertical && (<div className = {styles.sectionHorizontal}>
                <div className = {styles.npv} ><span className = {styles.info}><i className="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
                            </span>NPV<sub>CO<sub>2</sub></sub>: {(scenarioData[index]?.npv ?? 0).toFixed(2)} {units} Today</div>
                <div className = {styles.visualContainer}>
                            <div className={styles.tabsContainer}>
                            {[
                                {
                                label: (
                                    <>
                                    Cumulative NPV<sub>CO<sub>2</sub></sub>
                                    </>
                                ),
                                value: 'Graph'
                                },
                                {
                                    label: (
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
            </div>)}
            {showInfo && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                    <h2>NPV<sub>CO<sub>2</sub></sub></h2>
                    <p>This is the cumulative net discounted CO<sub>2</sub> emitted into the atmosphere per your scenario, valued from the perspective of emissions today. For example, at a 3.355% annual discount rate, 1 ton of CO<sub>2</sub> emitted annually, indefinitely, has a net present value (NPV<sub>CO<sub>2</sub></sub>) of 30.8 tons of CO<sub>2</sub> emitted only once, today. The term “value” here is a proxy for “impact,” as quantity emitted, when those emissions occur, and the rate at which those emissions dissipate all contribute to the impact that CO<sub>2</sub> in the atmosphere has on global radiative forcing (the greenhouse effect, global average temperature increase).</p>
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