import React, {useState, useEffect} from "react"; //react imports

import styles from '../../css/NPV.module.css' //styling imports

import { useNavigate } from "react-router-dom"; //navigation imports

//component imports
import DecarbGraph from './DecarbGraph';
import DecarbTable from "./DecarbTable";

import info from './info.json' //more info about terms

//dropdown component for selecting scenarios
const SelectScenario = ({scenarios, compare, setCompare, bau, setBAU}) => {
  const [isOpen, setIsOpen] = useState(true); //if dropdowns are open

  //toggle option for BAU, only one selected at a time
  const toggleOptionBAU = (option) => {
    if (bau && bau.createdAt === option.createdAt){
      setBAU({})
    }
    else{
      setBAU(option);
    }
  };

  //toggles option, if already selected then unselect
  const toggleOptionCompare = (option) => {
    setCompare((prev) => {
      const exists = prev.some((o) => o.createdAt === option.createdAt);
      return exists
        ? prev.filter((o) => o.createdAt !== option.createdAt)
        : [...prev, option];
    });
  };

  return (
    <div className = {styles.cols2}>
      <div className={styles.multiSelectDropdown}>
        <div className={styles.multiSelectLabel} onClick={() => setIsOpen((prev) => !prev)}>
          Select BAU Scenario ▾
        </div>
      
        {isOpen && (
          <div className={styles.SelectContent}>
            {scenarios.map((option, ind) => (
              <label className={styles.multiSelectItem} key={option.createdAt}>
                <input
                  type="checkbox"
                  checked={bau && bau.createdAt === option.createdAt}
                  onChange={() => toggleOptionBAU(option)}
                />
                {option.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className={styles.multiSelectDropdown}>
        <div className={styles.multiSelectLabel} onClick={() => setIsOpen((prev) => !prev)}>
          Select Comparison Scenarios ▾
        </div>
        
        {isOpen && (
          <div className={styles.SelectContent}>
            {scenarios.map((option, ind) => (
              <label className={styles.multiSelectItem} key={option.createdAt}>
                <input
                  type="checkbox"
                  checked={compare.some(sel => sel.createdAt === option.createdAt)}
                  onChange={() => toggleOptionCompare(option)}
                />
                {option.name}
              </label>
            ))}
          </div>
        )}

      </div>
    </div>

  );
};

const Decarbonization = ({scenarios, units, update, bau, setBAU, compare, setCompare}) => {
  let navigate = useNavigate(); //navigation
  
  const [data, setData] = useState([]); //main data with colors
  const [names, setNames] = useState(['', '', '', '', '']); //names of selected scenarios
  const [deffs, setDeffs] = useState(['', '', '', '', '']); //deffs based on total years
  const [longs, setLongs] = useState(['', '', '', '', '']); //deffs based on long-term values
  const [breakEvens, setBreakEvens] = useState(['', '', '', '', '']); //breakevens of selected
  const [IRRs, setIRRs] = useState(['', '', '', '', '']); //irrs of selected
  const [tableColors, setTableColors] = useState(['white', 'white', 'white', 'white', 'white']); //ordered colors for table

  const year = new Date().getFullYear(); //current year
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; //months

  const [longterm, setLongterm] = useState(false); //if longterm on graph

  const colors =["#000000", "#E69F00", "#009E73", "#F0E442", "#0072B2", "#CC79A7"]; //colors for graph
  const pales = ["#D3D3D3", "#F4D7A8", "#BFEAD9", "#F9F4B0", "#BFDBEC", "#EFC3DC"]; //colors for table

  const [showInfo, setShowInfo] = useState(false); //show info popup



  //calculate values for graph/table
  useEffect(() => {
    if (compare && bau && bau?.npvYearlyValues && compare[0]?.npvYearlyValues){
      let bauVals = [...bau.npvYearlyValues];

      let deffsSorted = [];

      for (let i = 0; i < scenarios.length; i++){
        let npvVals = [...scenarios[i].npvYearlyValues];
        let diff = [];
        let curr = 0
        

        let longIndex = Math.min(101, npvVals.length, bauVals.length);

        for (let j = 0; j < parseInt(scenarios[i].delay); j++){
          diff.push(0);
        }

        
        for (let j = parseInt(scenarios[i].delay); j < longIndex; j++){
          const npvVal = parseFloat(npvVals[j]) || 0;
          const bauVal = parseFloat(bauVals[j]) || 0;
          const difference = bauVal - npvVal + curr;
          curr = difference
          diff.push(+difference.toFixed(10));
        }
        deffsSorted.push([parseFloat(diff.at(-1)), scenarios[i].createdAt]);

      }
      deffsSorted.sort((a, b) => b[0] - a[0]); //sort deffs by long term
    
      let sortedColors = {};
      let curColor = 0;
    
      //set colors based on sorted values
      for (let i = 0; i < deffsSorted.length; i++){
        sortedColors[deffsSorted[i][1]] = [colors[curColor%6], pales[curColor%6]];
        curColor++;
      }

      let newData = [];
      let newNames = [];
      let newDeffs = []
      let newLongs = [];        
      let newBreakEvens = [];
      let newIRRs = [];
      let newColors = [];
      let curBreak;

      const orderMap = new Map(deffsSorted.map(([x, key], index) => [key, index]));

      const reordered = [...compare].sort(
        (a, b) => orderMap.get(a.createdAt) - orderMap.get(b.createdAt)
      );

      for (let i = 0; i < reordered.length; i++){
        let npvVals = [...reordered[i].npvYearlyValues];
        let diff = [];
        let curr = 0;

        let longIndex = Math.min(101, npvVals.length, bauVals.length);

        let shortIndex = parseInt(reordered[i].totalYears)+parseInt(reordered[i].delay)+1;
          
        for (let j = 0; j < parseInt(reordered[i].delay); j++){
          diff.push(0);
        }
          
        for (let j = parseInt(reordered[i].delay); j < longIndex; j++){
          const npvVal = parseFloat(npvVals[j]) || 0;
          const bauVal = parseFloat(bauVals[j]) || 0;
          const difference = bauVal - npvVal + curr;
          curr = difference;
          diff.push(+difference.toFixed(10));
        }
          
        let fullBreak = findBreakeven(diff);

        if (fullBreak !== 'N/A'){
          curBreak = (fullBreak - year).toFixed(2);
          let monthVal = fullBreak - Math.floor(fullBreak);
          let monthInd = Math.floor(monthVal * 12);
          let yearVal = parseInt(fullBreak)
          fullBreak = months[monthInd] + ' ' + yearVal;
        }
        else{
          curBreak = 'N/A';
        }

        //x value for graph
        let current = {
          x: longterm ? diff.map((_, k) => k+year) : diff.slice(0, shortIndex).map((_, k) => k+year),
          y: longterm ? diff : diff.slice(0, shortIndex),
          type: 'line',
          mode: 'lines+markers',
          name: reordered[i].name,
          marker: { color: sortedColors[reordered[i].createdAt][0] },
          hovertemplate: `${reordered[i].name} </br>Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<br>Breakeven: ${fullBreak}<extra></extra>`,
        }

        newData.push(current);
        newNames.push(reordered[i].name);
        newDeffs.push(diff.slice(0, shortIndex).at(-1).toFixed(2));
        newLongs.push(diff.at(-1).toFixed(2));
        newColors.push(sortedColors[reordered[i].createdAt][1]);
        newBreakEvens.push(curBreak);

        if (curBreak === 'N/A' || parseFloat(curBreak) === 0 ){
          newIRRs.push('N/A');
        }
        else{
          newIRRs.push(IRR(reordered[i], bau, longIndex-1));
        }
      }
      setData(newData);
      setNames([...newNames, ...Array(Math.max(0, 5 - newNames.length)).fill('')]);
      setDeffs([...newDeffs, ...Array(Math.max(0, 5 - newDeffs.length)).fill('')]);
      setLongs([...newLongs, ...Array(Math.max(0, 5 - newLongs.length)).fill('')]);
      setBreakEvens([...newBreakEvens, ...Array(Math.max(0, 5 - newBreakEvens.length)).fill('')]);
      setIRRs([...newIRRs, ...Array(Math.max(0, 5 - newIRRs.length)).fill('')]);
      setTableColors([...newColors,...Array(Math.max(0, 5 - newColors.length)).fill('white')]);
    }
    else{
      setData([]);
      setNames(['', '', '', '', '']);
      setDeffs(['', '', '', '', '']);
      setLongs(['', '', '', '', '']);
      setBreakEvens(['', '', '', '', '']);
      setIRRs(['', '', '', '', '']);
      setTableColors(['white', 'white', 'white', 'white', 'white']);
    }
  }, [compare, bau, units, update, longterm]);

  //finds breakeven
  function findBreakeven(diff) {
    if (diff){
      if (Math.min(...diff) >= 0){ //if always positive, set breakeven to be 0
        let xZero = year;
        return xZero.toFixed(2);
      }

      let found = false;
      let lastFound; //to get most recent breakeven

      for (let i = 0; i < diff.length - 1; i++) {
          const y1 = diff[i];
          const y2 = diff[i + 1];
  
          if ((y1 < 0 && y2 > 0)) {
              const x1 = i;
              const x2 = i + 1;
  
              let xZero = x1 + (0 - y1) * (x2 - x1) / (y2 - y1) + year;
              lastFound = xZero;
              found = true;
          }
      }

      if(!found){ //no breakeven
          return 'N/A';
      }
      else{
        return lastFound;
      }
    }
    return 'N/A'
  }

  //finds IRR
  function IRR(c, b, ind) {
    let min = 0.0;
    let max = 999.0;
    let guess = 0;
    let NPV = 0;
    let epsilon = 0.000001;
    let maxIterations = 1000;
    let iter = 0;

    let up = -(parseFloat(c.upfrontEmissions)-parseFloat(b.upfrontEmissions));
    let vals = [+up];

    for (let i = 0; i < ind; i++){
      let difference = -(parseFloat(c.yearlyValuesRef.current[i]) - parseFloat(b.yearlyValuesRef.current[i]));
      vals.push(+difference);
    }
  
    while (iter < maxIterations) {
      guess = (min + max) / 2;
      NPV = 0;
  
      for (let i = 0; i < vals.length; i++) {
        NPV += vals[i] / Math.pow(1 + guess, i);
      }
  
      if (Math.abs(NPV) < epsilon) {
        return (guess * 100).toFixed(2) + '%';
      }
  
      if (NPV > 0) {
        min = guess;
      } else {
        max = guess;
      }
  
      iter++;
    }

    return 'N/A';
  }

  //toggle long term
  function handleToggle(){
    setLongterm(prev => !prev);
  }

  return (
    <div className = {styles.section}>
      <h2 className = {styles.sectionTitle}>
        <span className = {styles.info}>
          <i className="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
        </span>
        Visualizing Effective Decarbonization
      </h2>
      
      <SelectScenario scenarios = {scenarios} compare = {compare} setCompare = {setCompare} bau = {bau} setBAU = {setBAU}/>
        
      <div className = {styles.compareCols}>
        <DecarbGraph data = {data} handleToggle = {handleToggle} longterm = {longterm} units = {units} bau = {bau}/>
        <DecarbTable names = {names} deffs = {deffs} longs = {longs} breakEvens = {breakEvens} IRRs = {IRRs} tableColors = {tableColors} units = {units} />
      </div>

      {showInfo && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <h2>D<sub>Eff</sub> (Effective Decarbonization)</h2>
            <p>{info["D<sub>Eff</sub> (Effective Decarbonization)"]}</p>
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

export default Decarbonization;