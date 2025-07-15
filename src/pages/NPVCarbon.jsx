import React, {useState, useRef, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from '../css/NPV.module.css'

import Calculator from '../components/Carbon/Calculator'
import Visuals from '../components/Carbon/Visuals'
import Header from '../components/Header'
import Saved from '../components/Saved'
import SharedVisuals from '../components/Carbon/SharedVisuals'
import Decarbonization from "../components/Carbon/Decarbonization";


const NPV = () => {
    const baseScenarioKG = {bau: true, createdAt: 0, name: 'Scenario', initialInvestment: '300.00', discountRate: '3.355', totalYears: '5', yearlyValuesRef: {current: ['100.00', '100.00', '100.00', '100.00', '100.00']}, longTerm: true, activeTab: 'Basic', delay: '0', units: 'Kilograms'};
    const baseScenarioMT = {bau: true, createdAt: 0, name: 'Scenario', initialInvestment: '0.3', discountRate: '3.355', totalYears: '5', yearlyValuesRef: {current: ['0.1', '0.1', '0.1', '0.1', '0.1']}, longTerm: true, activeTab: 'Basic', delay: '0', units: 'Metric Tons'};

    const [npv, setNPV] = useState(0);
    const npvValuesRef = useRef({});
    const npvTotalRef = useRef({});

    const [num, setNum] = useState(1);
    const [units, setUnits] = useState('Kilograms')

    const [page, setPage] = useState('npv');
    const [showPopup, setShowPopup] = useState(false);
    const [vertical, setVertical] = useState(false);
    const [selected, setSelected] = useState([]);
    const [compare, setCompare] = useState([]);
    const [remove, setRemove] = useState(false);
    const [saveAs, setSaveAs] = useState(false);
    const [newName, setNewName] = useState('');
    const [emissions, setEmissions] = useState(true);

    const [index, setIndex] = useState(0);
    const [toRemove, setToRemove] = useState(0);
    const [currentScenarios, setCurrentScenarios] = useState([baseScenarioKG]);
    const [update, setUpdate] = useState(0);

    function convertToKilograms(){
      for (let i = 0; i < currentScenarios.length; i++){
        let scenario = currentScenarios[i];

        Object.keys(scenario.yearlyValuesRef.current).forEach(key => {
          let val = parseFloat(scenario.yearlyValuesRef.current[key]);
          scenario.yearlyValuesRef.current[key] = (val * 1000).toString();
        });

        const updated = {
          ...scenario,
          units: 'Kilograms',
          initialInvestment: (parseFloat(scenario.initialInvestment) * 1000).toString()
        }

        updateScenario(updated.name, updated.initialInvestment, updated.discountRate, updated.totalYears, updated.yearlyValuesRef, updated.longTerm, updated.activeTab, updated.delay, getFullYearlyValues(updated), i)
      }

      setUpdate((u) => u + 1);
    }

    function convertToTons(){
      for (let i = 0; i < currentScenarios.length; i++){
        let scenario = currentScenarios[i];

        Object.keys(scenario.yearlyValuesRef.current).forEach(key => {
          let val = parseFloat(scenario.yearlyValuesRef.current[key]);
          scenario.yearlyValuesRef.current[key] = (val / 1000).toString();
        });

        const updated = {
          ...scenario,
          units: 'Metric Tons',
          initialInvestment: (parseFloat(scenario.initialInvestment) / 1000).toString()
        }

        updateScenario(updated.name, updated.initialInvestment, updated.discountRate, updated.totalYears, updated.yearlyValuesRef, updated.longTerm, updated.activeTab, updated.delay, getFullYearlyValues(updated), i)
      }

      setUpdate((u) => u + 1);
    }

    const getFullYearlyValues = (s) => {
      const baseValues = s.yearlyValuesRef.current.slice(0, parseInt(s.totalYears));

        const lastVal = baseValues[baseValues.length - 1];
        const extendedVals = Array(300 - baseValues.length-parseInt(s.delay)).fill(lastVal);
        return [...baseValues, ...extendedVals];
    };

    function changed(ind){
      function parseFloatValues(obj) {
        const parsed = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            parsed[key] = parseFloat(obj[key]);
          }
        }
        return parsed;
      }

      let scenario = currentScenarios[ind];
      let saved = JSON.parse(localStorage.getItem(scenario.createdAt));

      if (scenario.units === 'Kilograms' &&
      parseFloat(scenario.initialInvestment) === parseFloat(baseScenarioKG.initialInvestment) &&
      parseFloat(scenario.discountRate) === parseFloat(baseScenarioKG.discountRate) &&
      parseInt(scenario.totalYears) === parseInt(baseScenarioKG.totalYears) &&
      JSON.stringify(parseFloatValues(scenario.yearlyValuesRef.current.slice(0, parseInt(scenario.totalYears)))) === JSON.stringify(parseFloatValues(baseScenarioKG.yearlyValuesRef.current)) &&
      scenario.longTerm === baseScenarioKG.longTerm &&
      parseInt(scenario.delay) === parseInt(baseScenarioKG.delay)){
        return false;
      }

      else if (scenario.units === 'Metric Tons' &&
      parseFloat(scenario.initialInvestment) === parseFloat(baseScenarioMT.initialInvestment) &&
      parseFloat(scenario.discountRate) === parseFloat(baseScenarioMT.discountRate) &&
      parseInt(scenario.totalYears) === parseInt(baseScenarioMT.totalYears) &&
      JSON.stringify(parseFloatValues(scenario.yearlyValuesRef.current.slice(0, parseInt(scenario.totalYears)))) === JSON.stringify(parseFloatValues(baseScenarioMT.yearlyValuesRef.current)) &&
      scenario.longTerm === baseScenarioMT.longTerm &&
      parseInt(scenario.delay) === parseInt(baseScenarioMT.delay)){
        return false;
      }

      else if(!saved){
        return true;
      }

      else{
        if(
          scenario.name === saved.name &&
          scenario.initialInvestment === saved.initialInvestment &&
          scenario.discountRate === saved.discountRate &&
          scenario.totalYears === saved.totalYears &&
          JSON.stringify(parseFloatValues(Object.values(scenario.yearlyValuesRef.current.slice(0, parseInt(scenario.totalYears))))) === JSON.stringify(parseFloatValues(saved.yearlyValues)) &&
          scenario.longTerm === saved.longTerm &&
          scenario.delay === saved.delay &&
          scenario.units === saved.units
        ){
          return false;
        }
        else{
          return true;
        }
      }
    }

    function calculateNPV(initial, values, rate, delayed, totalYears, longTerm, ind = index) {
        let delay = parseInt(delayed);
        let years = parseInt(totalYears);

        npvValuesRef.current = {};
        npvTotalRef.current = {};
        const copyValues = [...values];

        for (let i = 0; i < delay; i++){
          npvValuesRef.current[i] = 0;
          npvTotalRef.current[i] = 0;
        }

        let initialDiscount = (1 + parseFloat(rate)/100) ** (delay)
        let npv = (parseFloat(initial)/initialDiscount);
        npvValuesRef.current[delay] = npv;
        npvTotalRef.current[delay] = npv;

        let i = 0;
        while(i < copyValues.length){
            copyValues[i] = parseFloat(copyValues[i]);
            let discount = (1 + parseFloat(rate)/100) ** (i+1+delay);
            let newValue = copyValues[i]/discount;
            npv += newValue
            npvValuesRef.current[i+delay+1] = newValue;
            npvTotalRef.current[i+delay+1] = npv;
            i += 1;
        }

        if(!longTerm){
          npv = npvTotalRef.current[delay+years]
        }
        npv = parseFloat(npv.toPrecision(3))

        setNPV(npv);

        const updatedScenario = {
          ...currentScenarios[ind],
          npvYearlyValues: Object.values(npvValuesRef.current),
          npvTotalValues: Object.values(npvTotalRef.current),
          npv: npv,
        };

        return updatedScenario;
    }

    function saveToStorage(scenarioName, date, initialInvestment, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab, delay){
      calculateNPV(initialInvestment, Object.values(yearlyValuesRef.current), discountRate, delay, totalYears, longTerm);
      let initialEdited = initialInvestment;
      let yearlyValsEdited = Object.values(yearlyValuesRef.current);
      let npvEdited = npv;
      let npvValuesEdited = Object.values(npvValuesRef.current);
      let npvTotalEdited = Object.values(npvTotalRef.current);

      if (units === 'Metric Tons'){
        yearlyValsEdited = yearlyValsEdited.map(val => (parseFloat(val) * 1000).toString());
        initialEdited *= 1000;
        npvEdited *= 1000;
        npvValuesEdited = npvValuesEdited.map(val => (parseFloat(val) * 1000).toString());
        npvTotalEdited = npvTotalEdited.map(val => (parseFloat(val) * 1000).toString());
      }

      localStorage.setItem(date, JSON.stringify({name: scenarioName, initialInvestment: initialEdited, discountRate: discountRate, totalYears: totalYears, yearlyValues: yearlyValsEdited, npvYearlyValues: npvValuesEdited, npvTotalValues: npvTotalEdited, npv: npvEdited, longTerm: longTerm, activeTab: activeTab, delay: delay, units: 'Kilograms'}));
    }

    function updateSave(){
      let scenario = currentScenarios[toRemove];
      calculateNPV(initialInvestment, Object.values(scenario.yearlyValuesRef.current), scenario.discountRate, scenario.delay, scenario.totalYears, scenario.longTerm);
      localStorage.setItem(scenario.createdAt, JSON.stringify({name: scenario.name, initialInvestment: scenario.initialInvestment, discountRate: scenario.discountRate, totalYears: scenario.totalYears, yearlyValues: Object.values(scenario.yearlyValuesRef.current), npvYearlyValues: scenario.npvValuesRef, npvTotalValues: scenario.npvTotalRef, npv: npv, longTerm: scenario.longTerm, activeTab: scenario.activeTab, delay: scenario.delay, units: scenario.units}));
    }

    function addScenario(toAdd) {
        setCurrentScenarios(prev => {
          let newScenario;
          if (toAdd === null) {
            if (units === 'Kilograms'){
              newScenario = {
                name: 'Scenario #' + num,
                initialInvestment: baseScenarioKG.initialInvestment,
                discountRate: baseScenarioKG.discountRate,
                totalYears: baseScenarioKG.totalYears,
                yearlyValuesRef: baseScenarioKG.yearlyValuesRef,
                longTerm: baseScenarioKG.longTerm,
                activeTab: baseScenarioKG.activeTab,
                delay: baseScenarioKG.delay,
                units: 'Kilograms',
                createdAt: Date.now()
              };
            }
            else{
              newScenario = {
                name: 'Scenario #' + num,
                initialInvestment: baseScenarioMT.initialInvestment,
                discountRate: baseScenarioMT.discountRate,
                totalYears: baseScenarioMT.totalYears,
                yearlyValuesRef: baseScenarioMT.yearlyValuesRef,
                longTerm: baseScenarioMT.longTerm,
                activeTab: baseScenarioMT.activeTab,
                delay: baseScenarioMT.delay,
                units: 'Metric Tons',
                createdAt: Date.now()
              };
            }
            
          } else {
            const data = JSON.parse(localStorage.getItem(toAdd));
            if (units === 'Metric Tons'){
              let editedYearly = data.yearlyValues.map(val => (parseFloat(val)/1000).toString());

              newScenario = {
                name: data.name,
                initialInvestment: (parseFloat(data.initialInvestment)/1000).toString(),
                discountRate: data.discountRate,
                totalYears: data.totalYears,
                yearlyValuesRef: { current: editedYearly || [] },
                longTerm: data.longTerm,
                activeTab: data.activeTab,
                delay: data.delay,
                createdAt: toAdd,
                units: 'Kilograms'
              };
            }
            else{
              newScenario = {
                name: data.name,
                initialInvestment: data.initialInvestment,
                discountRate: data.discountRate,
                totalYears: data.totalYears,
                yearlyValuesRef: { current: data.yearlyValues || [] },
                longTerm: data.longTerm,
                activeTab: data.activeTab,
                delay: data.delay,
                createdAt: toAdd,
                units: 'Kilograms'
              };
            }
            
            setPage('npv');
          }
          const newList = [...prev, newScenario];
          setNum(n => n + 1);
          return newList;
        });

        setIndex(currentScenarios.length);
      }

    function removeScenario(ind) {
      setSelected(prev => prev.filter(sel => sel.createdAt !== currentScenarios[ind].createdAt));
      if (compare.createdAt === currentScenarios[ind].createdAt){
        setCompare([]);
      }

          let newIndex = index;

          if (index > ind) {
            newIndex = index - 1;
          } 
          else if (index === ind) {
            newIndex = Math.max(0, index - 1);
          }

          setIndex(newIndex);

          const newScenarios = currentScenarios.filter((_, i) => i !== ind);
      
          setCurrentScenarios(newScenarios);
      }

    function updateSelected(option){
      setSelected((prev) => {
        const exists = prev.some((o) => o.createdAt === option.createdAt);
        if (!exists) return prev;
    
        return prev.map((o) =>
          o.createdAt === option.createdAt ? option : o
        );
      });
    
      setUpdate((u) => u + 1);
    }

    function updateCompare(option){
      if (compare.createdAt === option.createdAt){
        setCompare(option)
      }
    }

    function updateScenario(name, initialInvestment, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab, delay, fullYears, i = index) {
      let updatedScenario = calculateNPV(initialInvestment, fullYears, discountRate, delay, totalYears, longTerm, i);
      const fullScenario = {
        ...updatedScenario,
        name,
        initialInvestment,
        discountRate,
        totalYears,
        yearlyValuesRef: { current: [...yearlyValuesRef.current] },
        longTerm,
        delay,
        activeTab,
        units
      };
      
      
      setCurrentScenarios(prev => {
        const updated = [...prev];
        updated[i] = { ...fullScenario };
        return updated;
      });
  

      updateSelected(fullScenario);
      updateCompare(fullScenario);
      }

        
    return (
        <div>
            <Header setPage = {setPage}/>
            {page === 'npv' && vertical && (<div className = {styles.mainContainer}>
                <div style={{ height: '80vh'}}>
                  <div className={styles.mainTabsContainer}>
                            {currentScenarios.map((scenario, ind) => (
                            <div
                                key={scenario.createdAt}
                                className={`${styles.mainTab} ${index === ind ? styles.selected : ''}`}
                                onClick={() => setIndex(ind)}>
                                <div className = {styles.mainTabName}> {ind === 0 ? `(BAU) ${scenario.name}` : scenario.name} </div>
                                {ind !== 0 && (<div className = {styles.x} onClick={(e) => {e.stopPropagation(); setToRemove(ind); 
                                  if (changed(ind)){
                                    setRemove(true);
                                  }
                                  else{
                                    removeScenario(ind);
                                  }}}>
                                  <i class='fas fa-close'></i>
                                  <span className={styles.tooltipRemove}>Remove Scenario</span>
                                </div>)}
                            </div>
                            ))}
                            <div className = {styles.addTab} onClick = {() => {setShowPopup(true);}}><i class='	fas fa-plus'></i>
                            <span className={styles.tooltipOpen}>Open Scenario</span>
                            </div>
                        </div>
                    <div className = {styles.mainNPV}>
                    <div className = {styles.calcHeaders}>
                      <h2 className = {styles.sectionTitle}>Net Present Value of CO<sub>2</sub> Calculator</h2>
                      <div className = {styles.alignRight}>
                        <div className={styles.dropdown}>
                          <button className={styles.navButton}>More Options</button>
                          <div className={styles.dropdownContent}>
                          <a onClick={() => {setEmissions(prev => !prev);}}>Switch Mode: {emissions ? `Reductions` : 'Emissions'}</a>
                              <a onClick={() => {setVertical(prev => !prev);}}>Switch Layout: {vertical ? `Horizontal` : 'Vertical'}</a>
                              <a onClick={() => {setUnits(prev => {if (prev === 'Kilograms'){convertToTons(); return 'Metric Tons'} else{convertToKilograms(); return 'Kilograms';}})}}>Switch Units: {units === 'Kilograms' ? `Metric Tons` : 'Kilograms'}</a>
                          </div>
                        </div>
                      </div>
                      </div>
                        <Calculator key={`${index}-${units}`} bau = {index === 0} vertical = {vertical} scenario = {currentScenarios[index]} saveToStorage = {saveToStorage} updateScenario = {updateScenario} units = {units}/>
                        <Visuals scenarioData = {currentScenarios} index = {index} units = {units} delay = {parseInt(currentScenarios[index].delay)} vertical = {vertical} emissions = {emissions}/>
                        <SharedVisuals scenarioData = {currentScenarios} selected = {selected} setSelected = {setSelected} update = {update} units = {units} emissions = {emissions}/>
                        <Decarbonization bau = {currentScenarios[0]} scenarios = {currentScenarios} units = {units} update = {update} compare = {compare} setCompare = {setCompare}/>
                    </div>
                  
                </div>
                {showPopup && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Which Type of Scenario to Open?</h2>
                        <div className = {styles.popupAddContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false);}}>Case Study</button>
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); setPage('saved');}}>Saved</button>
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); addScenario(null);}}>New</button>
                        </div>
                    </div>
                </div>
            )}
            {remove && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Remove This Scenario Without Saving?</h2>
                        {localStorage.getItem(currentScenarios[toRemove].createdAt) !== null && (<div className = {styles.popupAddContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); removeScenario(toRemove);}}>Remove</button>
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); updateSave(); removeScenario(toRemove);}}>Save</button>
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); setNewName(currentScenarios[toRemove].name); setSaveAs(true); }}>Save As</button>
                        </div>)}
                        {localStorage.getItem(currentScenarios[toRemove].createdAt) === null && (<div className = {styles.popup2Container}> 
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); removeScenario(toRemove)}}>Remove</button>
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); setNewName(currentScenarios[toRemove].name); setSaveAs(true); }}>Save As</button>
                        </div>)}
                    </div>
                </div>
            )}
            {saveAs && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Edit Name and/or Save:</h2>
                        <input id="scenarioName" 
                                value = {newName} 
                                onChange={(e) => setNewName(e.target.value)} 
                                type="text" />
                        <div className = {styles.popupButtonContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setSaveAs(false); setRemove(true);}}>Close</button>
                            <button className = {styles.popupButton} onClick={() => {setSaveAs(false); let scenario = currentScenarios[toRemove]; saveToStorage(newName, Date.now(), scenario.initialInvestment, scenario.discountRate, scenario.totalYears, scenario.yearlyValuesRef, scenario.longTerm, scenario.activeTab); removeScenario(toRemove);}}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            </div>)}
            {page === 'npv' && !vertical && (<div className = {styles.mainContainer}>
                <div style={{ height: '80vh'}}>
                  <div className={styles.mainTabsContainer}>
                  {currentScenarios.map((scenario, ind) => (
                            <div
                                key={scenario.createdAt}
                                className={`${styles.mainTab} ${index === ind ? styles.selected : ''}`}
                                onClick={() => setIndex(ind)}>
                                <div className = {styles.mainTabName}> {ind === 0 ? `(BAU) ${scenario.name}` : scenario.name} </div>
                                {ind !== 0 && (<div className = {styles.x} onClick={(e) => {e.stopPropagation(); setToRemove(ind); 
                                  if (changed(ind)){
                                    setRemove(true);
                                  }
                                  else{
                                    removeScenario(ind);
                                  }}}>
                                  <i class='fas fa-close'></i>
                                  <span className={styles.tooltipRemove}>Remove Scenario</span>
                                </div>)}
                            </div>
                            ))}
                            <div className = {styles.addTab} onClick = {() => {setShowPopup(true);}}><i class='	fas fa-plus'></i>
                            <span className={styles.tooltipOpen}>Open Scenario</span>
                            </div>
                        </div>
                    <div className = {styles.mainNPV}>
                      <div className = {styles.calcHeaders}>
                      <h2 className = {styles.sectionTitle}>Net Present Value of CO<sub>2</sub> Calculator</h2>
                      <div className = {styles.alignRight}>
                        <div className={styles.dropdown}>
                          <button className={styles.navButton}>More Options</button>
                          <div className={styles.dropdownContent}>
                          <a onClick={() => {setEmissions(prev => !prev);}}>Switch Mode: {emissions ? `Reductions` : 'Emissions'}</a>
                              <a onClick={() => {setVertical(prev => !prev);}}>Switch Layout: {vertical ? `Horizontal` : 'Vertical'}</a>
                              <a onClick={() => {setUnits(prev => {if (prev === 'Kilograms'){convertToTons(); return 'Metric Tons'} else{convertToKilograms(); return 'Kilograms';}})}}>Switch Units: {units === 'Kilograms' ? `Metric Tons` : 'Kilograms'}</a>
                          </div>
                        </div>
                      </div>
                      </div>
                      <div className = {styles.horizontal}>
                        <Calculator key={`${index}-${units}`} bau = {index === 0} vertical = {vertical} scenario = {currentScenarios[index]} saveToStorage = {saveToStorage} updateScenario = {updateScenario} units = {units}/>
                        <Visuals scenarioData = {currentScenarios} index = {index} units = {units} delay = {parseInt(currentScenarios[index].delay)} vertical = {vertical} emissions = {emissions}/>
                      </div>
                      <SharedVisuals scenarioData = {currentScenarios} selected = {selected} setSelected = {setSelected} update = {update} units = {units} emissions = {emissions}/>
                      <Decarbonization bau = {currentScenarios[0]} scenarios = {currentScenarios} units = {units} update = {update} compare = {compare} setCompare = {setCompare}/>
                  </div>
                  
                </div>
                {showPopup && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Which Type of Scenario to Open?</h2>
                        <div className = {styles.popupAddContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false);}}>Case Study</button>
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); setPage('saved');}}>Saved</button>
                            <button className = {styles.popupButton} onClick={() => {setShowPopup(false); addScenario(null);}}>New</button>
                        </div>
                    </div>
                </div>
            )}
            {remove && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Remove This Scenario Without Saving?</h2>
                        {localStorage.getItem(currentScenarios[toRemove].createdAt) !== null && (<div className = {styles.popupAddContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); removeScenario(toRemove)}}>Remove</button>
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); updateSave(); removeScenario(toRemove);}}>Save</button>
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); setNewName(currentScenarios[toRemove].name); setSaveAs(true);}}>Save As</button>
                        </div>)}
                        {localStorage.getItem(currentScenarios[toRemove].createdAt) === null && (<div className = {styles.popup2Container}> 
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); removeScenario(toRemove)}}>Remove</button>
                            <button className = {styles.popupButton} onClick={() => {setRemove(false); setNewName(currentScenarios[toRemove].name); setSaveAs(true);}}>Save As</button>
                        </div>)}
                    </div>
                </div>
            )}
            {saveAs && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Edit Name and/or Save:</h2>
                        <input id="scenarioName" 
                                value = {newName} 
                                onChange={(e) => setNewName(e.target.value)} 
                                type="text" />
                        <div className = {styles.popupButtonContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setSaveAs(false); setRemove(true);}}>Close</button>
                            <button className = {styles.popupButton} onClick={() => {setSaveAs(false); let scenario = currentScenarios[toRemove]; saveToStorage(newName, Date.now(), scenario.initialInvestment, scenario.discountRate, scenario.totalYears, scenario.yearlyValuesRef, scenario.longTerm, scenario.activeTab); removeScenario(toRemove);}}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            </div>)}
            {page === 'saved' && (<Saved addScenario = {addScenario} setPage = {setPage}/>)}
        </div> 
    );
};

export default NPV;