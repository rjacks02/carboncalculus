import React, {useState, useRef, useEffect} from 'react';

import styles from '../../css/NPV.module.css'

const Calculator = ({bau, vertical, scenario, saveToStorage, updateScenario, units}) => {
    const [scenarioName, setName] = useState(scenario.name);
    const [initialInvestment, setInitialInvestment] = useState(scenario.initialInvestment);
    const [discountRate, setDiscountRate] = useState(scenario.discountRate);
    const [totalYears, setTotalYears] = useState(scenario.totalYears);
    const yearlyValuesRef = useRef(scenario.yearlyValuesRef.current);
    const [longTerm, setLongTerm] = useState(scenario.longTerm);
    const [activeTab, setActiveTab] = useState(scenario.activeTab);
    const [delay, setDelay] = useState(scenario.delay);

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
                    onChange={(e) => {let newVal = handleValueChange(e.target.value); setYearlyValue(newVal); yearlyValuesRef.current[index] = newVal;}}  
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
                    onChange={(e) => {let newVal = handleValueChange(e.target.value); setYearlyValue(newVal); const maxIndex = Number(totalYears);
                        for (let i = 0; i < maxIndex; i++) {
                          yearlyValuesRef.current[i] = newVal;
                        }}}  
                    onBlur = {() => {setUpdate(prev => !prev);}}
                    type="text" 
                    inputMode="decimal"/>
            </div>
        )
    }

    function handleValueChange(val){
        let negative = false;
        if (val[0] === '-'){
            negative = true;
        }
        let cleaned = val.replace(/[^0-9.]/g, '');

        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('').substring(0, 2);
        }

        if (!cleaned.startsWith('0.') && cleaned !== '0') {
            cleaned = cleaned.replace(/^0+/, '');
        }

        if (negative && cleaned.length > 0){
            cleaned = '-' + cleaned
        }

        if (cleaned.length === 0){
            cleaned = '0';
        }

        return cleaned;
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

        return cleaned;
    }

    function handleIntegerChange(val){
        let negative = parseInt(val);
        if(negative < 0){
            return '0';
        }

        let cleaned = val.replace(/[^0-9]/g, '');

        if (cleaned.startsWith('0') && cleaned !== '0') {
            cleaned = cleaned.replace(/^0+/, '');
        }

        if (cleaned.length === 0 || cleaned === '0'){
            cleaned = '1';
        }
        return cleaned;
    }

    function handleDelayChange(val){
        let negative = parseInt(val);
        if(negative < 0){
            return '0';
        }

        let cleaned = val.replace(/[^0-9]/g, '');

        if (cleaned.startsWith('0') && cleaned !== '0') {
            cleaned = cleaned.replace(/^0+/, '');
        }

        if (cleaned.length === 0 || cleaned === '0'){
            cleaned = '0';
        }
        return cleaned;
    }

    const handleToggle = () => {
        setLongTerm(prev => !prev);
        setUpdate(prev => !prev);
    };

    const getFullYearlyValues = () => {
        const baseValues = yearlyValuesRef.current.slice(0, parseInt(totalYears));

          const lastVal = baseValues[baseValues.length - 1];
          const extendedVals = Array(300 - baseValues.length-parseInt(delay)).fill(lastVal);
          return [...baseValues, ...extendedVals];
      };

    useEffect(() => {
        const maxIndex = Number(totalYears);
        
        yearlyValuesRef.current.splice(maxIndex);

        if (activeTab === 'Basic'){
            if (!yearlyValuesRef.current[0]) {
                yearlyValuesRef.current[0] = '100.00';
              }
            for (let i = 0; i < maxIndex; i++) {
                yearlyValuesRef.current[i] = yearlyValuesRef.current[0];
              }
        }
        else{
            for (let i = 0; i < maxIndex; i++) {
                if (!yearlyValuesRef.current[i]) {
                  yearlyValuesRef.current[i] = '100.00';
                }
              }
        }

    }, [totalYears, initialInvestment]);

    useEffect(() => {
        updateScenario(scenarioName, initialInvestment, discountRate, totalYears, { current: getFullYearlyValues() }, longTerm, activeTab, delay, getFullYearlyValues());
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
        const maxIndex = parseInt(totalYears);
 
        if (activeTab === 'Basic'){
            if (!yearlyValuesRef.current[0]) {
                yearlyValuesRef.current[0] = '100.00';
              }
            for (let i = 0; i < maxIndex; i++) {
                yearlyValuesRef.current[i] = yearlyValuesRef.current[0];
              }
        }
        else{
            for (let i = 0; i < maxIndex; i++) {
                if (!yearlyValuesRef.current[i]) {
                  yearlyValuesRef.current[i] = '100.00';
                }
              }
        }
      
        if (activeTab === 'Basic') {
          return (
            <div>
                <div className = {styles.inputCenter}>Annual CO<sub>2</sub> Emissions ({units}):</div>
                <BasicYear endYear = {totalYears} value={yearlyValuesRef.current[0]} />
            </div>
          );
        } else {
          return (
            <div>
                <div className = {styles.inputCenter}>Annual CO<sub>2</sub> Emissions ({units}):</div>
              {Array.from({ length: maxIndex }).map((_, index) => (
                <AdvancedYear key={index} index={index} value={yearlyValuesRef.current[index]} />
              ))}
            </div>
          );
        }
      };
      
    return (
        <div>
        {vertical && (<div className = {styles.section}>
            <div className = {styles.naming}>
                {bau && <h2 className = {styles.scenarioTitle}>Name: (BAU) {scenarioName}</h2>}
                {!bau && <h2 className = {styles.scenarioTitle}>Name: {scenarioName}</h2>}
                <button className = {styles.renameButton} onClick = {() => {setShowPopup(true); setRename(true);}}>Edit Name</button>
            </div>
            <div className = {styles.calcColumns}>
                <div className = {styles.calcCenter}>
                    <div className = {styles.totalYears}>
                        <label htmlFor="initialInvestment">Upfront Emissions ({units}): </label>
                        <input id="initialInvestment" 
                            value = {initialInvestment} 
                            onChange={(e) => setInitialInvestment(handleValueChange(e.target.value))}
                            onBlur = {() => {setUpdate(prev => !prev);}} 
                            type="text" inputMode="decimal"/>
                    </div>
                    <div className = {styles.totalYears}>
                        <label htmlFor="discountRate">Discount Rate (%): </label>
                        <input id="discountRate" 
                            value = {discountRate} 
                            onChange={(e) => setDiscountRate(e.target.value)} 
                            onBlur = {(e) => {setDiscountRate(handlePercentChange(e.target.value)); setUpdate(prev => !prev);}}
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
                            <label htmlFor="delay">Years Delayed: </label>
                            <input id="delay" 
                                value = {delay} 
                                onChange={(e) => setDelay(e.target.value)} 
                                onBlur = {(e) => {setDelay(handleDelayChange(e.target.value)); setUpdate(prev => !prev);}}
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
                {bau && <h2 className = {styles.scenarioTitle}>Name: (BAU) {scenarioName}</h2>}
                {!bau && <h2 className = {styles.scenarioTitle}>Name: {scenarioName}</h2>}
                <button className = {styles.renameButton} onClick = {() => {setShowPopup(true); setRename(true);}}>Edit Name</button>
            </div>
            <div className = {styles.calcColumns}>
                <div className = {styles.calcCenter}>
                    <div className = {styles.totalYears}>
                        <label htmlFor="initialInvestment">Upfront Emissions ({units}): </label>
                        <input id="initialInvestment" 
                            value = {initialInvestment} 
                            onChange={(e) => setInitialInvestment(e.target.value)}
                            onBlur = {(e) => {setInitialInvestment(handleValueChange(e.target.value)); setUpdate(prev => !prev);}} 
                            type="text" inputMode="decimal"/>
                    </div>
                    <div className = {styles.totalYears}>
                        <label htmlFor="discountRate">Discount Rate (%): </label>
                        <input id="discountRate" 
                            value = {discountRate} 
                            onChange={(e) => setDiscountRate(e.target.value)} 
                            onBlur = {(e) => {setDiscountRate(handlePercentChange(e.target.value)); setUpdate(prev => !prev);}}
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
                            <label htmlFor="delay">Years Delayed: </label>
                            <input id="delay" 
                                value = {delay} 
                                onChange={(e) => setDelay(e.target.value)} 
                                onBlur = {(e) => {setDelay(handleDelayChange(e.target.value)); setUpdate(prev => !prev);}}
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
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); saveToStorage(scenarioName, Date.now(), initialInvestment, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab, delay); setSave(false); setUpdate(prev => !prev);}}>Save</button>
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