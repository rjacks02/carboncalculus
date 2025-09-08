import React, {useState, useRef, useEffect} from 'react'; //react imports

import { useNavigate } from "react-router-dom"; //navigation imports

import styles from '../../css/NPV.module.css' //styling imports

import info from './info.json' //more info about terms

const Calculator = ({scenario, updateScenario, units, caseStudy}) => {
  let navigate = useNavigate(); //navigation

  //info about the current scenario
  const [scenarioName, setName] = useState(scenario?.name); //scenario's name
  const [upfrontEmissions, setupfrontEmissions] = useState(scenario?.upfrontEmissions); //scenario's upfront emissions
  const [discountRate, setDiscountRate] = useState(scenario?.discountRate); //scenario's discount rate
  const [totalYears, setTotalYears] = useState(scenario?.totalYears); //scenario's total years
  const yearlyValuesRef = useRef(scenario?.yearlyValuesRef?.current); //scenario's yearly values
  const [longTerm, setLongTerm] = useState(scenario?.longTerm); //scenario's long term (true/false)
  const [activeTab, setActiveTab] = useState(scenario?.activeTab); //scenario's active tab
  const [delay, setDelay] = useState(scenario?.delay); //scenario's delay
  const [createdAt, setCreatedAt] = useState(scenario?.createdAt); //scenario's time of creation
  
  const basicValuesRef = useRef([...scenario?.yearlyValuesRef.current]); //ref for values in basic tab
  const advancedValuesRef = useRef([...scenario?.yearlyValuesRef.current]); //ref for values in advanced tab


  //used for hitting enter/tab to travel between inputs
  const inputRefs = useRef([]); //refs for all input sections
  let refIndex = 0; //start index for addings refs to inputRefs
  const [focusIndex, setFocusIndex] = useState(0); //currently focused on input 
  const [updateFocus, setUpdateFocus] = useState(0); //trigger to update focus


  const [update, setUpdate] = useState(0); //trigger an update to the saved scenario

  const [rename, setRename] = useState(scenario.name === "" ? true : false); //popup for renaming, if new scenario does not have name - automatically shows
  
  const [showInfo, setShowInfo] = useState(false); //show info popup
  const [infoKey, setInfoKey] = useState(); //which info to show

  //yearly values in advanced mode
  const AdvancedYear = ({index, value}) => {
    const [yearlyValue, setYearlyValue] = useState(value); //value of year at index

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
                setUpdate(prev => prev+1);
                setTimeout(() => {
                  setFocusIndex(currentIndex + 1);
                  setUpdateFocus(updateFocus+1);
                }, "100");
              }
            }
          }
          value = {yearlyValue} 
          onChange={(e) => {setYearlyValue(e.target.value);}}  
          onBlur = {(e) => {let newVal = handleValueChange(e.target.value); setYearlyValue(newVal); if (advancedValuesRef.current[index-delay] !== newVal) {
              setUpdate(prev => prev+1);
            }
          advancedValuesRef.current[index-delay] = newVal;}}
          type="text" 
          inputMode="decimal"
        />
      </div>
    )
  }

  //yearly values in basic mode
  const BasicYear = ({startYear, endYear, value}) => {
    const [yearlyValue, setYearlyValue] = useState(value); //same yearly value for all years

    if (isNaN(endYear) || isNaN(startYear) || endYear === 0 || startYear === 0) return null; //only render valid inputs

    return(
      <div className = {styles.inputCenter}>
        <label htmlFor="year">{endYear === 1 || startYear === endYear ? 'Year ' + startYear + ': ' : 'Years ' + startYear + ' - ' + endYear + ': '}</label>
        <input id="year" 
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
                setUpdate(prev => prev+1);
                setTimeout(() => {
                  setFocusIndex(currentIndex + 1);
                  setUpdateFocus(updateFocus+1);
                }, "100");
              }
            }
          }
          value = {yearlyValue} 
          onChange={(e) => {setYearlyValue(e.target.value);}}  
          onBlur = {(e) => {let newVal = handleValueChange(e.target.value); setYearlyValue(newVal); const maxIndex = Number(totalYears);
          for (let i = 0; i < maxIndex; i++) {
            basicValuesRef.current[i] = newVal;
          }; setUpdate(prev => prev+1);}}
          type="text" 
          inputMode="decimal"
        />
      </div>
    )
  }


  //update focus based on refs
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

  //updates scenario when needed
  useEffect(() => {
      updateScenario(scenarioName, createdAt, upfrontEmissions, discountRate, totalYears, { current: getFullYearlyValues() }, longTerm, activeTab, delay, getFullYearlyValues());
  }, [update, activeTab]);


  //handles change in values, positive or negative
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

  //handles change in percentage values
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

  //handles change in years, where years + delay < 100
  function handleYearChange(val){
    let negative = parseInt(val);
    if(negative < 0){
      return '0';
    }

    let cleaned = val.replace(/[^0-9]/g, '');

    if (parseInt(cleaned)+parseInt(delay) > 100){
      cleaned = String(100-parseInt(delay));
    }

    if (cleaned.startsWith('0') && cleaned !== '0') {
      cleaned = cleaned.replace(/^0+/, '');
    }

    if (cleaned.length === 0 || cleaned === '0'){
      cleaned = '1';
    }
    return cleaned;
  }

  //handles change in delay, where years + delay < 100
  function handleDelayChange(val){
    let negative = parseInt(val);
    if(negative < 0){
      return '0';
    }

    let cleaned = val.replace(/[^0-9]/g, '');

    if (parseInt(cleaned)+parseInt(totalYears) > 100){
      cleaned = String(100-parseInt(totalYears));
    }

    if (cleaned.startsWith('0') && cleaned !== '0') {
      cleaned = cleaned.replace(/^0+/, '');
    }

    if (cleaned.length === 0 || cleaned === '0'){
      cleaned = '0';
    }
    return cleaned;
  }

  //handles toggling longterm
  const handleToggle = () => {
    setLongTerm(prev => !prev);
    setUpdate(prev => prev+1);
  };


  //gets up to 100 years of data
  const getFullYearlyValues = () => {
    if (activeTab === 'Basic'){
      yearlyValuesRef.current = [...basicValuesRef.current]
    }
    else{
      yearlyValuesRef.current = [...advancedValuesRef.current]
    }

    const baseValues = yearlyValuesRef.current.slice(0, Math.min(100, parseInt(totalYears)));

    const lastVal = baseValues[baseValues.length - 1];
    const extendedVals = Array(100 - baseValues.length-parseInt(delay)).fill(lastVal);
    return [...baseValues, ...extendedVals];
  };

  //renders years based on basic or advanced mode
  const renderYears = () => {
    const maxIndex = Math.min(100, parseInt(totalYears));

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
          <BasicYear startYear = {Math.min(1+parseInt(delay), 100)} endYear = {Math.min(maxIndex+parseInt(delay), 100)} value={basicValuesRef.current[0]} />
        </div>
      );
    } 
    else {
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
      <div className = {styles.section}>
        <h2 className = {styles.caseName}>Case Study: {caseStudy}</h2>
        <div className = {styles.naming}>
          <h2 className = {styles.scenarioTitle} onClick= {(e) => {if (e.detail === 2) {setRename(true);}}}>Name: {scenarioName}</h2>
          <button className = {styles.renameButton} onClick = {() => {setRename(true);}}>Edit Name</button>
        </div>
        <div className = {styles.calcColumns}>
          <div className = {styles.calcCenter}>
            <div className = {styles.calcComponent}>
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
              onBlur = {(e) => {setupfrontEmissions(handleValueChange(e.target.value)); setUpdate(prev => prev+1);}} 
              type="text" inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Upfront Emissions'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
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
              onBlur = {(e) => {setDiscountRate(handlePercentChange(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Discount Rate'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
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
              onBlur = {(e) => {setTotalYears(handleYearChange(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Total Years'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
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
              onBlur = {(e) => {setDelay(handleDelayChange(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Years Delayed'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
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
              </label>
              <div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Long-Term Value'); setShowInfo(true);}}>info_outline</i></div>
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
      </div>  
        

      {rename && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <h2>Enter a Name for the Scenario:</h2>
            <input id="scenarioName" 
              value = {scenarioName} 
              onChange={(e) => setName(e.target.value)} 
              type="text" />
            <div className = {styles.popupSaveButtonContainer}>         
              <button className = {styles.popupButton} onClick={() => {if (scenarioName !== "") {setRename(false); setUpdate(prev => prev+1);}}}>Confirm</button>
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
              <button className = {styles.popupButton} onClick={() => {setShowInfo(false); navigate('/FAQs');}}>Read More</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Calculator;