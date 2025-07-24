import React, {useState, useRef} from "react"; //react imports

import styles from '../css/NPV.module.css' //styling imports

//component imports
import FAQS from './FAQs'
import Calculator from '../components/Carbon/Calculator'
import Visuals from '../components/Carbon/Visuals'
import Header from '../components/Header'
import Saved from '../components/Saved'
import SharedVisuals from '../components/Carbon/SharedVisuals'
import Decarbonization from "../components/Carbon/Decarbonization";


const NPV = () => {
  //base scenarios for BAU in kilograms and metric tons
  const baseScenarioKG = {bau: true, createdAt: 0, name: 'Scenario', upfrontEmissions: '300.00', discountRate: '3.355', totalYears: '5', yearlyValuesRef: {current: ['100.00', '100.00', '100.00', '100.00', '100.00']}, longTerm: true, activeTab: 'Basic', delay: '0', units: 'Kilograms'};
  const baseScenarioMT = {bau: true, createdAt: 0, name: 'Scenario', upfrontEmissions: '0.3', discountRate: '3.355', totalYears: '5', yearlyValuesRef: {current: ['0.1', '0.1', '0.1', '0.1', '0.1']}, longTerm: true, activeTab: 'Basic', delay: '0', units: 'Metric Tons'};


  //main variables
  const [currentScenarios, setCurrentScenarios] = useState(() => {
    const stored = localStorage.getItem("scenario-bau");
    return stored ? [{ ...JSON.parse(stored), yearlyValuesRef: { current: JSON.parse(stored).yearlyValues || [] }, bau: true }] : [baseScenarioKG];
  }); //list of all open scenarios
  const [index, setIndex] = useState(0); //current index based on tabs - which scenario to display
  const [page, setPage] = useState('npv'); //what page to display: npv, saved, faqs


  //variables for calculating NPV for a scenario
  const [npv, setNPV] = useState(0);
  const npvValuesRef = useRef({}); //yearly present values
  const npvTotalRef = useRef({}); //cumulative present values


  //initial popup
  const [newOpen, setNewOpen] = useState(true); //keeps track if page was just opened
  const [showAgain, setShowAgain] = useState(true); //"don't show this again button" on initial popup
  

  //all updated under 'more options' button
  const [showBAU, setShowBAU] = useState(true); //show/hide BAU scenario from tab list
  const [units, setUnits] = useState('Kilograms') //units: kilograms or metric tons
  const [emissions, setEmissions] = useState(true); //set mode: emissions or reductions
  const [vertical, setVertical] = useState(false); //set layout: vertical or horizontal


  //adding scenarios
  const [addPopup, setAddPopup] = useState(false); //show popup for adding new scenario
  const [num, setNum] = useState(1); //number for creating new scenario


  //removing scenarios
  const [remove, setRemove] = useState(false); //show remove popup if scenario has been edited (delete, save, save as)
  const [toRemove, setToRemove] = useState(0); //save index of scenario to delete after saving

  
  //saving scenarios
  const [saveAs, setSaveAs] = useState(false); //show save as popup if saving edited scenario
  const [newName, setNewName] = useState(''); //setting new name for a 'save as' scenario


  //comparing scenarios
  const [selected, setSelected] = useState([]); //selected scenarios for comparison graph
  const [compare, setCompare] = useState([]); //selected scenario for effective decarbonization graph
  const [update, setUpdate] = useState(0); //update shared comparison and decarbonization graphs after values change


  //convert all current scenarios to kilograms
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
        upfrontEmissions: (parseFloat(scenario.upfrontEmissions) * 1000).toString()
      }

      //fully update the scenario
      updateScenario(updated.name, updated.upfrontEmissions, updated.discountRate, updated.totalYears, updated.yearlyValuesRef, updated.longTerm, updated.activeTab, updated.delay, getFullYearlyValues(updated), i)
    }
  }

  //convert all current scenarios to metric tons
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
        upfrontEmissions: (parseFloat(scenario.upfrontEmissions) / 1000).toString()
      }

      //fully update the scenario
      updateScenario(updated.name, updated.upfrontEmissions, updated.discountRate, updated.totalYears, updated.yearlyValuesRef, updated.longTerm, updated.activeTab, updated.delay, getFullYearlyValues(updated), i)
    }
  }

  //handle toggle in initial popup: don't show this again
  function handleToggle(){
    setShowAgain(prev => !prev);
  }


  //extend yearly values to 300 years (long term value)
  const getFullYearlyValues = (s) => {
    const baseValues = s.yearlyValuesRef.current.slice(0, parseInt(s.totalYears));

    const lastVal = baseValues[baseValues.length - 1];
    const extendedVals = Array(300 - baseValues.length-parseInt(s.delay)).fill(lastVal);
    return [...baseValues, ...extendedVals];
  };

  //function to fully calculate npv
  function calculateNPV(initial, values, rate, delayed, totalYears, longTerm, ind = index) {
    let delay = parseInt(delayed);
    let years = parseInt(totalYears);

    npvValuesRef.current = {};
    npvTotalRef.current = {};
    const copyValues = [...values];

    //all values are 0 until delay ends
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

    //sets npv based on total years if not long term
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


  //opens new scenario
  function addScenario(toAdd) {
    setCurrentScenarios(prev => {
      let newScenario;

      //if toAdd is null, then use base scenario for kilograms or metric tons
      if (toAdd === null) {
        if (units === 'Kilograms'){
          newScenario = {
            name: 'Scenario #' + num,
            upfrontEmissions: baseScenarioKG.upfrontEmissions,
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
            upfrontEmissions: baseScenarioMT.upfrontEmissions,
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
      } 

      //otherwise, retrieve saved data from local storage
      else {
        const data = JSON.parse(localStorage.getItem(toAdd));

        //since all saved scenarios are in kilograms, convert to metric tons if needed
        if (units === 'Metric Tons'){
          let editedYearly = data.yearlyValues.map(val => (parseFloat(val)/1000).toString());

          newScenario = {
            name: data.name,
            upfrontEmissions: (parseFloat(data.upfrontEmissions)/1000).toString(),
            discountRate: data.discountRate,
            totalYears: data.totalYears,
            yearlyValuesRef: { current: editedYearly || [] },
            longTerm: data.longTerm,
            activeTab: data.activeTab,
            delay: data.delay,
            createdAt: data.createdAt,
            units: 'Kilograms'
          };
        }
        else {
          newScenario = {
            name: data.name,
            upfrontEmissions: data.upfrontEmissions,
            discountRate: data.discountRate,
            totalYears: data.totalYears,
            yearlyValuesRef: { current: data.yearlyValues || [] },
            longTerm: data.longTerm,
            activeTab: data.activeTab,
            delay: data.delay,
            createdAt: data.createdAt,
            units: 'Kilograms'
          };
        }
        
        setPage('npv');
      }
      const newList = [...prev, newScenario];
      setNum(n => n + 1);
      return newList;
    });

    setIndex(currentScenarios.length); //set index as new scenario
  }

  //remove scenario at ind
  function removeScenario(ind) {
    //if scenario was selected for comparison graph, remove it
    setSelected(prev => prev.filter(sel => sel.createdAt !== currentScenarios[ind].createdAt));
    
    //if scenario was selected for decarbonization graph, remove it
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

    //if only scenario is bau when bau is hidden, show popup to add scenario
    if (newScenarios.length === 1 && !showBAU){
      setAddPopup(true);
    }
      
    setCurrentScenarios(newScenarios);
  }

  //check if scenario has changed (if so, gives option to save before removing)
  function changed(ind){
    //helper function for parsing values
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
    let saved = JSON.parse(localStorage.getItem("scenario-" + scenario.createdAt)); //saved version of the scenario (if it exists)
    
    //compare to base scenario for kilograms
    if (scenario.units === 'Kilograms' &&
    parseFloat(scenario.upfrontEmissions) === parseFloat(baseScenarioKG.upfrontEmissions) &&
    parseFloat(scenario.discountRate) === parseFloat(baseScenarioKG.discountRate) &&
    parseInt(scenario.totalYears) === parseInt(baseScenarioKG.totalYears) &&
    JSON.stringify(parseFloatValues(scenario.yearlyValuesRef.current.slice(0, parseInt(scenario.totalYears)))) === JSON.stringify(parseFloatValues(baseScenarioKG.yearlyValuesRef.current)) &&
    scenario.longTerm === baseScenarioKG.longTerm &&
    parseInt(scenario.delay) === parseInt(baseScenarioKG.delay)){
      return false; //false (ie. did not change) if same as base
    }

    //compare to base scenario for metric tons
    else if (scenario.units === 'Metric Tons' &&
    parseFloat(scenario.upfrontEmissions) === parseFloat(baseScenarioMT.upfrontEmissions) &&
    parseFloat(scenario.discountRate) === parseFloat(baseScenarioMT.discountRate) &&
    parseInt(scenario.totalYears) === parseInt(baseScenarioMT.totalYears) &&
    JSON.stringify(parseFloatValues(scenario.yearlyValuesRef.current.slice(0, parseInt(scenario.totalYears)))) === JSON.stringify(parseFloatValues(baseScenarioMT.yearlyValuesRef.current)) &&
    scenario.longTerm === baseScenarioMT.longTerm &&
    parseInt(scenario.delay) === parseInt(baseScenarioMT.delay)){
      return false; //false (ie. did not change) if same as base
    }

    //if scenario is not saved, it has changed
    else if(!saved){
      return true;
    }

    //case where scenario is saved
    else{
      if(
      scenario.name === saved.name &&
      scenario.upfrontEmissions === saved.upfrontEmissions &&
      scenario.discountRate === saved.discountRate &&
      scenario.totalYears === saved.totalYears &&
      JSON.stringify(parseFloatValues(Object.values(scenario.yearlyValuesRef.current.slice(0, parseInt(scenario.totalYears))))) === JSON.stringify(parseFloatValues(saved.yearlyValues)) &&
      scenario.longTerm === saved.longTerm &&
      scenario.delay === saved.delay &&
      scenario.units === saved.units
      ){
        return false; //false (ie. did not change) if same as saved version
      }
      else{
        return true; //scenario has changed
      }
    }
  }

  //saves scenario to local storage
  function saveToStorage(scenarioName, date, upfrontEmissions, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab, delay){
    //calculate npv to save accurate values
    calculateNPV(upfrontEmissions, Object.values(yearlyValuesRef.current), discountRate, delay, totalYears, longTerm);
      
    let initialEdited = upfrontEmissions;
    let yearlyValsEdited = Object.values(yearlyValuesRef.current);
    let npvEdited = npv;
    let npvValuesEdited = Object.values(npvValuesRef.current);
    let npvTotalEdited = Object.values(npvTotalRef.current);

    //save all scenarios in kilograms, so conversions if scenario is currently in metric tons
    if (units === 'Metric Tons'){
      yearlyValsEdited = yearlyValsEdited.map(val => (parseFloat(val) * 1000).toString());
      initialEdited *= 1000;
      npvEdited *= 1000;
      npvValuesEdited = npvValuesEdited.map(val => (parseFloat(val) * 1000).toString());
      npvTotalEdited = npvTotalEdited.map(val => (parseFloat(val) * 1000).toString());
    }


    //items saved as "scenario-time" where time is millisecond of creating/saving
    localStorage.setItem("scenario-" + date, JSON.stringify({name: scenarioName, upfrontEmissions: initialEdited, discountRate: discountRate, totalYears: totalYears, yearlyValues: yearlyValsEdited, npvYearlyValues: npvValuesEdited, npvTotalValues: npvTotalEdited, npv: npvEdited, longTerm: longTerm, activeTab: activeTab, delay: delay, units: 'Kilograms', createdAt: date}));
  }


  //update selected if scenario changed
  function updateSelected(option){
    setSelected((prev) => {
      const exists = prev.some((o) => o.createdAt === option.createdAt); //if scenario is in selected
      
      if (!exists) return prev;
    
      return prev.map((o) =>
        o.createdAt === option.createdAt ? option : o //replace old version of scenario with updated
      );
    });
    
    setUpdate((u) => u + 1); //send update to compare graph component
  }

  //update compare (decarbonization) if scenario changed
  function updateCompare(option){
    if (compare.createdAt === option.createdAt){ //if scenario is in compare, update it
      setCompare(option)
    }

    setUpdate((u) => u + 1); //send update to decarbonization component
  }

  //update scenario based on new values
  function updateScenario(name, upfrontEmissions, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab, delay, fullYears, i = index) {
    let updatedScenario = calculateNPV(upfrontEmissions, fullYears, discountRate, delay, totalYears, longTerm, i);
    const fullScenario = {
      ...updatedScenario,
      name,
      upfrontEmissions,
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
  
    //update dependencies
    updateSelected(fullScenario);
    updateCompare(fullScenario);
  }

  //updates an already saved scenario in local storage
  function updateSave(){
    let scenario = currentScenarios[toRemove];
    saveToStorage(scenario.name, scenario.createdAt, scenario.upfrontEmissions, scenario.discountRate, scenario.totalYears, scenario.yearlyValuesRef, scenario.longTerm, scenario.activeTab, scenario.delay)
  }
        
  return (
    <div>
      <Header setPage = {setPage}/>

      {(localStorage.getItem("startingPopup") === null || localStorage.getItem("startingPopup") === "true") && newOpen && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <h2>Welcome to the Carbon Calculus Calculator!</h2>
            <p> <br/> </p>
            <p>If this is your first time, we highly recommend viewing our tutorial and/or FAQs before beginning your calculations. </p>
            <p> <br/> </p>
            <label>
              Don't Show This Again:
              <input type="checkbox" checked={!showAgain} onChange={handleToggle} />
            </label>
            <div className = {styles.popup2Container}> 
              <button className = {styles.popupButton} onClick={() => {
                if (!showAgain){
                  localStorage.setItem("startingPopup", false);
                }
                else {
                  localStorage.setItem("startingPopup", true);
                }
                setNewOpen(false);}}>Open Calculator</button>
              <button className = {styles.popupButton} onClick={() => {
                if (!showAgain){
                  localStorage.setItem("startingPopup", false);
                }
                else {
                  localStorage.setItem("startingPopup", true);
                }
                setNewOpen(false);
                setPage('faqs')}}>View Tutorial/FAQs</button>
            </div>
          </div>
        </div>
      )}

      {page === 'npv' && vertical && (
        <div className = {styles.mainContainer}>
          <div style={{ height: '80vh'}}>
            <div className={styles.mainTabsContainer}>
              {currentScenarios.map((scenario, ind) => {
                if (ind === 0 && !showBAU)  return null; 
                              
                return (
                <div key={scenario.createdAt}
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
                </div>)
              })}
              <div className = {styles.addTab} onClick = {() => {setAddPopup(true);}}><i class='	fas fa-plus'></i>
                <span className={styles.tooltipOpen}>Open Scenario</span>
              </div>
            </div>
            <div className = {styles.mainNPV}>
              <div className = {styles.calcHeaders}>
                <h2 className = {styles.sectionTitle}>Carbon Calculator</h2>
                <div className = {styles.alignRight}>
                  <div className={styles.dropdown}>
                    <button className={styles.moreOptions}>More Options</button>
                    <div className={styles.dropdownContent}>
                      <a onClick={() => {setShowBAU(prev => {if (prev && currentScenarios.length === 1){setAddPopup(true);} else if (index === 0){setIndex(1);} return !prev}); }}>{showBAU ? `Hide` : 'Show'} BAU</a>
                      <a onClick={() => {setEmissions(prev => !prev);}}>Switch Mode: {emissions ? `Reductions` : 'Emissions'}</a>
                      <a onClick={() => {setVertical(prev => !prev);}}>Switch Layout: {vertical ? `Horizontal` : 'Vertical'}</a>
                      <a onClick={() => {setUnits(prev => {if (prev === 'Kilograms'){convertToTons(); return 'Metric Tons'} else{convertToKilograms(); return 'Kilograms';}})}}>Switch Units: {units === 'Kilograms' ? `Metric Tons` : 'Kilograms'}</a>
                    </div>
                  </div>
                </div>
              </div>
              {(showBAU || currentScenarios?.length > 1) && (<div>
              <Calculator key={`${index}-${units}`} bauScenario = {index === 0} vertical = {vertical} scenario = {currentScenarios[index]} saveToStorage = {saveToStorage} updateScenario = {updateScenario} units = {units}/>
              <Visuals scenarioData = {currentScenarios} index = {index} units = {units} delay = {parseInt(currentScenarios[index].delay)} vertical = {vertical} emissions = {emissions}/>
              <SharedVisuals scenarioData = {currentScenarios} selected = {selected} setSelected = {setSelected} update = {update} units = {units} emissions = {emissions}/>
              <Decarbonization bau = {currentScenarios[0]} scenarios = {currentScenarios} units = {units} update = {update} compare = {compare} setCompare = {setCompare}/></div>)}
            </div>
          </div>
          {addPopup && (
            <div className={styles.overlay}>
              <div className={styles.popup}>
                <h2>Which Type of Scenario to Open?</h2>
                <div className = {styles.popupAddContainer}> 
                  <button className = {styles.popupButton} onClick={() => {setAddPopup(false);}}>Case Study</button>
                  <button className = {styles.popupButton} onClick={() => {setAddPopup(false); setPage('saved');}}>Saved</button>
                  <button className = {styles.popupButton} onClick={() => {setAddPopup(false); addScenario(null);}}>New</button>
                </div>
              </div>
            </div>
          )}
          {remove && (
            <div className={styles.overlay}>
              <div className={styles.popup}>
                <h2>Remove This Scenario Without Saving?</h2>
                {localStorage.getItem(currentScenarios[toRemove].createdAt) !== null && (
                  <div className = {styles.popupAddContainer}> 
                    <button className = {styles.popupButton} onClick={() => {setRemove(false); removeScenario(toRemove);}}>Remove</button>
                    <button className = {styles.popupButton} onClick={() => {setRemove(false); updateSave(); removeScenario(toRemove);}}>Save</button>
                    <button className = {styles.popupButton} onClick={() => {setRemove(false); setNewName(currentScenarios[toRemove].name); setSaveAs(true); }}>Save As</button>
                  </div>)}
                {localStorage.getItem(currentScenarios[toRemove].createdAt) === null && (
                  <div className = {styles.popup2Container}> 
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
                  <button className = {styles.popupButton} onClick={() => {setSaveAs(false); let scenario = currentScenarios[toRemove]; saveToStorage(newName, Date.now(), scenario.upfrontEmissions, scenario.discountRate, scenario.totalYears, scenario.yearlyValuesRef, scenario.longTerm, scenario.activeTab); removeScenario(toRemove);}}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>)}

      {page === 'npv' && !vertical && (
        <div className = {styles.mainContainer}>
          <div style={{ height: '80vh'}}>
            <div className={styles.mainTabsContainer}>
            {currentScenarios.map((scenario, ind) => {
              if (ind === 0 && !showBAU) return null; 
                          
              return (
                <div key={scenario.createdAt}
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
                </div>)
              })}
              <div className = {styles.addTab} onClick = {() => {setAddPopup(true);}}><i class='	fas fa-plus'></i>
                <span className={styles.tooltipOpen}>Open Scenario</span>
              </div>
            </div>
            <div className = {styles.mainNPV}>
              <div className = {styles.calcHeaders}>
                <h2 className = {styles.sectionTitle}>Carbon Calculator</h2>
                <div className = {styles.alignRight}>
                  <div className={styles.dropdown}>
                    <button className={styles.moreOptions}>More Options</button>
                    <div className={styles.dropdownContent}>
                      <a onClick={() => {setShowBAU(prev => {if (prev && currentScenarios.length === 1){setAddPopup(true);}else if (index === 0){setIndex(1);} return !prev}); }}>{showBAU ? `Hide` : 'Show'} BAU</a>
                      <a onClick={() => {setEmissions(prev => !prev);}}>Switch Mode: {emissions ? `Reductions` : 'Emissions'}</a>
                      <a onClick={() => {setVertical(prev => !prev);}}>Switch Layout: {vertical ? `Horizontal` : 'Vertical'}</a>
                      <a onClick={() => {setUnits(prev => {if (prev === 'Kilograms'){convertToTons(); return 'Metric Tons'} else{convertToKilograms(); return 'Kilograms';}})}}>Switch Units: {units === 'Kilograms' ? `Metric Tons` : 'Kilograms'}</a>
                    </div>
                  </div>
                </div>
              </div>
              {(showBAU || currentScenarios?.length > 1) && (<div><div className = {styles.horizontal}>
                <Calculator key={`${index}-${units}`} bauScenario = {index === 0} vertical = {vertical} scenario = {currentScenarios[index]} saveToStorage = {saveToStorage} updateScenario = {updateScenario} units = {units}/>
                <Visuals scenarioData = {currentScenarios} index = {index} units = {units} delay = {parseInt(currentScenarios[index].delay)} vertical = {vertical} emissions = {emissions}/>
              </div>
              <SharedVisuals scenarioData = {currentScenarios} selected = {selected} setSelected = {setSelected} update = {update} units = {units} emissions = {emissions}/>
              <Decarbonization bau = {currentScenarios[0]} scenarios = {currentScenarios} units = {units} update = {update} compare = {compare} setCompare = {setCompare}/> </div>)}
            </div>
          </div>
          {addPopup && (
            <div className={styles.overlay}>
              <div className={styles.popup}>
                <h2>Which Type of Scenario to Open?</h2>
                <div className = {styles.popupAddContainer}> 
                  <button className = {styles.popupButton} onClick={() => {setAddPopup(false);}}>Case Study</button>
                  <button className = {styles.popupButton} onClick={() => {setAddPopup(false); setPage('saved');}}>Saved</button>
                  <button className = {styles.popupButton} onClick={() => {setAddPopup(false); addScenario(null);}}>New</button>
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
                <button className = {styles.popupButton} onClick={() => {setSaveAs(false); let scenario = currentScenarios[toRemove]; saveToStorage(newName, Date.now(), scenario.upfrontEmissions, scenario.discountRate, scenario.totalYears, scenario.yearlyValuesRef, scenario.longTerm, scenario.activeTab); removeScenario(toRemove);}}>Save</button>
              </div>
            </div>
          </div>
          )}
        </div>)}

      {page === 'saved' && (<Saved addScenario = {addScenario} setPage = {setPage}/>)}

      {page === 'faqs' && (<FAQS/>)}
    </div> 
  );
};

export default NPV;