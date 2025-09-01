// Not Updated - Old Version

import React, {useState, useRef, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from '../css/NPV.module.css'

import Calculator from '../components/Finance/Calculator'
import Visuals from '../components/Finance/Visuals'
import Header from '../components/Header'
import Saved from '../components/Saved'
import SharedVisuals from '../components/Finance/SharedVisuals'
import HorizontalVisuals from '../components/Finance/HorizontalVisuals'


const NPV = () => {
    const [npv, setNPV] = useState(0);
    const npvValuesRef = useRef({});
    const npvTotalRef = useRef({});

    const navigate = useNavigate();
    const [num, setNum] = useState(1);
    const [empty, setEmpty] = useState(true);

    const [page, setPage] = useState('npv');
    const [showPopup, setShowPopup] = useState(false);
    const [vertical, setVertical] = useState(false);
    const [selected, setSelected] = useState([]);
    const [remove, setRemove] = useState(false);
    const [saveAs, setSaveAs] = useState(false);
    const [newName, setNewName] = useState('');

    
    const [index, setIndex] = useState(0);
    const [toRemove, setToRemove] = useState(0);
    const [currentScenarios, setCurrentScenarios] = useState([]);
    const [update, setUpdate] = useState(0);

    function changed(ind){
      let scenario = currentScenarios[ind];
      let saved = JSON.parse(localStorage.getItem(scenario.createdAt));
  
      if (scenario.initialInvestment === '$300.00' &&
      scenario.discountRate === '5.00%' &&
      scenario.totalYears === '5' &&
      JSON.stringify(scenario.yearlyValuesRef.current) === JSON.stringify(['$300.00', '$100.00', '$100.00', '$100.00', '$100.00', '$100.00']) &&
      scenario.longTerm === false){
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
          JSON.stringify(Object.values(scenario.yearlyValuesRef.current)) === JSON.stringify(saved.yearlyValues) &&
          scenario.longTerm === saved.longTerm
        ){
          return false;
        }
        else{
          return true;
        }
      }
    }

    function calculateNPV(values, rate) {
        npvValuesRef.current = {};
        npvTotalRef.current = {};
        const copyValues = [...values];
        let npv = 0;

        npv -= parseFloat(copyValues[0].substring(1));
        npvValuesRef.current[0] = npv;
        npvTotalRef.current[0] = npv;
        
        let i = 1;
        while(copyValues[i]){
            copyValues[i] = parseFloat(copyValues[i].substring(1));
            let discount = (1 + parseFloat(rate.substring(0, rate.length-1))/100) ** i;
            let newValue = copyValues[i]/discount;
            npv += newValue
            npvValuesRef.current[i] = newValue;
            npvTotalRef.current[i] = npv;
            i += 1;
        }
        setNPV(npv.toFixed(2));

        
        const updatedScenario = {
          ...currentScenarios[index],
          npvYearlyValues: Object.values(npvValuesRef.current),
          npvTotalValues: Object.values(npvTotalRef.current),
          npv: npv.toFixed(2),
        };
      
        setCurrentScenarios((prev) =>
          prev.map((s, i) => (i === index ? updatedScenario : s))
        );
      
        updateSelected(updatedScenario);
    }

    function saveToStorage(scenarioName, date, initialInvestment, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab){
        calculateNPV(Object.values(yearlyValuesRef.current), discountRate);
        localStorage.setItem(date, JSON.stringify({name: scenarioName, initialInvestment: initialInvestment, discountRate: discountRate, totalYears: totalYears, yearlyValues: Object.values(yearlyValuesRef.current), npvYearlyValues: Object.values(npvValuesRef.current), npvTotalValues: Object.values(npvTotalRef.current), npv: npv, longTerm: longTerm, activeTab: activeTab}));
    }

    function updateSave(){
      let scenario = currentScenarios[toRemove];
      calculateNPV(Object.values(scenario.yearlyValuesRef.current), scenario.discountRate);
      localStorage.setItem(scenario.createdAt, JSON.stringify({name: scenario.name, initialInvestment: scenario.initialInvestment, discountRate: scenario.discountRate, totalYears: scenario.totalYears, yearlyValues: Object.values(scenario.yearlyValuesRef.current), npvYearlyValues: scenario.npvValuesRef, npvTotalValues: scenario.npvTotalRef, npv: npv, longTerm: scenario.longTerm, activeTab: scenario.activeTab}));
    }

    function addScenario(toAdd) {
        setCurrentScenarios(prev => {
          let newScenario;
          if (toAdd === null) {
            newScenario = {
              name: 'Scenario #' + num,
              initialInvestment: '$300.00',
              discountRate: '5.00%',
              totalYears: '5',
              yearlyValuesRef: {current: ['$300.00', '$100.00', '$100.00', '$100.00', '$100.00', '$100.00']},
              longTerm: false,
              activeTab: 'Basic',
              createdAt: Date.now()
            };
          } else {
            const data = JSON.parse(localStorage.getItem(toAdd));
            newScenario = {
              name: data.name,
              initialInvestment: data.initialInvestment,
              discountRate: data.discountRate,
              totalYears: data.totalYears,
              yearlyValuesRef: { current: data.yearlyValues || [] },
              longTerm: data.longTerm,
              activeTab: data.activeTab,
              createdAt: toAdd
            };
            setPage('npv');
          }
          const newList = [...prev, newScenario];
          setNum(n => n + 1);
          return newList;
        });

        setIndex(currentScenarios.length);
      }

    function removeScenario(ind) {
      setSelected(prev => prev.filter(sel => sel.name !== currentScenarios[ind].name));

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

          if(newScenarios.length === 0){
            setEmpty(true);
          }
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

    function updateScenario(name, initialInvestment, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab) {
      const updatedScenario = {
        ...currentScenarios[index],
        name,
        initialInvestment,
        discountRate,
        totalYears,
        yearlyValuesRef,
        longTerm,
        activeTab
      };

      setCurrentScenarios(prev => 
        prev.map((s, i) => (i === index ? updatedScenario : s))
      );

      updateSelected(updatedScenario);
      }

    return (
        <div>
            <Header setVertical={setVertical}/>
            {page === 'npv' && empty && (<div className = {styles.mainContainer}>
                  <div style={{ height: '80vh'}}>
                      <div className={styles.mainTabsContainer}>
                                {currentScenarios.map((scenario, ind) => (
                                <div
                                    key={scenario.name+ind}
                                    className={`${styles.mainTab} ${index === ind ? styles.selected : ''}`}
                                    onClick={() => setIndex(ind)}>
                                    <div className = {styles.mainTabName}>{scenario.name} </div>
                                    <div className = {styles.x} onClick={(e) => {e.stopPropagation();}}>
                                      <i class='fas fa-close'></i>
                                    </div>
                                    
                                </div>
                                ))}
                                <div className = {styles.addTab} onClick = {() => {setShowPopup(true);}}><i class='	fas fa-plus'></i></div>
                            </div>
                        <div className = {styles.mainNPV}>
                    </div>
                    </div>
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Which Type of Scenario to Open?</h2>
                        <div className = {styles.popupAddContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setEmpty(false);}}>Case Study</button>
                            <button className = {styles.popupButton} onClick={() => {setEmpty(false); setPage('saved');}}>Saved</button>
                            <button className = {styles.popupButton} onClick={() => {setEmpty(false); addScenario(null);}}>New</button>
                        </div>
                    </div>
                </div>
              </div>)}
            {page === 'npv' && !empty && vertical && (<div className = {styles.mainContainer}>
                <div style={{ height: '80vh'}}>
                  <div className={styles.mainTabsContainer}>
                            {currentScenarios.map((scenario, ind) => (
                            <div
                                key={scenario.name+ind}
                                className={`${styles.mainTab} ${index === ind ? styles.selected : ''}`}
                                onClick={() => setIndex(ind)}>
                                <div className = {styles.mainTabName}>{scenario.name} </div>
                                <div className = {styles.x} onClick={(e) => {e.stopPropagation(); setToRemove(ind); 
                                  if (changed(ind)){
                                    setRemove(true);
                                  }
                                  else{
                                    removeScenario(ind);
                                  }}}>
                                  <i class='fas fa-close'></i>
                                  <span className={styles.tooltipRemove}>Remove Scenario</span>
                                </div>
                            </div>
                            ))}
                            <div className = {styles.addTab} onClick = {() => {setShowPopup(true);}}><i class='	fas fa-plus'></i>
                            <span className={styles.tooltipOpen}>Open Scenario</span>
                            </div>
                        </div>
                    <div className = {styles.mainNPV}>
                    <h2 className = {styles.sectionTitle}>Net Present Value (NPV) Calculator</h2>
                        <Calculator key={index} vertical = {vertical} scenario = {currentScenarios[index]} saveToStorage = {saveToStorage} calculateNPV = {calculateNPV} updateScenario = {updateScenario}/>
                        <Visuals scenarioData = {currentScenarios} index = {index}/>
                        <SharedVisuals scenarioData = {currentScenarios} selected = {selected} setSelected = {setSelected} update = {update}/>
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
            {page === 'npv' && !empty && !vertical && (<div className = {styles.mainContainer}>
                <div style={{ height: '80vh'}}>
                  <div className={styles.mainTabsContainer}>
                            {currentScenarios.map((scenario, ind) => (
                            <div
                                key={scenario.name}
                                className={`${styles.mainTab} ${index === ind ? styles.selected : ''}`}
                                onClick={() => setIndex(ind)}>
                                <div className = {styles.mainTabName}>{scenario.name} </div>
                                <div className = {styles.x} onClick={(e) => {e.stopPropagation(); setToRemove(ind); 
                                  if (changed(ind)){
                                    setRemove(true);
                                  }
                                  else{
                                    removeScenario(ind);
                                  }}}>
                                  <i class='fas fa-close'></i>
                                  <span className={styles.tooltipRemove}>Remove Scenario</span>
                                </div>
                            </div>
                            ))}
                            <div className = {styles.addTab} onClick = {() => {setShowPopup(true);}}><i class='	fas fa-plus'></i>
                            <span className={styles.tooltipOpen}>Open Scenario</span>
                            </div>
                        </div>
                    <div className = {styles.mainNPV}>
                    <h2 className = {styles.sectionTitle}>Net Present Value (NPV) Calculator</h2>
                      <div className = {styles.horizontal}>
                        <Calculator key = {index} vertical = {vertical} scenario = {currentScenarios[index]} saveToStorage = {saveToStorage} calculateNPV = {calculateNPV} updateScenario = {updateScenario}/>
                        <HorizontalVisuals scenarioData = {currentScenarios} index = {index}/>
                      </div>
                      <SharedVisuals scenarioData = {currentScenarios} selected = {selected} setSelected = {setSelected} update = {update}/>
                    </div>
                  
                </div>
                {!empty && showPopup && (
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
            {page === 'saved' && (<Saved addScenario = {addScenario}/>)}
        </div> 
    );
};

export default NPV;