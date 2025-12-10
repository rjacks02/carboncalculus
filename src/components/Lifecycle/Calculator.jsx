import React, {useState, useRef, useEffect} from 'react'; //react imports

import { useNavigate } from "react-router-dom"; //navigation imports

import styles from '../../css/NPV.module.css' //styling imports

import info from './info.json' //more info about terms

const Calculator = ({scenario, updateScenario, caseStudy}) => {
  let navigate = useNavigate(); //navigation

  //info about the current scenario
  const [scenarioName, setName] = useState(scenario?.name); //scenario's name
  const [upfrontCarbon, setUpfrontCarbon] = useState(scenario?.upfrontCarbon); //scenario's net upfront carbon emissions
  const [systemLifespan, setSystemLifespan] = useState(scenario?.systemLifespan); //scenario's total system lifespan
  const [year0, setYear0] = useState(scenario?.year0); //scenario's year 0
  const [constructYr, setConstructYr] = useState(scenario?.constructYr); //scenario's first construction year
  const [operationalYr, setOperationalYr] = useState(scenario?.operationalYr); //scenario's first operational year
  const [operationCarbon, setOperationCarbon] = useState(scenario?.operationCarbon); //scenario's net carbon during operation
  const [endCarbon, setEndCarbon] = useState(scenario?.endCarbon); //scenario's net carbon at end of life
  const [createdAt, setCreatedAt] = useState(scenario?.createdAt); //scenario's time of creation

  //used for hitting enter/tab to travel between inputs
  const inputRefs = useRef([]); //refs for all input sections
  let refIndex = 0; //start index for addings refs to inputRefs
  const [focusIndex, setFocusIndex] = useState(0); //currently focused on input 
  const [updateFocus, setUpdateFocus] = useState(0); //trigger to update focus


  const [update, setUpdate] = useState(0); //trigger an update to the saved scenario

  const [rename, setRename] = useState(scenario.name === "" ? true : false); //popup for renaming, if new scenario does not have name - automatically shows
  
  const [showInfo, setShowInfo] = useState(false); //show info popup
  const [infoKey, setInfoKey] = useState(); //which info to show

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
      updateScenario(scenarioName, createdAt, upfrontCarbon, systemLifespan, year0, constructYr, operationalYr,  operationCarbon, endCarbon);
  }, [update]);

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

  //cleans any non-negative integer values
  function cleanYear(val){
    let negative = parseInt(val);
    if(negative < 0){
      return '0';
    }
    val = String(val);

    let cleaned = val.replace(/[^0-9]/g, '');

    if (cleaned.startsWith('0') && cleaned !== '0') {
      cleaned = cleaned.replace(/^0+/, '');
    }

    if (cleaned.length === 0){
      cleaned = '0';
    }

    return parseInt(cleaned);
  }

  function handleOperationYrChange(val){
    let year = cleanYear(val);

    let newEnd = year + systemLifespan

    if (newEnd - constructYr > 300){
      year = constructYr + 300 - systemLifespan
    } 

    return year;
  }

  //handles change in lifespan, where totalTime <= 300
  function handleLifespanChange(val){
    let year = cleanYear(val);

    let newEnd = operationalYr + year;

    if (newEnd - constructYr > 300){
      year = operationalYr + 300 - constructYr;
    } 

    return year;
  }

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
              <label className = {styles.calcText} htmlFor="year0">Year 0 For Analysis: </label>
              <input id="year0" 
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
              value = {year0} 
              onChange={(e) => setYear0(e.target.value)} 
              onBlur = {(e) => {setYear0(cleanYear(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Year 0'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
              <label className = {styles.calcText} htmlFor="systemLifespan">System Lifespan: </label>
              <input id="systemLifespan" 
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
              value = {systemLifespan} 
              onChange={(e) => setSystemLifespan(e.target.value)} 
              onBlur = {(e) => {setSystemLifespan(handleLifespanChange(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('System Lifespan'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
              <label className = {styles.calcText} htmlFor="constructYr">Upfront Activities Begin: </label>
              <input id="constructYr" 
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
              value = {constructYr} 
              onChange={(e) => setConstructYr(e.target.value)} 
              onBlur = {(e) => {setConstructYr(cleanYear(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Construction Begins'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
              <label className = {styles.calcText} htmlFor="operationalYr">System Operation Begins: </label>
              <input id="operationalYr" 
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
              value = {operationalYr} 
              onChange={(e) => setOperationalYr(e.target.value)} 
              onBlur = {(e) => {setOperationalYr(handleOperationYrChange(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Operation Begins'); setShowInfo(true);}}>info_outline</i></div>
            </div>
          </div>
          <div className = {styles.calcCenter}>
            <div className = {styles.calcComponent}>
              <label className = {styles.calcText}  htmlFor="upfrontCarbon">Total Upfront Emissions: </label>
              <input id="upfrontCarbon" 
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
              value = {upfrontCarbon} 
              onChange={(e) => setUpfrontCarbon(e.target.value)} 
              onBlur = {(e) => {setUpfrontCarbon(handleValueChange(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Annual Upfront Emissions'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
              <label className = {styles.calcText}  htmlFor="operationCarbon">Total Operational Emissions: </label>
              <input id="operationCarbon" 
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
              value = {operationCarbon} 
              onChange={(e) => setOperationCarbon(e.target.value)} 
              onBlur = {(e) => {setOperationCarbon(handleValueChange(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('Annual Operational Emissions'); setShowInfo(true);}}>info_outline</i></div>
            </div>
            <div className = {styles.calcComponent}>
              <label className = {styles.calcText} htmlFor="endCarbon">Total End of Life Emissions: </label>
              <input id="endCarbon" 
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
              value = {endCarbon} 
              onChange={(e) => setEndCarbon(e.target.value)} 
              onBlur = {(e) => {setEndCarbon(handleValueChange(e.target.value)); setUpdate(prev => prev+1);}}
              type="text" 
              inputMode="decimal"/><div className = {styles.info}><i className="material-icons" onClick = {() => {setInfoKey('End of Life Emissions'); setShowInfo(true);}}>info_outline</i></div>
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