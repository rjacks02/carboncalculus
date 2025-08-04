import React, {useState, useRef, useEffect} from 'react';

import styles from '../../css/NPV.module.css'

const Calculator = ({vertical, scenario, saveToStorage, updateScenario, units, newOpen}) => {
    const [scenarioName, setName] = useState(scenario.name);
    const [upfrontEmissions, setupfrontEmissions] = useState(scenario.upfrontEmissions);
    const [discountRate, setDiscountRate] = useState(scenario.discountRate);
    const [totalYears, setTotalYears] = useState(scenario.totalYears);
    const yearlyValuesRef = useRef(scenario.yearlyValuesRef.current);
    const [longTerm, setLongTerm] = useState(scenario.longTerm);
    const [activeTab, setActiveTab] = useState(scenario.activeTab);
    const [delay, setDelay] = useState(scenario.delay);
    const [createdAt, setCreatedAt] = useState(scenario.createdAt);
    

    const basicValuesRef = useRef([...scenario.yearlyValuesRef.current]);
    const advancedValuesRef = useRef([...scenario.yearlyValuesRef.current]);

    const inputRefs = useRef([]);
    let refIndex = 0;
    const [focusIndex, setFocusIndex] = useState(0);
    const [updateFocus, setUpdateFocus] = useState(0);
  

    const [update, setUpdate] = useState(true);

    const [showPopup, setShowPopup] = useState(scenario.name === "" ? true : false);
    const [rename, setRename] = useState(scenario.name === "" ? true : false);
    const [save, setSave] = useState(false);
    const [saveAs, setSaveAs] = useState(false);

    const [showInfo, setShowInfo] = useState(false);
    const [infoKey, setInfoKey] = useState();

    let info = {'Upfront Emissions': 'Upfront emissions are the amount of carbon released at the beginning of a project or intervention. They occur immediately in year 0 and thus carry full weight in Carbon Calculus, significantly influencing a scenario’s climate impact.',
                'Discount Rate': 'Carbon’s “discount” rate represents the effective annual dissipation rate of CO2 in the atmosphere through the flux of the global carbon cycle. We recommend using a discount rate somewhere in the range of 2% to 5%; 3.355% is the default, as it is aligned with prior literature and the 100-year global warming potential of CO2.',
                'Total Years': 'This refers to the full length of time modeled by the scenario. The first year is labeled as year 0, and the final year is represented by this value.',
                'Years Delayed': 'This is the number of years before a scenario begins generating or reducing emissions. Both upfront and annual emissions are affected by this delay. As the delay increases, the climate impact of those emissions or reductions decreases due to the discount rate.',
                'Long-Term Value': 'Enabling this function accounts for the limit of your scenario, taking your final year’s emission rate and assuming that rate continues for many years to come. This is encouraged as a default setting, as most real-world emissions will not stop at the end of your chosen time horizon, but that ultimately depends on your scenario.',
                'NPV<sub>CO<sub>2</sub></sub>': 'This is the cumulative net discounted CO2 emitted into the atmosphere per your scenario, valued from the perspective of emissions today. For example, at a 3.355% annual discount rate, 1 ton of CO2 emitted annually, indefinitely, has a net present value (NPV_CO_2) of 30.8 tons of CO2 emitted only once, today. The term “value” here is a proxy for “impact,” as quantity emitted, when those emissions occur, and the rate at which those emissions dissipate all contribute to the impact that CO2 in the atmosphere has on global radiative forcing (the greenhouse effect, global average temperature increase).',
                'BAU (Business As Usual)': 'This is a scenario that represents the current projected annual emissions rate if today’s actions are continued. This is likely a continuation of today’s emissions rate indefinitely, depending on one’s assumptions for what their “business as usual” is. This should not reflect targets or commitments for emissions reductions, which can be modeled as its own scenario.',
                'D<sub>Eff</sub> (Effective Decarbonization)': 'This represents the relative difference between a scenario’s emissions (emissions resulting from taking some sort of action) and BAU emissions (a continuation of today’s emissions, the “do nothing” case). This metric helps to answer the question, “how effective is this scenario compared to what is currently happening?”. While NPV_CO_2 is an absolute metric, this is a metric relative to BAU.'
            };

    const AdvancedYear = ({index, value}) => {
        const [yearlyValue, setYearlyValue] = useState(value);

        return(
            <div className = {styles.inputCenter}>
                <label htmlFor={`year-${index}`}>Year {index+1}: </label>
                <input id={`year-${index}`}
                    ref={el => {
                        if (el) inputRefs.current[refIndex] = el;
                        refIndex++;
                      }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Tab') {
                            let newVal = handleValueChange(e.target.value);
                            setYearlyValue(newVal);
                            advancedValuesRef.current[index-delay] = newVal;
                            const currentIndex = inputRefs.current.indexOf(e.target);
                            setUpdate(prev => !prev);
                            setTimeout(() => {
                                setFocusIndex(currentIndex + 1);
                                setUpdateFocus(updateFocus+1);
                              }, "100");
                        }
                    }}
                    value = {yearlyValue} 
                    onChange={(e) => {setYearlyValue(e.target.value);}}  
                    onBlur = {(e) => {let newVal = handleValueChange(e.target.value); setYearlyValue(newVal); if (advancedValuesRef.current[index-delay] !== newVal) {
                        setUpdate(prev => !prev);
                      }advancedValuesRef.current[index-delay] = newVal;}}
                    type="text" 
                    inputMode="decimal"/>
            </div>
        )
    }

    const BasicYear = ({startYear, endYear, value}) => {
        const [yearlyValue, setYearlyValue] = useState(value);

        if (isNaN(endYear) || isNaN(startYear) || endYear === 0 || startYear === 0) return null;

        return(
            <div className = {styles.inputCenter}>
                <label htmlFor="year">{endYear === 1 ? 'Year 1: ' : 'Years ' + startYear + ' - ' + endYear + ': '}</label>
                <input id="year" 
                    ref={el => {
                        if (el) inputRefs.current[refIndex] = el;
                        refIndex++;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Tab') {
                            let newVal = handleValueChange(e.target.value); setYearlyValue(newVal); const maxIndex = Number(totalYears);
                        for (let i = 0; i < maxIndex; i++) {
                          basicValuesRef.current[i] = newVal;
                        }; 
                            const currentIndex = inputRefs.current.indexOf(e.target);
                            setUpdate(prev => !prev);
                            setTimeout(() => {
                                setFocusIndex(currentIndex + 1);
                                setUpdateFocus(updateFocus+1);
                              }, "100");
                        }
                    }}
                    
                    value = {yearlyValue} 
                    onChange={(e) => {setYearlyValue(e.target.value);}}  
                    onBlur = {(e) => {let newVal = handleValueChange(e.target.value); setYearlyValue(newVal); const maxIndex = Number(totalYears);
                        for (let i = 0; i < maxIndex; i++) {
                          basicValuesRef.current[i] = newVal;
                        }; setUpdate(prev => !prev);}}
                    type="text" 
                    inputMode="decimal"/>
            </div>
        )
    }

useEffect(() => {
    if (focusIndex !== null && document.activeElement !== inputRefs.current[focusIndex]) {
        const next = inputRefs.current[focusIndex];
        if (next && document.contains(next)) {
            next.focus();
            next.select();
        }
        else{
          inputRefs.current[0].focus();
        }
      }
  }, [focusIndex, updateFocus]);
  

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

        if (parseInt(cleaned)+parseInt(delay) > 300){
            cleaned = String(300-parseInt(delay));
        }

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

        if (parseInt(cleaned)+parseInt(totalYears) > 300){
            cleaned = String(300-parseInt(totalYears));
        }

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
        if (activeTab === 'Basic'){
            yearlyValuesRef.current = [...basicValuesRef.current]
        }
        else{
            yearlyValuesRef.current = [...advancedValuesRef.current]
        }
        const baseValues = yearlyValuesRef.current.slice(0, Math.min(300, parseInt(totalYears)));

          const lastVal = baseValues[baseValues.length - 1];
          const extendedVals = Array(300 - baseValues.length-parseInt(delay)).fill(lastVal);
          return [...baseValues, ...extendedVals];
      };

    useEffect(() => {
        updateScenario(scenarioName, upfrontEmissions, discountRate, totalYears, { current: getFullYearlyValues() }, longTerm, activeTab, delay, getFullYearlyValues());
    }, [update, activeTab]);


    const renderYears = () => {
        const maxIndex = Math.min(300, parseInt(totalYears));

        if (activeTab === 'Basic'){
            if (!basicValuesRef.current[0]) {
                basicValuesRef.current[0] = '100.00';
              }
            for (let i = 0; i < maxIndex; i++) {
                basicValuesRef.current[i] = basicValuesRef.current[0];
              }
        }
        else{
            for (let i = 0; i < maxIndex; i++) {
                if (!advancedValuesRef.current[i]) {
                    advancedValuesRef.current[i] = '100.00';
                }
              }
        }
      
        if (activeTab === 'Basic') {
          return (
            <div>
                <div className = {styles.inputCenter}>Annual CO<sub>2</sub> Emissions <br/>({units}/Year):</div>
                <BasicYear startYear = {Math.min(1+parseInt(delay), 300)} endYear = {Math.min(maxIndex+parseInt(delay), 300)} value={basicValuesRef.current[0]} />
            </div>
          );
        } else {
          return (
            <div>
                <div className = {styles.inputCenter}>Annual CO<sub>2</sub> Emissions <br/>({units}/Year):</div>
              {Array.from({ length: maxIndex }).map((_, index) => (
                <AdvancedYear key={index} index={index+parseInt(delay)} value={advancedValuesRef.current[index]} />
              ))}
            </div>
          );
        }
      };
      
    return (
        <div>
        {vertical && (<div className = {styles.section}>
            <div className = {styles.naming}>
                <h2 className = {styles.scenarioTitle} onClick= {(e) => {if (e.detail === 2) {setShowPopup(true); setRename(true);}}}>Name: {scenarioName}</h2>
                <button className = {styles.renameButton} onClick = {() => {setShowPopup(true); setRename(true);}}>Edit Name</button>
            </div>
            <div className = {styles.calcColumns}>
                <div className = {styles.calcCenter}>
                    <div className = {styles.totalYears}>
                        <label htmlFor="upfrontEmissions">Upfront CO<sub>2</sub> Emissions ({units}): </label>
                        <input id="upfrontEmissions" 
                        ref={el => {
                            if (el) inputRefs.current[refIndex] = el;
                            refIndex++;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Tab') {
                                e.preventDefault();
                                const currentIndex = inputRefs.current.indexOf(e.target);
                                setFocusIndex(currentIndex + 1);
                            }
                        }}
                            value = {upfrontEmissions} 
                            onChange={(e) => setupfrontEmissions(e.target.value)}
                            onBlur = {(e) => {setupfrontEmissions(handleValueChange(e.target.value)); setUpdate(prev => !prev);}} 
                            type="text" inputMode="decimal"/><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Upfront Emissions'); setShowInfo(true);}}>info_outline</i></div>
                    </div>
                    <div className = {styles.totalYears}>
                        <label htmlFor="discountRate">Discount Rate (%): </label>
                        <input id="discountRate" 
                        ref={el => {
                            if (el) inputRefs.current[refIndex] = el;
                            refIndex++;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Tab') {
                                e.preventDefault();
                                const currentIndex = inputRefs.current.indexOf(e.target);
                                setFocusIndex(currentIndex + 1);
                            }
                        }}
                            value = {discountRate} 
                            onChange={(e) => setDiscountRate(e.target.value)} 
                            onBlur = {(e) => {setDiscountRate(handlePercentChange(e.target.value)); setUpdate(prev => !prev);}}
                            type="text" inputMode="decimal"/><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Discount Rate'); setShowInfo(true);}}>info_outline</i></div>
                    </div>
                    <div className = {styles.totalYears}>
                            <label htmlFor="totalYears">Total Years: </label>
                            <input id="totalYears" 
                            ref={el => {
                                if (el) inputRefs.current[refIndex] = el;
                                refIndex++;
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                    e.preventDefault();
                                    const currentIndex = inputRefs.current.indexOf(e.target);
                                    setFocusIndex(currentIndex + 1);
                                }
                            }}
                                value = {totalYears} 
                                onChange={(e) => setTotalYears(e.target.value)} 
                                onBlur = {(e) => {setTotalYears(handleIntegerChange(e.target.value)); setUpdate(prev => !prev);}}
                                type="text" 
                                inputMode="decimal"/><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Total Years'); setShowInfo(true);}}>info_outline</i></div>
                    </div>
                    <div className = {styles.totalYears}>
                            <label htmlFor="delay">Years Delayed: </label>
                            <input id="delay" 
                            ref={el => {
                                if (el) inputRefs.current[refIndex] = el;
                                refIndex++;
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                    e.preventDefault();
                                    const currentIndex = inputRefs.current.indexOf(e.target);
                                    setFocusIndex(currentIndex + 1);
                                }
                            }}
                                value = {delay} 
                                onChange={(e) => setDelay(e.target.value)} 
                                onBlur = {(e) => {setDelay(handleDelayChange(e.target.value)); setUpdate(prev => !prev);}}
                                type="text" 
                                inputMode="decimal"/><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Years Delayed'); setShowInfo(true);}}>info_outline</i></div>
                    </div>
                    <div className = {styles.totalYears}>
                        <label>
                            Long-Term Value:
                            <input ref={el => {
                            if (el) inputRefs.current[refIndex] = el;
                            refIndex++;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Tab') {
                                e.preventDefault();
                                const currentIndex = inputRefs.current.indexOf(e.target);
                                setFocusIndex(currentIndex + 1);
                            }
                        }}
                    type="checkbox" id = "longterm" checked={longTerm} onChange={handleToggle} />
                        </label><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Long-Term Value'); setShowInfo(true);}}>info_outline</i></div>
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
            <div className = {styles.cols}>
            {localStorage.getItem("scenario-" + createdAt) && (<button className = {styles.npvButton} onClick = {() => {setShowPopup(true); setSave(true);}}><span>Save</span></button>)}
            <button className = {styles.npvButton} onClick = {() => {setShowPopup(true); setSaveAs(true);}}><span>Save As...</span></button>
            </div>
        </div>)}

        {!vertical && (<div className = {styles.section}>
            <div className = {styles.naming} >
                <h2 className = {styles.scenarioTitle} onClick= {(e) => {if (e.detail === 2) {setShowPopup(true); setRename(true);}}}>Name: {scenarioName}</h2>
                <button className = {styles.renameButton} onClick = {() => {setShowPopup(true); setRename(true);}}>Edit Name</button>
            </div>
            <div className = {styles.calcColumns}>
                <div className = {styles.calcCenter}>
                    <div className = {styles.totalYears}>
                        <label htmlFor="upfrontEmissions">Upfront CO<sub>2</sub> Emissions ({units}): </label>
                        <input  id="upfrontEmissions" 
                        ref={el => {
                            if (el) inputRefs.current[refIndex] = el;
                            refIndex++;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Tab') {
                                e.preventDefault();
                                const currentIndex = inputRefs.current.indexOf(e.target);
                                setFocusIndex(currentIndex + 1);
                            }
                        }}
                            value = {upfrontEmissions} 
                            onChange={(e) => setupfrontEmissions(e.target.value)}
                            onBlur = {(e) => {setupfrontEmissions(handleValueChange(e.target.value)); setUpdate(prev => !prev);}} 
                            type="text" inputMode="decimal"/><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Upfront Emissions'); setShowInfo(true);}}>info_outline</i>
                            </div>
                    </div>
                    <div className = {styles.totalYears}>
                        <label htmlFor="discountRate">Discount Rate (%): </label>
                        <input  id="discountRate" 
                        ref={el => {
                            if (el) inputRefs.current[refIndex] = el;
                            refIndex++;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Tab') {
                                e.preventDefault();
                                const currentIndex = inputRefs.current.indexOf(e.target);
                                setFocusIndex(currentIndex + 1);
                            }
                        }}
                            value = {discountRate} 
                            onChange={(e) => setDiscountRate(e.target.value)} 
                            onBlur = {(e) => {setDiscountRate(handlePercentChange(e.target.value)); setUpdate(prev => !prev);}}
                            type="text" inputMode="decimal"/><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Discount Rate'); setShowInfo(true);}}>info_outline</i></div>
                    </div>
                    <div className = {styles.totalYears}>
                            <label htmlFor="totalYears">Total Years: </label>
                            <input  id="totalYears" 
                            ref={el => {
                                if (el) inputRefs.current[refIndex] = el;
                                refIndex++;
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                    e.preventDefault();
                                    const currentIndex = inputRefs.current.indexOf(e.target);
                                    setFocusIndex(currentIndex + 1);
                                }
                            }}
                                value = {totalYears} 
                                onChange={(e) => setTotalYears(e.target.value)} 
                                onBlur = {(e) => {setTotalYears(handleIntegerChange(e.target.value)); setUpdate(prev => !prev);}}
                                type="text" 
                                inputMode="decimal"/><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Total Years'); setShowInfo(true);}}>info_outline</i></div>
                    </div>
                    <div className = {styles.totalYears}>
                            <label htmlFor="delay">Years Delayed: </label>
                            <input  id="delay" 
                            ref={el => {
                                if (el) inputRefs.current[refIndex] = el;
                                refIndex++;
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                    e.preventDefault();
                                    const currentIndex = inputRefs.current.indexOf(e.target);
                                    setFocusIndex(currentIndex + 1);
                                }
                            }}
                                value = {delay} 
                                onChange={(e) => setDelay(e.target.value)} 
                                onBlur = {(e) => {setDelay(handleDelayChange(e.target.value)); setUpdate(prev => !prev);}}
                                type="text" 
                                inputMode="decimal"/><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Years Delayed'); setShowInfo(true);}}>info_outline</i></div>
                    </div>
                    <div className = {styles.totalYears}>
                        <label>
                            Long-Term Value:
                            <input ref={el => {
                            if (el) inputRefs.current[refIndex] = el;
                            refIndex++;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Tab') {
                                e.preventDefault();
                                const currentIndex = inputRefs.current.indexOf(e.target);
                                setFocusIndex(currentIndex + 1);
                            }
                        }}
                        type="checkbox" id = "longterm" checked={longTerm} onChange={handleToggle} />
                        </label><div className = {styles.info}><i class="material-icons" onClick = {() => {setInfoKey('Long-Term Value'); setShowInfo(true);}}>info_outline</i></div>
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
            <div className = {styles.cols}>
            {localStorage.getItem("scenario-" + createdAt) && (<button className = {styles.npvButton} onClick = {() => {setShowPopup(true); setSave(true);}}><span>Save</span></button>)}
            <button className = {styles.npvButton} onClick = {() => {setShowPopup(true); setSaveAs(true);}}><span>Save As...</span></button>
            </div>
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
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); saveToStorage(scenarioName, createdAt, upfrontEmissions, discountRate, totalYears, { current: getFullYearlyValues() }, longTerm, activeTab, delay); setSave(false); setUpdate(prev => !prev);}}>Save</button>
                        </div>
                    </div>
                </div>
            )}

        {showPopup && saveAs && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Edit Name and/or Save As:</h2>
                        <input id="scenarioName" 
                                value = {scenarioName} 
                                onChange={(e) => setName(e.target.value)} 
                                type="text" />
                        <div className = {styles.popupButtonContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); setSaveAs(false);}}>Close</button>
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); setCreatedAt(Date.now()); saveToStorage(scenarioName, Date.now(), upfrontEmissions, discountRate, totalYears, { current: getFullYearlyValues() }, longTerm, activeTab, delay); setSaveAs(false); setUpdate(prev => !prev);}}>Save As</button>
                        </div>
                    </div>
                </div>
            )}
            

            {showPopup && rename && (localStorage.getItem("startingPopup") === "false" || !newOpen) && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Enter a Name for the Scenario:</h2>
                        <input id="scenarioName" 
                                value = {scenarioName} 
                                onChange={(e) => setName(e.target.value)} 
                                type="text" />
                        <div className = {styles.popupSaveButtonContainer}>         
                            <button className = {styles.popupButton} onClick={() => {if (scenarioName !== "") {setShowPopup(false); setRename(false); setUpdate(prev => !prev);}}}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {showInfo && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>{infoKey}:</h2>
                        <p>{info[infoKey]}</p>
                        <div className = {styles.popup2Container}> 
                            <button className = {styles.popupButton} onClick={() => {setShowInfo(false);}}>Close</button>
                            <button className = {styles.popupButton} onClick={() => {setShowInfo(false); }}>Read More</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Calculator;