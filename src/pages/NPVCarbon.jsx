import React, {useState, useRef, useEffect} from "react"; //react imports
import { useNavigate, useLocation } from "react-router-dom"; //navigation imports

import styles from '../css/NPV.module.css' //styling imports

//component imports
import Calculator from '../components/Carbon/Calculator'
import Visuals from '../components/Carbon/Visuals'
import Header from '../components/Header'
import Comparison from '../components/Carbon/Comparison'
import Decarbonization from "../components/Carbon/Decarbonization";


const NPV = () => {
  //navigation variables
  let navigate = useNavigate();
  let location = useLocation();

  //base scenarios in kilograms, metric tons, pounds, short tons
  const baseScenario = {createdAt: Date.now(), name: '', upfrontEmissions: '3000.00', discountRate: '3.355', totalYears: '5', yearlyValuesRef: {current: ['1000.00', '1000.00', '1000.00', '1000.00', '1000.00']}, longTerm: false, activeTab: 'Basic', delay: '0', units: 'Kilograms'};

  //conversion rates
  const conversionRates = {
    'Kilograms': 1,          // base unit
    'Metric Tons': 1000,      // 1 metric ton = 1000 kg
    'Pounds': 0.45359237,    // 1 lb = 0.45359237 kg
    'Short Tons': 907.18474   // 1 short ton (US) = 907.18474 kg
  };

  //main variables
  const [currentScenarios, setCurrentScenarios] = useState([]); //list of all open scenarios
  const [caseStudy, setCaseStudy] = useState(); //name of current case study
  const [index, setIndex] = useState(0); //current index based on tabs - which scenario to display


  //variables for calculating NPV for a scenario
  const [npv, setNPV] = useState(0); //npv value
  const npvValuesRef = useRef({}); //yearly present values
  const npvTotalRef = useRef({}); //cumulative present values


  //initial popup
  const [initialPopup, setInitialPopup] = useState(((localStorage.getItem("startingPopup") === null || localStorage.getItem("startingPopup") === "true") && location.state));
  const [showAgain, setShowAgain] = useState(true); //"don't show this again" button on initial popup
  

  //different modes/settings
  const [units, setUnits] = useState('Kilograms') //units: kilograms or metric tons
  const [emissions, setEmissions] = useState(true); //set mode: emissions or reductions
  const [vertical, setVertical] = useState(false); //set layout: vertical or horizontal


  //comparing scenarios
  const [selected, setSelected] = useState([]); //selected scenarios for comparison graph
  const [bau, setBAU] = useState({}); //bau scenario for effective decarbonization graph
  const [compare, setCompare] = useState([]); //selected scenarios for effective decarbonization graph
  const [update, setUpdate] = useState(0); //update shared comparison and decarbonization graphs after values change

  
  //refs for scrolling with 'jump to'
  const calculatorRef = useRef(null);
  const visualsRef = useRef(null); //only available in vertical mode
  const comparisonRef = useRef(null);
  const decarbonizationRef = useRef(null);


  //when first rendered, open the previously open case study
  useEffect(() => {
    if ((currentScenarios.length === 0 && !caseStudy)){
      let currentCase = JSON.parse(localStorage.getItem('currentCase'));
      if (currentCase && localStorage.getItem('caseStudy-'+currentCase.name)){
        openCaseStudy(currentCase.name);
        setCaseStudy(currentCase.name);
      }
      else{
        openCaseStudy('Default');
        setCaseStudy('Default');
        localStorage.setItem('currentCase', JSON.stringify({name: 'Default'}));
      }
    }
  }, [currentScenarios, caseStudy])

  //updates name + contents of a case study
  function updateCaseStudy(cur = currentScenarios, caseName = caseStudy, newUnits = units) {
    if (caseName){
      let stored = JSON.parse(localStorage.getItem('caseStudy-' + caseName));
      let timeStamps = [];
      for (let i = 0; i < cur.length; i++){
        if (cur[i].name){
          timeStamps.push(cur[i].createdAt);
        }
      }
      stored.scenarios = timeStamps;
      stored.units = newUnits;
      localStorage.setItem('caseStudy-' + caseName, JSON.stringify(stored));
    }
  }

  //opens a case study and saves as current case
  function openCaseStudy(caseName = caseStudy){
    setCaseStudy(caseName);
    let currentCase = JSON.parse(localStorage.getItem('caseStudy-' + caseName));
    let newUnits = currentCase?.units ? currentCase.units : 'Kilograms'

    if (!currentCase){
      localStorage.setItem('caseStudy-'+caseName, JSON.stringify({openedAt: Date.now(), scenarios: Object.values([]), units: 'Kilograms'}));
      currentCase = JSON.parse(localStorage.getItem('caseStudy-' + caseName));
    }
    else{
      localStorage.setItem('caseStudy-'+caseName, JSON.stringify({openedAt: Date.now(), scenarios: currentCase.scenarios, units: newUnits}));
    }

    localStorage.setItem('currentCase', JSON.stringify({name: caseName}));
    let scenarios = currentCase.scenarios;
    setUnits(newUnits)

    if (scenarios.length === 0){
        let newS = baseScenario;
        newS.units = units;
        setCurrentScenarios([newS]);
    }
    else{
      let newScenarios = [];

      for (let i = 0; i < scenarios.length; i++){
        let data = JSON.parse(localStorage.getItem('scenario-' + scenarios[i]));
        let scenario = {
          name: data.name,
          upfrontEmissions: data.upfrontEmissions,
          discountRate: data.discountRate,
          totalYears: data.totalYears,
          yearlyValuesRef: { current: data.yearlyValues || [] },
          longTerm: data.longTerm,
          activeTab: data.activeTab,
          delay: data.delay,
          createdAt: data.createdAt,
          units: newUnits,
          npvYearlyValues: data.npvYearlyValues,
          npvTotalValues: data.npvTotalValues,
          npv: data.npv,
        };
        newScenarios.push(scenario);
      }

      setCurrentScenarios(newScenarios);
      updateCaseStudy(newScenarios, caseName, newUnits);
    }
  }

  //autosaves each scenario and updates case study, resets current scenario and index
  function resetCalculator(){
    for (let i = 0; i < currentScenarios.length; i++){
      let scenario = currentScenarios[i];
      saveToStorage(scenario.name, scenario.createdAt, scenario.upfrontEmissions, scenario.discountRate, scenario.totalYears, scenario.yearlyValuesRef, scenario.longTerm, scenario.activeTab, scenario.delay);
    }
    updateCaseStudy();
    setCurrentScenarios([]);
    setIndex(0);
  }

  //convert units from 'fromUnit' to 'toUnit'
  function convertUnits(fromUnit, toUnit){
    for (let i = 0; i < currentScenarios.length; i++){
        let scenario = currentScenarios[i];
  
        Object.keys(scenario.yearlyValuesRef.current).forEach(key => {
          let val = parseFloat(scenario.yearlyValuesRef.current[key]);
          let result = parseFloat((val * conversionRates[fromUnit]).toFixed(5)) / conversionRates[toUnit]
          scenario.yearlyValuesRef.current[key] = parseFloat((result.toFixed(8))).toString();
        });

        let upVal = parseFloat((parseFloat(scenario.upfrontEmissions) * conversionRates[fromUnit]).toFixed(5)) / conversionRates[toUnit]
        let upResult = parseFloat(upVal.toFixed(8))
  
        const updated = {
          ...scenario,
          units: toUnit,
          upfrontEmissions: (upResult).toString()
        }
  
        //fully update the scenario
        updateScenario(updated.name, updated.createdAt, updated.upfrontEmissions, updated.discountRate, updated.totalYears, updated.yearlyValuesRef, updated.longTerm, updated.activeTab, updated.delay, getFullYearlyValues(updated), i)
      }
    setUnits(toUnit)
  }

  //handle toggle in initial popup: "don't show this again"
  function handleToggle(){
    setShowAgain(prev => !prev);
  }

  //handles "jump to" events
  const scrollTo = (ref) => {
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  //extend yearly values to 100 years (long term value)
  const getFullYearlyValues = (s) => {
    const baseValues = s.yearlyValuesRef.current.slice(0, Math.min(100, parseInt(s.totalYears)));

    const lastVal = baseValues[baseValues.length - 1];
    const extendedVals = Array(100 - baseValues.length-parseInt(s.delay)).fill(lastVal);
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
    
    npv = parseFloat(npv.toPrecision(3)) //3 significant figures
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
  function addScenario() {
    setCurrentScenarios(prev => {
      let newScenario;

      newScenario = {
        name: '',
        upfrontEmissions: baseScenario.upfrontEmissions,
        discountRate: baseScenario.discountRate,
        totalYears: baseScenario.totalYears,
        yearlyValuesRef: baseScenario.yearlyValuesRef,
        longTerm: baseScenario.longTerm,
        activeTab: baseScenario.activeTab,
        delay: baseScenario.delay,
        units: units,
        createdAt: Date.now(),
      };
      
      const newList = [...prev, newScenario];
      updateCaseStudy(newList);
      return newList;
    });

    setIndex(currentScenarios.length); //set index as new scenario
  }

  //remove scenario at ind
  function removeScenario(ind) {
    //if scenario was selected for comparison graph or decarbonization, remove it
    setSelected(prev => prev.filter(sel => sel.createdAt !== currentScenarios[ind].createdAt));
    setCompare(prev => prev.filter(sel => sel.createdAt !== currentScenarios[ind].createdAt));

    //if scenario was selected as BAU for decarbonization graph, remove it
    if (bau.createdAt === currentScenarios[ind].createdAt){
      setBAU({});
    }

    let newIndex = index;

    if (index > ind) {
      newIndex = index - 1;
    } 
    else if (index === ind) {
      newIndex = Math.max(0, index - 1);
    }

    setIndex(newIndex);
    localStorage.removeItem('scenario-'+currentScenarios[ind].createdAt);
    
    setCurrentScenarios(prev => {
      const filtered = prev.filter((_, i) => i !== ind);
      updateCaseStudy(filtered);
      let newList = filtered.length > 0 ? filtered : [baseScenario];
      return newList;
    });  
  }

  //saves scenario to local storage
  function saveToStorage(scenarioName, date, upfrontEmissions, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab, delay){
    //calculate npv to save accurate values
    let curScenario = calculateNPV(upfrontEmissions, Object.values(yearlyValuesRef.current), discountRate, delay, totalYears, longTerm);

    //items saved as "scenario-time" where time is millisecond of creating/saving
    if (scenarioName !== ""){
      localStorage.setItem("scenario-" + date, JSON.stringify({name: scenarioName, upfrontEmissions: upfrontEmissions, discountRate: discountRate, totalYears: totalYears, yearlyValues: Object.values(yearlyValuesRef.current), npvYearlyValues: curScenario.npvYearlyValues, npvTotalValues: curScenario.npvTotalValues, npv: curScenario.npv, longTerm: longTerm, activeTab: activeTab, delay: delay, units: units, createdAt: date}));
    }
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
    setCompare((prev) => {
      const exists = prev.some((o) => o.createdAt === option.createdAt); //if scenario is in compare
      
      if (!exists) return prev;
    
      return prev.map((o) =>
        o.createdAt === option.createdAt ? option : o //replace old version of scenario with updated
      );
    });

    setUpdate((u) => u + 1); //send update to decarbonization component
  }

  //update BAU (decarbonization) if scenario changed
  function updateBAU(option){
    if (bau.createdAt === option.createdAt){ //if scenario is in compare, update it
      setBAU(option)
    }

    setUpdate((u) => u + 1); //send update to decarbonization component
  }

  //update scenario based on new values
  function updateScenario(name, createdAt, upfrontEmissions, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab, delay, fullYears, i = index) {
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
      saveToStorage(name, createdAt, upfrontEmissions, discountRate, totalYears, yearlyValuesRef, longTerm, activeTab, delay);
      updateCaseStudy(updated);
      return updated;
    });
  
    //update dependencies
    updateSelected(fullScenario);
    updateCompare(fullScenario);
    updateBAU(fullScenario);
  }
        
  return (
    <div>
      <Header />
      <div className = {styles.mainContainer}>
        <div style={{ height: '80vh'}}>
          <div className={styles.mainTabsContainer}>
            {currentScenarios.map((scenario, ind) => {          
              return (
              <div key={scenario.createdAt}
                className={`${styles.mainTab} ${index === ind ? styles.selected : ''}`}
                onClick={() => setIndex(ind)}>
                <div className = {styles.mainTabName}> {scenario.name} </div>
                <div className = {styles.x} onClick={(e) => {e.stopPropagation(); 
                  removeScenario(ind);}}>
                  <i className='fas fa-close'></i>
                  <span className={styles.tooltipRemove}>Remove Scenario</span>
                </div>
              </div>
              );
            })}
            <div className = {styles.addTab} onClick = {() => {addScenario();}}><i className='	fas fa-plus'></i>
              <span className={styles.tooltipOpen}>Open Scenario</span>
            </div>
          </div>
          <div className = {styles.mainNPV}>
            <div className = {styles.mainRibbonContainer}>
              <div className = {styles.mainRibbonButton}>
                Jump To...
                <div className={styles.ribbonContent}>
                  <a onClick={() => scrollTo(calculatorRef)}>Inputs</a>
                  {vertical && (<a onClick={() => scrollTo(visualsRef)}>Visuals</a>)}
                  <a onClick={() => scrollTo(comparisonRef)}>Comparison (NPV<sub>CO<sub>2</sub></sub>)</a>
                  <a onClick={() => scrollTo(decarbonizationRef)}>Decarbonization (D<sub>Eff</sub>)</a>
                </div>
              </div>
              <div className = {styles.mainRibbonButton} onClick = {() => {resetCalculator(); navigate('/CaseStudies')}}>
                View Case Studies
              </div>
              <div className = {styles.mainRibbonButton}>
                Switch Units
                <div className={styles.ribbonContent}>
                  <a onClick={() => {convertUnits(units, 'Kilograms')}}>Kilograms  {units === 'Kilograms' ? <i className='	fa fa-check'></i> : ''}</a>
                  <a onClick={() => {convertUnits(units, 'Metric Tons')}}>Metric Tons  {units === 'Metric Tons' ? <i className='	fa fa-check'></i> : ''}</a>
                  <a onClick={() => {convertUnits(units, 'Pounds')}}>Pounds  {units === 'Pounds' ? <i className='	fa fa-check'></i> : ''}</a>
                  <a onClick={() => {convertUnits(units, 'Short Tons')}}>Short Tons  {units === 'Short Tons' ? <i className='	fa fa-check'></i> : ''}</a>
                </div>
              </div>
              <div className = {styles.mainRibbonButton}>
                Switch Layout
                <div className={styles.ribbonContent}>
                    <a onClick={() => {setVertical(prev => {if (prev){return !prev} else{return prev}})}}>Horizontal  {!vertical ? <i className='	fa fa-check'></i> : ''}</a>
                    <a onClick={() => {setVertical(prev => {if (!prev){ return !prev} else{return prev}})}}>Vertical  {vertical ? <i className='	fa fa-check'></i> : ''}</a>
                  </div>
              </div>
              <div className = {styles.mainRibbonButton}>
                Change Mode
                <div className={styles.ribbonContent}>
                    <a onClick={() => {setEmissions(prev => {if (prev){return !prev} else{return prev}})}}>Reductions  {!emissions ? <i className='	fa fa-check'></i> : ''}</a>
                    <a onClick={() => {setEmissions(prev => {if (!prev){ return !prev} else{return prev}})}}>Emissions  {emissions ? <i className='	fa fa-check'></i> : ''}</a>
                  </div>
              </div>
            </div>
            {(currentScenarios?.length > 0) && (<div>
              {vertical && (<div>
                <div ref={calculatorRef} className = {styles.scrollTarget}>
                  <Calculator key={`${index}-${units}-${currentScenarios[index].name}`} scenario = {currentScenarios[index]} updateScenario = {updateScenario} units = {units} caseStudy = {caseStudy}/>
                </div>
                <div ref={visualsRef} className = {styles.scrollTarget}>
                  <Visuals scenarioData = {currentScenarios} index = {index} units = {units} delay = {parseInt(currentScenarios[index].delay)} vertical = {vertical} emissions = {emissions}/>
                </div>
              </div>)}
              {!vertical && (<div className = {`${styles.horizontal} ${styles.scrollTarget}`} ref={calculatorRef}>
                <Calculator key={`${index}-${units}-${currentScenarios[index]?.createdAt}`} scenario = {currentScenarios[index]} updateScenario = {updateScenario} units = {units} caseStudy = {caseStudy}/>
                <Visuals scenarioData = {currentScenarios} index = {index} units = {units} delay = {parseInt(currentScenarios[index]?.delay)} vertical = {vertical} emissions = {emissions}/>
              </div>)}
              <div ref={comparisonRef} className = {styles.scrollTarget}>
                <Comparison scenarioData = {currentScenarios} selected = {selected} setSelected = {setSelected} update = {update} units = {units} emissions = {emissions}/>
              </div>
              <div ref={decarbonizationRef} className = {styles.scrollTarget}>
                <Decarbonization scenarios = {currentScenarios} units = {units} update = {update} bau = {bau} setBAU = {setBAU} compare = {compare} setCompare = {setCompare}/></div>
              </div>)}
          </div>
        </div>
      </div>


        {initialPopup && (
          <div className={styles.overlay}>
            <div className={styles.popup}>
              <h2>Welcome to the Carbon Calculus Calculator!</h2>
              <p><br/>If this is your first time, we highly recommend viewing our tutorial and/or FAQs before beginning your calculations.</p>
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
                  setInitialPopup(false);
                }}>
                  Open Calculator
                </button>
                <button className = {styles.popupButton} onClick={() => {
                  if (!showAgain){
                    localStorage.setItem("startingPopup", false);
                  }
                  else {
                    localStorage.setItem("startingPopup", true);
                  }
                  setInitialPopup(false);
                  navigate('/FAQs');
                }}>
                  View Tutorial/FAQs
                </button>
              </div>
            </div>
          </div>
        )}
    </div> 
  );
};

export default NPV;