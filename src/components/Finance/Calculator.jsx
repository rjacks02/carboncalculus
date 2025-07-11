import React, {useState, useRef, useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from '../../css/NPV.module.css'

const Calculator = ({vertical, scenario, saveToStorage, calculateNPV, updateScenario}) => {
    const [scenarioName, setName] = useState(scenario.name);
    const [initialInvestment, setInitialInvestment] = useState(scenario.initialInvestment);
    const [discountRate, setDiscountRate] = useState(scenario.discountRate);
    const [totalYears, setTotalYears] = useState(scenario.totalYears);
    const yearlyValuesRef = useRef(scenario.yearlyValuesRef.current);
    const [longTerm, setLongTerm] = useState(scenario.longTerm);
    const [activeTab, setActiveTab] = useState(scenario.activeTab);

    const basicValuesRef = useRef([...scenario.yearlyValuesRef.current]);
    const advancedValuesRef = useRef([...scenario.yearlyValuesRef.current]);


    const [update, setUpdate] = useState(true);

    const [showPopup, setShowPopup] = useState(false);
    const [rename, setRename] = useState(false);
    const [save, setSave] = useState(false);

    const AdvancedYear = ({index, value}) => {
        const [yearlyValue, setYearlyValue] = useState(value);
        return(
            <div className = {styles.inputCenter}>
                <label htmlFor="year">Year {index+1}: </label>
                <input id="year" 
                    value = {yearlyValue} 
                    onChange={(e) => {let newVal = handleMoneyChange(e.target.value); setYearlyValue(newVal); yearlyValuesRef.current[index+1] = newVal;}}  
                    onBlur = {() => {setUpdate(prev => !prev);}}
                    type="text" 
                    inputMode="decimal"/>
            </div>
        )
    }

    const BasicYear = ({endYear, value}) => {
        const [yearlyValue, setYearlyValue] = useState(value);

        return(
            <div className = {styles.inputCenter}>
                <label htmlFor="year">{endYear === '1' ? 'Year 1: ' : 'Year 1 - ' + endYear + ': '}</label>
                <input id="year" 
                    value = {yearlyValue} 
                    onChange={(e) => {let newVal = handleMoneyChange(e.target.value); setYearlyValue(newVal); const maxIndex = Number(totalYears);
                        for (let i = 1; i <= maxIndex; i++) {
                          yearlyValuesRef.current[i] = newVal;
                        }}}  
                    onBlur = {() => {setUpdate(prev => !prev);}}
                    type="text" 
                    inputMode="decimal"/>
            </div>
        )
    }

    function handleMoneyChange(val){
        let cleaned = val.replace(/[^0-9.]/g, '');

        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        else if (parts.length === 2 && parts[1].length > 2){
            cleaned = parts[0] + '.' + parts[1].substring(0, 2);
        }

        if (!cleaned.startsWith('0.') && cleaned !== '0') {
            cleaned = cleaned.replace(/^0+/, '');
        }

        if (cleaned.length === 0){
            cleaned = '0';
        }

        return '$' + cleaned;
    }

    function handlePercentChange(val){
        let cleaned = val.replace(/[^0-9.]/g, '');

        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        if (!cleaned.startsWith('0.') && cleaned !== '0') {
            cleaned = cleaned.replace(/^0+/, '');
        }

        if (cleaned.length === 0){
            cleaned = '0';
        }

        return cleaned + '%';
    }

    function handleIntegerChange(val){
        let cleaned = val.replace(/[^0-9]/g, '');

        if (cleaned.startsWith('0') && cleaned !== '0') {
            cleaned = cleaned.replace(/^0+/, '');
        }

        if (cleaned.length === 0 || cleaned === '0'){
            cleaned = '1';
        }
        return cleaned;
    }

    const handleToggle = () => {
        setLongTerm(prev => !prev);
        setUpdate(prev => !prev);
    };

    const getFullYearlyValues = () => {
        const baseValues = yearlyValuesRef.current.slice(0, parseInt(totalYears) + 1);
        if (longTerm) {
          const lastVal = baseValues[baseValues.length - 1];
          const extendedVals = Array(300 - baseValues.length).fill(lastVal);
          return [...baseValues, ...extendedVals];
        }
        return baseValues;
      };

    useEffect(() => {
        yearlyValuesRef.current[0] = initialInvestment;
        const maxIndex = Number(totalYears);
        Object.keys(yearlyValuesRef.current).forEach(key => {
            if (Number(key) > maxIndex) {
                delete yearlyValuesRef.current[key];
            }
        });

        if (activeTab === 'Basic'){
            for (let i = 1; i <= maxIndex; i++) {
                if (!yearlyValuesRef.current[i]) {
                  yearlyValuesRef.current[i] = yearlyValuesRef.current[1];
                }
              }
        }
        else{
            for (let i = 1; i <= maxIndex; i++) {
                if (!yearlyValuesRef.current[i]) {
                  yearlyValuesRef.current[i] = '$100.00';
                }
              }
        }

    }, [totalYears, initialInvestment]);

    useEffect(() => {
        updateScenario(scenarioName, initialInvestment, discountRate, totalYears, { current: getFullYearlyValues() }, longTerm, activeTab);
        calculateNPV(getFullYearlyValues(), discountRate);
    }, [update]);

    useEffect(() => {
        if (activeTab === 'Basic') {
          advancedValuesRef.current = [...yearlyValuesRef.current];
          yearlyValuesRef.current = [...basicValuesRef.current];
      
        } else {
          basicValuesRef.current = [...yearlyValuesRef.current];
          yearlyValuesRef.current = [...advancedValuesRef.current];
        }
      
        setUpdate(prev => !prev);
      }, [activeTab]);

    const renderYears = () => {
        const maxIndex = Number(totalYears);
 
        if (activeTab === 'Basic'){
            if (!yearlyValuesRef.current[1]) {
                yearlyValuesRef.current[1] = '$100.00';
              }
            for (let i = 1; i <= maxIndex; i++) {
                yearlyValuesRef.current[i] = yearlyValuesRef.current[1];
              }
        }
        else{
            for (let i = 1; i <= maxIndex; i++) {
                if (!yearlyValuesRef.current[i]) {
                  yearlyValuesRef.current[i] = '$100.00';
                }
              }
        }
      
        if (activeTab === 'Basic') {
          return (
            <div>
                <div className = {styles.inputCenter}>Constant Cash Inflow:</div>
                <BasicYear endYear = {totalYears} value={yearlyValuesRef.current[1]} />
            </div>
          );
        } else {
          return (
            <div>
                <div className = {styles.inputCenter}>Varied Cash Inflow:</div>
              {Array.from({ length: maxIndex }).map((_, index) => (
                <AdvancedYear key={index} index={index} value={yearlyValuesRef.current[index + 1]} />
              ))}
            </div>
          );
        }
      };
      
    return (
        <div>
        {vertical && (<div className = {styles.section}>
            <div className = {styles.naming}>
                <h2 className = {styles.scenarioTitle}>Name: {scenarioName}</h2>
                <button className = {styles.renameButton} onClick = {() => {setShowPopup(true); setRename(true);}}>Edit Name</button>
            </div>
            <div className = {styles.calcColumns}>
                <div className = {styles.calcCenter}>
                    <div className = {styles.totalYears}>
                        <label htmlFor="initialInvestment">Initial Investment: </label>
                        <input id="initialInvestment" 
                            value = {initialInvestment} 
                            onChange={(e) => setInitialInvestment(handleMoneyChange(e.target.value))}
                            onBlur = {() => {setUpdate(prev => !prev);}} 
                            type="text" inputMode="decimal"/>
                    </div>
                    <div className = {styles.totalYears}>
                        <label htmlFor="discountRate">Discount Rate: </label>
                        <input id="discountRate" 
                            value = {discountRate} 
                            onChange={(e) => setDiscountRate(handlePercentChange(e.target.value))} 
                            onBlur = {() => {setUpdate(prev => !prev);}}
                            type="text" inputMode="decimal"/>
                    </div>
                    <div className = {styles.totalYears}>
                            <label htmlFor="totalYears">Total Years: </label>
                            <input id="totalYears" 
                                value = {totalYears} 
                                onChange={(e) => setTotalYears(e.target.value)} 
                                onBlur = {(e) => {setTotalYears(handleIntegerChange(e.target.value)); setUpdate(prev => !prev);}}
                                type="text" 
                                inputMode="decimal"/>
                    </div>
                    <div className = {styles.totalYears}>
                        <label>
                            Include Long-Term Value?
                            <input type="checkbox" checked={longTerm} onChange={handleToggle} />
                        </label>
                    </div>
                </div>
                <div>
                    <div className = {styles.blockContainer}>
                        <div className={styles.tabsContainer}>
                            {['Basic', 'Advanced'].map((tab) => (
                            <div
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab)}>
                                {tab === 'Basic' ? 'Constant' : 'Varied'}
                            </div>
                            ))}
                        </div>
                        <div className = {styles.yearContainer}>
                                {renderYears()}
                        </div>
                    </div>
                </div>
            </div>
            <button className = {styles.npvButton} onClick = {() => {setShowPopup(true); setSave(true);}}><span>Add to Saved Scenarios</span></button>
        </div>)}

        {!vertical && (<div className = {styles.section}>
            <div className = {styles.naming}>
                <h2 className = {styles.scenarioTitle}>Name: {scenarioName}</h2>
                <button className = {styles.renameButton} onClick = {() => {setShowPopup(true); setRename(true);}}>Edit Name</button>
            </div>
            <div className = {styles.calcColumns}>
                <div className = {styles.calcCenter}>
                    <div className = {styles.totalYears}>
                        <label htmlFor="initialInvestment">Initial Investment: </label>
                        <input id="initialInvestment" 
                            value = {initialInvestment} 
                            onChange={(e) => setInitialInvestment(handleMoneyChange(e.target.value))}
                            onBlur = {() => {setUpdate(prev => !prev);}} 
                            type="text" inputMode="decimal"/>
                    </div>
                    <div className = {styles.totalYears}>
                        <label htmlFor="discountRate">Discount Rate: </label>
                        <input id="discountRate" 
                            value = {discountRate} 
                            onChange={(e) => setDiscountRate(handlePercentChange(e.target.value))} 
                            onBlur = {() => {setUpdate(prev => !prev);}}
                            type="text" inputMode="decimal"/>
                    </div>
                    <div className = {styles.totalYears}>
                            <label htmlFor="totalYears">Total Years: </label>
                            <input id="totalYears" 
                                value = {totalYears} 
                                onChange={(e) => setTotalYears(e.target.value)} 
                                onBlur = {(e) => {setTotalYears(handleIntegerChange(e.target.value)); setUpdate(prev => !prev);}}
                                type="text" 
                                inputMode="decimal"/>
                    </div>
                    <div className = {styles.totalYears}>
                        <label>
                            Include Long-Term Value?
                            <input type="checkbox" checked={longTerm} onChange={handleToggle} />
                        </label>
                    </div>
                </div>
                <div>
                    <div className = {styles.blockContainer}>
                        <div className={styles.tabsContainer}>
                            {['Basic', 'Advanced'].map((tab) => (
                            <div
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab)}>
                                {tab === 'Basic' ? 'Constant' : 'Varied'}
                            </div>
                            ))}
                        </div>
                        <div className = {styles.yearContainer}>
                                {renderYears()}
                        </div>
                    </div>
                </div>
            </div>
            <button className = {styles.npvButton} onClick = {() => {setShowPopup(true); setSave(true);}}><span>Add to Saved Scenarios</span></button>
        </div>)}

            {showPopup && save && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Edit Name and/or Save:</h2>
                        <input id="scenarioName" 
                                value = {scenarioName} 
                                onChange={(e) => setName(e.target.value)} 
                                type="text" />
                        <div className = {styles.popupButtonContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); setSave(false);}}>Close</button>
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); saveToStorage(scenarioName, Date.now(), initialInvestment, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab); setSave(false); setUpdate(prev => !prev);}}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showPopup && rename && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Enter a Name for the Scenario:</h2>
                        <input id="scenarioName" 
                                value = {scenarioName} 
                                onChange={(e) => setName(e.target.value)} 
                                type="text" />
                        <div className = {styles.popupSaveButtonContainer}>         
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); setRename(false); setUpdate(prev => !prev);}}>Rename</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Calculator;