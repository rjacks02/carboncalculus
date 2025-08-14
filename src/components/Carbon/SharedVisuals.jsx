import React, {useState, useEffect, useRef} from "react";
import styles from '../../css/NPV.module.css';

import CompareGraph from './CompareGraph';
import CompareTable from "./CompareTable";

const SelectScenarios = ({scenarios, selected, setSelected, update }) => {
    const [isOpen, setIsOpen] = useState(true);
    const dropdownRef = useRef();


    const toggleOption = (option) => {
      setSelected((prev) => {
        const exists = prev.some((o) => o.createdAt === option.createdAt);
        return exists
          ? prev.filter((o) => o.createdAt !== option.createdAt)
          : [...prev, option];
      });
    };
  
    return (
      <div className={styles.multiSelectDropdown} ref={dropdownRef}>
        <div
          className={styles.multiSelectLabel}
          onClick={() => setIsOpen((prev) => !prev)}
        >
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

const SharedVisuals = ({scenarioData, selected, setSelected, update, units, emissions}) => {

  const [data, setData] = useState([]);
  const [names, setNames] = useState(['', '', '', '', '']);
  const [npvs, setNPVs] = useState(['', '', '', '', '']);
  const [longTerms, setLongTerms] = useState(['', '', '', '', '']);
  const year = new Date().getFullYear();
  const [showInfo, setShowInfo] = useState(false);
  const [tableColors, setTableColors] = useState(['white', 'white', 'white', 'white', 'white']);

  const [longterm, setLongterm] = useState(false);

  const colors =["#000000", "#E69F00", "#009E73", "#F0E442", "#0072B2", "#CC79A7"];
  const pales = ["#D3D3D3", "#F4D7A8", "#BFEAD9", "#F9F4B0", "#BFDBEC", "#EFC3DC"];

  useEffect(() => {
    let npvsSorted = [];

    for (let i = 0; i < scenarioData.length; i++){
      if (scenarioData[i].npvTotalValues){
        npvsSorted.push([parseFloat(scenarioData[i]?.npvTotalValues.at(-1)), scenarioData[i].createdAt]);
      }
    }

    npvsSorted.sort((a, b) => b[0] - a[0]);

    let sortedColors = {};
    let curColor = 0;

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
      for (let i = 0; i < selected.length; i++){
        if (selected[i].npvTotalValues){
          let shortY, longY;

          longY = emissions ? (selected[i].npvTotalValues) : (selected[i].npvTotalValues.map(i => -i));
          newLongTerms.push(longY.at(-1).toFixed(2));

          shortY = emissions ? (selected[i].npvTotalValues.slice(0, parseInt(selected[i].totalYears)+parseInt(selected[i].delay)+1)) : (selected[i].npvTotalValues.slice(0, parseInt(selected[i].totalYears)+parseInt(selected[i].delay)+1).map(i => -i));
          newNPVs.push(shortY.at(-1).toFixed(2));

          let current = {
            x: selected[i].npvTotalValues.map((_, i) => i+year).slice(0, longterm ? longY.length : shortY.length),
              y: longterm ? longY : shortY,
              type: 'line',
              mode: 'lines+markers',
              marker: { color: sortedColors[selected[i].createdAt][0] },
              name: selected[i].name,
              hovertemplate: `${selected[i].name}<br> Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<extra></extra>`,
              hoverlabel: {
                  align: 'left'
                }
          }
          newData.push(current);
          newNames.push(selected[i].name);
          newColors.push(sortedColors[selected[i].createdAt][1]);
        }
      }
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


function handleToggle(){
  setLongterm(prev => !prev);
}
    
    return (
        <div className = {styles.section}>
            <h2 className = {styles.sectionTitle} ><span className = {styles.info}><i className="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
                            </span>Visualizing Net Present Value of CO<sub>2</sub></h2>
            <SelectScenarios scenarios = {scenarioData} selected = {selected} setSelected = {setSelected}/>
            <div className = {styles.compareCols}>
              <CompareGraph data ={data} handleToggle = {handleToggle} longterm = {longterm} units = {units} emissions = {emissions}/>
              <CompareTable names = {names} npvs = {npvs} longTerms = {longTerms} colors = {tableColors} units = {units}/>
            </div>
            {showInfo && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                    <h2>NPV<sub>CO<sub>2</sub></sub></h2>
                    <p>This is the cumulative net discounted CO2 emitted into the atmosphere per your scenario, valued from the perspective of emissions today. For example, at a 3.355% annual discount rate, 1 ton of CO2 emitted annually, indefinitely, has a net present value (NPV_CO_2) of 30.8 tons of CO2 emitted only once, today. The term “value” here is a proxy for “impact,” as quantity emitted, when those emissions occur, and the rate at which those emissions dissipate all contribute to the impact that CO2 in the atmosphere has on global radiative forcing (the greenhouse effect, global average temperature increase).</p>
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

export default SharedVisuals;