import React, {useState, useEffect} from "react"; //react imports

import styles from '../../css/NPV.module.css'; //styling imports

//component imports
import CompareGraph from './CompareGraph';
import CompareTable from "./CompareTable";

import info from './info.json' //more info about terms

//dropdown component for selecting scenarios
const SelectScenarios = ({scenarios, selected, setSelected}) => {
  const [isOpen, setIsOpen] = useState(true); //if dropdown is open

  //toggles option, if already selected then unselect
  const toggleOption = (option) => {
    setSelected((prev) => {
      const exists = prev.some((o) => o.createdAt === option.createdAt);
      return exists
        ? prev.filter((o) => o.createdAt !== option.createdAt)
        : [...prev, option];
    });
  };
  
  return (
    <div className={styles.multiSelectDropdown}>
      <div className={styles.multiSelectLabel} onClick={() => setIsOpen((prev) => !prev)}>
        Select Scenarios To Compare ▾
      </div>
        
      {isOpen && (
        <div className={styles.SelectContent}>
          {scenarios.map((option, ind) => (
            <label className={styles.multiSelectItem} key={option.createdAt}>
              <input
                type="checkbox"
                checked={selected.some(sel => sel.createdAt === option.createdAt)}
                onChange={() => toggleOption(option)}
              />
              {option.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

//main component with graph and table
const Comparison = ({scenarioData, selected, setSelected, update, units, emissions}) => {
  const [data, setData] = useState([]); //main data values with colors
  const [names, setNames] = useState(['', '', '', '', '']); //names of selected scenarios
  const [npvs, setNPVs] = useState(['', '', '', '', '']); //npvs based on total years
  const [longTerms, setLongTerms] = useState(['', '', '', '', '']); //npvs based on long-term values
  const [tableColors, setTableColors] = useState(['white', 'white', 'white', 'white', 'white']); //ordered colors for table
  const year = new Date().getFullYear(); //current year

  const [longterm, setLongterm] = useState(false); //if longterm on graph

  const colors =["#000000", "#E69F00", "#009E73", "#F0E442", "#0072B2", "#CC79A7"]; //colors for graph
  const pales = ["#D3D3D3", "#F4D7A8", "#BFEAD9", "#F9F4B0", "#BFDBEC", "#EFC3DC"]; //colors for table

  const [showInfo, setShowInfo] = useState(false); //show info popup

    

  //calculate values for graph/table
  useEffect(() => {
    let npvsSorted = [];

    for (let i = 0; i < scenarioData.length; i++){
      if (scenarioData[i].npvTotalValues){
        npvsSorted.push([parseFloat(scenarioData[i]?.npvTotalValues.at(-1)), scenarioData[i].createdAt]);
      }
    }

    npvsSorted.sort((a, b) => b[0] - a[0]); //sort npv values by longterm
    
    let sortedColors = {};
    let curColor = 0;

    //set colors based on sorted values
    for (let i = 0; i < npvsSorted.length; i++){
      sortedColors[npvsSorted[i][1]] = [colors[curColor%6], pales[curColor%6]];
      curColor++;
    }

    let newData = [];
    let newNames = [];
    let newNPVs = [];
    let newLongTerms = [];
    let newColors = [];

    if (selected){
      const orderMap = new Map(npvsSorted.map(([x, key], index) => [key, index]));

      const reordered = [...selected].sort(
        (a, b) => orderMap.get(a.createdAt) - orderMap.get(b.createdAt)
      );

      for (let i = 0; i < reordered.length; i++){
        if (reordered[i].npvTotalValues){
          let shortY, longY;

          longY = emissions ? (reordered[i].npvTotalValues) : (reordered[i].npvTotalValues.map(i => -i));
          newLongTerms.push(longY.at(-1).toFixed(2));

          shortY = emissions ? (reordered[i].npvTotalValues.slice(0, parseInt(reordered[i].totalYears)+parseInt(reordered[i].delay)+1)) : (reordered[i].npvTotalValues.slice(0, parseInt(reordered[i].totalYears)+parseInt(reordered[i].delay)+1).map(i => -i));
          newNPVs.push(shortY.at(-1).toFixed(2));

          //x value for graph
          let current = {
            x: reordered[i].npvTotalValues.map((_, i) => i+year).slice(0, longterm ? longY.length : shortY.length),
            y: longterm ? longY : shortY,
            type: 'line',
            mode: 'lines+markers',
            marker: { color: sortedColors[reordered[i].createdAt][0] },
            name: reordered[i].name,
            hovertemplate: `${reordered[i].name}<br> Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<extra></extra>`,
            hoverlabel: {
              align: 'left'
            }
          }
          newData.push(current);
          newNames.push(reordered[i].name);
          newColors.push(sortedColors[reordered[i].createdAt][1]);
        }
      }
      //if less than 5 scenarios, fill table with empty white rows
      setData(newData);
      setNames([...newNames, ...Array(Math.max(0, 5 - newNames.length)).fill('')]);
      setNPVs([...newNPVs, ...Array(Math.max(0, 5 - newNPVs.length)).fill('')]);
      setLongTerms([...newLongTerms, ...Array(Math.max(0, 5 - newLongTerms.length)).fill('')]);
      setTableColors([...newColors,...Array(Math.max(0, 5 - newColors.length)).fill('white')]);
    }
  else{
    setData([]);
    setNames(['', '', '', '', '']);
    setNPVs(['', '', '', '', '']);
    setLongTerms(['', '', '', '', '']);
    setTableColors(['white', 'white', 'white', 'white', 'white']);
  }
}, [scenarioData, selected, update, emissions, units, longterm]);

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
        Visualizing Net Present Value of CO<sub>2</sub>
      </h2>
      
      <SelectScenarios scenarios = {scenarioData} selected = {selected} setSelected = {setSelected}/>
      
      <div className = {styles.compareCols}>
        <CompareGraph data ={data} handleToggle = {handleToggle} longterm = {longterm} units = {units} emissions = {emissions}/>
        <CompareTable names = {names} npvs = {npvs} longTerms = {longTerms} colors = {tableColors} units = {units}/>
      </div>
      
      {showInfo && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <h2>NPV<sub>CO<sub>2</sub></sub></h2>
            <p>{info[`NPV<sub>CO2</sub>`]}</p>
            <div className = {styles.popup2Container}> 
              <button className = {styles.popupButton} onClick={() => {setShowInfo(false);}}>Close</button>
              <button className = {styles.popupButton} onClick={() => {setShowInfo(false);}}>Read More</button>
            </div>
          </div>
        </div>
      )}

    </div>    
  );
};

export default Comparison;