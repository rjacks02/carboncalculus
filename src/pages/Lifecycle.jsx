import React, {useState, useRef, useEffect} from "react"; //react imports
import { useNavigate, useLocation } from "react-router-dom"; //navigation imports

import styles from '../css/NPV.module.css' //styling imports

//component imports
import Calculator from '../components/Lifecycle/Calculator'
import Visuals from '../components/Lifecycle/Visuals'
import Header from '../components/Header'
import Comparison from '../components/Lifecycle/Comparison'
import Decarbonization from "../components/Lifecycle/Decarbonization";


const NPV = () => {
  //navigation variables
  let navigate = useNavigate();
  let location = useLocation();

  //base scenarios in kilograms, metric tons, pounds, short tons
  const baseScenario = {createdAt: Date.now(), 
    name: '', 
    upfrontCarbon: '3000.00', 
    systemLifespan: 20, 
    year0: 2025, 
    constructYr: 2028, 
    operationalYr: 2030, 
    operationCarbon: '1000.00', 
    endCarbon: '0.00', 
    units: 'Kilograms'};

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
  const [discountRate, setDiscountRate] = useState(3.16);
  const [npv, setNPV] = useState(0); //npv value
  const npvValuesRef = useRef({}); //yearly present values
  const npvTotalRef = useRef({}); //cumulative present values


  //initial popup
  const [initialPopup, setInitialPopup] = useState(((localStorage.getItem("startingPopup") === null || localStorage.getItem("startingPopup") === "true") && location.state));
  const [showAgain, setShowAgain] = useState(true); //"don't show this again" button on initial popup
  

  //different modes/settings
  const [units, setUnits] = useState('Kilograms') //units: kilograms or metric tons
  const [emissions, setEmissions] = useState(true); //set mode: emissions or reductions


  //comparing scenarios
  const [selected, setSelected] = useState([]); //selected scenarios for comparison graph
  const [bau, setBAU] = useState({}); //bau scenario for effective decarbonization graph
  const [compare, setCompare] = useState([]); //selected scenarios for effective decarbonization graph
  const [update, setUpdate] = useState(0); //update shared comparison and decarbonization graphs after values change

  
  //refs for scrolling with 'jump to'
  const calculatorRef = useRef(null);
  const comparisonRef = useRef(null);
  const decarbonizationRef = useRef(null);


  //when first rendered, open the previously open case study
  useEffect(() => {
    if ((currentScenarios.length === 0 && !caseStudy)){
      let currentCase = JSON.parse(localStorage.getItem('currentCaseLifecycle'));
      if (currentCase && localStorage.getItem('caseStudyLifecycle-'+currentCase.name)){
        openCaseStudy(currentCase.name);
        setCaseStudy(currentCase.name);
      }
      else{
        openCaseStudy('Default');
        setCaseStudy('Default');
        localStorage.setItem('currentCaseLifecycle', JSON.stringify({name: 'Default'}));
      }
    }
  }, [currentScenarios, caseStudy])

  //updates name + contents of a case study
  function updateCaseStudy(cur = currentScenarios, caseName = caseStudy, newUnits = units, newDiscountRate = discountRate) {
    if (caseName){
      let stored = JSON.parse(localStorage.getItem('caseStudyLifecycle-' + caseName));
      let timeStamps = [];
      for (let i = 0; i < cur.length; i++){
        if (cur[i].name){
          timeStamps.push(cur[i].createdAt);
        }
      }
      stored.scenarios = timeStamps;
      stored.units = newUnits;
      stored.discountRate = newDiscountRate;
      localStorage.setItem('caseStudyLifecycle-' + caseName, JSON.stringify(stored));
    }
  }

  //opens a case study and saves as current case
  function openCaseStudy(caseName = caseStudy){
    setCaseStudy(caseName);
    let currentCase = JSON.parse(localStorage.getItem('caseStudyLifecycle-' + caseName));
    let newUnits = currentCase?.units ? currentCase.units : 'Kilograms';
    let newDiscountRate = currentCase?.discountRate ? currentCase.discountRate : 3.16;

    if (!currentCase){
      localStorage.setItem('caseStudyLifecycle-'+caseName, JSON.stringify({openedAt: Date.now(), scenarios: Object.values([]), units: 'Kilograms', discountRate: 3.16}));
      currentCase = JSON.parse(localStorage.getItem('caseStudyLifecycle-' + caseName));
    }
    else{
      localStorage.setItem('caseStudyLifecycle-'+caseName, JSON.stringify({openedAt: Date.now(), scenarios: currentCase.scenarios, units: newUnits, discountRate: newDiscountRate}));
    }

    localStorage.setItem('currentCaseLifecycle', JSON.stringify({name: caseName}));
    let scenarios = currentCase.scenarios;
    setUnits(newUnits);
    setDiscountRate(newDiscountRate);

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
          upfrontCarbon: data.upfrontCarbon,
          systemLifespan: data.systemLifespan,
          year0: data.year0,
          constructYr: data.constructYr,
          operationalYr: data.operationalYr,
          operationCarbon: data.operationCarbon,
          endCarbon: data.endCarbon,
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

  //convert units from 'fromUnit' to 'toUnit'
  function convertUnits(fromUnit, toUnit){
    for (let i = 0; i < currentScenarios.length; i++){
        let scenario = currentScenarios[i];

        let upVal = parseFloat((parseFloat(scenario.upfrontCarbon) * conversionRates[fromUnit]).toFixed(5)) / conversionRates[toUnit]
        let upResult = parseFloat(upVal.toFixed(8))
  
        let opVal = parseFloat((parseFloat(scenario.operationCarbon) * conversionRates[fromUnit]).toFixed(5)) / conversionRates[toUnit]
        let opResult = parseFloat(opVal.toFixed(8))

        let endVal = parseFloat((parseFloat(scenario.endCarbon) * conversionRates[fromUnit]).toFixed(5)) / conversionRates[toUnit]
        let endResult = parseFloat(endVal.toFixed(8))

        const updated = {
          ...scenario,
          units: toUnit,
          upfrontCarbon: (upResult).toString(),
          operationCarbon: (opResult).toString(),
          endCarbon: (endResult).toString()
        }
  
        //fully update the scenario
        updateScenario(updated.name, updated.createdAt, updated.upfrontCarbon, updated.systemLifespan, updated.year0, updated.constructYr, updated.operationalYr, updated.operationCarbon, updated.endCarbon, i)
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

  //function to fully calculate npv
  function calculateNPV(year0, constructYr, operationalYr, systemLifespan, upfrontCarbon, operationCarbon, endCarbon, ind = index, dr = discountRate) {
    let delay = constructYr - year0;
    let conYears = operationalYr - constructYr;
    let opYears = systemLifespan;
    
    let annualCon = parseFloat(upfrontCarbon)/conYears;
    let annualOp = parseFloat(operationCarbon)/opYears;
    let annualEnd = parseFloat(endCarbon);

    let rate = parseFloat(dr);

    let npv = 0
    let newValue;
    npvValuesRef.current = {};
    npvTotalRef.current = {};

    //all values are 0 until delay ends
    for (let i = 0; i < delay; i++){
      npvValuesRef.current[i] = 0;
      npvTotalRef.current[i] = 0;
    }

    for (let i = 0; i < conYears; i++){
      newValue = annualCon/(1 + rate/100) ** (i+delay);
      npv += newValue;
      npvValuesRef.current[i+delay] = newValue;
      npvTotalRef.current[i+delay] = npv;
    }

    for (let i = 0; i < opYears; i++){
      newValue = annualOp/(1 + rate/100) ** (i+conYears+delay);
      npv += newValue;
      npvValuesRef.current[i+delay+conYears] = newValue;
      npvTotalRef.current[i+delay+conYears] = npv;
    }

    let endValue = annualEnd/(1 + rate/100) ** (opYears+conYears+delay);
    npv += endValue;
    npvValuesRef.current[opYears+conYears+delay] = endValue;
    npvTotalRef.current[opYears+conYears+delay] = npv;

    
    npv = parseFloat(npv.toFixed(2)) //2 decimal places
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
        upfrontCarbon: baseScenario.upfrontCarbon,
        systemLifespan: baseScenario.systemLifespan,
        year0: baseScenario.year0,
        constructYr: baseScenario.constructYr,
        operationalYr: baseScenario.operationalYr,
        operationCarbon: baseScenario.operationCarbon,
        endCarbon: baseScenario.endCarbon,
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
  function saveToStorage(scenarioName, date, upfrontCarbon, systemLifespan, year0, constructYr, operationalYr, operationCarbon, endCarbon){
    //calculate npv to save accurate values
    let curScenario = calculateNPV(year0, constructYr, operationalYr, systemLifespan, upfrontCarbon, operationCarbon, endCarbon);

    //items saved as "scenario-time" where time is millisecond of creating/saving
    if (scenarioName !== ""){
      localStorage.setItem("scenario-" + date, JSON.stringify({name: scenarioName, upfrontCarbon: upfrontCarbon, systemLifespan: systemLifespan, year0: year0, npvYearlyValues: curScenario.npvYearlyValues, npvTotalValues: curScenario.npvTotalValues, npv: curScenario.npv, constructYr: constructYr, operationalYr: operationalYr, operationCarbon: operationCarbon, endCarbon: endCarbon, units: units, createdAt: date}));
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
  function updateScenario(name, createdAt, upfrontCarbon, systemLifespan, year0, constructYr, operationalYr, operationCarbon, endCarbon, i = index, dr = discountRate) {
    let updatedScenario = calculateNPV(year0, constructYr, operationalYr, systemLifespan, upfrontCarbon, operationCarbon, endCarbon, i, dr);
    const fullScenario = {
      ...updatedScenario,
      name,
      upfrontCarbon,
      systemLifespan,
      year0,
      constructYr,
      operationalYr,
      operationCarbon, 
      endCarbon,
      units
    };
      
    setCurrentScenarios(prev => {
      const updated = [...prev];
      updated[i] = { ...fullScenario };
      saveToStorage(name, createdAt, upfrontCarbon, systemLifespan, year0, constructYr, operationalYr, operationCarbon, endCarbon);
      updateCaseStudy(updated, caseStudy, units, dr);
      return updated;
    });
  
    //update dependencies
    updateSelected(fullScenario);
    updateCompare(fullScenario);
    updateBAU(fullScenario);
  }

  function updateAllScenarios(dr){
    for (let i = 0; i < currentScenarios.length; i++){
      let s = currentScenarios[i];
      updateScenario(s.name, s.createdAt, s.upfrontCarbon, s.systemLifespan, s.year0, s.constructYr, s.operationalYr, s.operationCarbon, s.endCarbon, i, dr);
    }
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
                  <a onClick={() => scrollTo(comparisonRef)}>Comparison (NPV<sub>CO<sub>2</sub></sub>)</a>
                  <a onClick={() => scrollTo(decarbonizationRef)}>Decarbonization (D<sub>Eff</sub>)</a>
                </div>
              </div>
              <div className = {styles.mainRibbonButton} onClick = {() => {navigate('/CaseStudies')}}>
                View Case Studies
              </div>
              <div className = {styles.mainRibbonButton}>
                Discount Rate
                <div className={styles.ribbonContent}>
                <p>Discount Rate: {discountRate}</p>
                  <div className={styles.discountRate}>
                    <input
                      type="range"
                      min="1.4"
                      max="7.8"
                      value={discountRate}
                      step="0.01"
                      onChange={(e) => {setDiscountRate(e.target.value); updateAllScenarios(e.target.value)}}
                      style={{ width: "100%" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>1.4</span>
                      <span>7.8</span>
                    </div>
                    </div>
                  </div>
                </div>
              <div className = {styles.mainRibbonButton}>
                Switch Units
                <div className={styles.ribbonContent}>
                  <a onClick={() => {convertUnits(units, 'Kilograms')}}>Kilograms  {units === 'Kilograms' ? <i className='	fa fa-check'></i> : ''}</a>
                  <a onClick={() => {convertUnits(units, 'Metric Tons')}}>Metric Tons  {units === 'Metric Tons' ? <i className='	fa fa-check'></i> : ''}</a>
                  <a onClick={() => {convertUnits(units, 'Pounds')}}>Pounds  {units === 'Pounds' ? <i className='	fa fa-check'></i> : ''}</a>
                  <a onClick={() => {convertUnits(units, 'Short Tons')}}>Short Tons  {units === 'Short Tons' ? <i className='	fa fa-check'></i> : ''}</a>
                  <a onClick={() => {setEmissions(prev => !prev)}}>Mode: {!emissions ? "Reductions " : 'Emissions '}<i className='	fa fa-check'></i></a>
                </div>
              </div>
                <div className = {styles.mainRibbonButton}>
                Change Mode
                <div className={styles.ribbonContent}>
                  <a onClick={() => {navigate('/NPVCarbon')}}>Standard </a>
                  <a onClick={() => {}}>Lifecycle  <i className='	fa fa-check'></i></a>
                </div>
              </div>
            </div>
            {(currentScenarios?.length > 0) && (<div>
              <div className = {`${styles.horizontal} ${styles.scrollTarget}`} ref={calculatorRef}>
                <Calculator key={`${index}-${units}-${currentScenarios[index]?.createdAt}`} scenario = {currentScenarios[index]} updateScenario = {updateScenario} units = {units} caseStudy = {caseStudy}/>
                <Visuals scenarioData = {currentScenarios} index = {index} units = {units} delay = {parseInt(currentScenarios[index]?.delay)} emissions = {emissions}/>
              </div>
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