import React, {useState, useEffect, useRef} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';

const SelectScenario = ({scenarios, compare, setCompare, setDeff}) => {
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef();


  const toggleOption = (option) => {
    if (compare.createdAt === option.createdAt){
      setCompare([])
      setDeff(0);
    }
    else{
      setCompare(option);
    }
  };

  return (
    <div className={styles.multiSelectDropdown} ref={dropdownRef}>
      <div
        className={styles.multiSelectLabel}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Select Scenario To Compare To BAU ▾
      </div>
      {isOpen && (
        <div className={styles.SelectContent}>
          {scenarios.map((option, ind) => (
            ind !== 0 && (<label className={styles.multiSelectItem} key={option.createdAt}>
              <input
                type="checkbox"
                checked={compare.createdAt === option.createdAt}
                onChange={() => toggleOption(option)}
              />
              {option.name}
            </label>)
          ))}
        </div>
      )}
    </div>
  );
};

const Decarbonization = ({bau, scenarios, units, update, compare, setCompare}) => {
  const [breakEven, setBreakEven] = useState(null);
  const [data, setData] = useState([]);
  const year = new Date().getFullYear();
  const [showInfo, setShowInfo] = useState(false);

  const [longterm, setLongterm] = useState(true);

  const [deff, setDeff] = useState(0);

    const colors =["#2e7c53", "#1e516a", "#e66157", "#f0db9a", "#264653", "#e07a5f", "#6a4c93", "#00b8d9", "#8a9a5b", "#a9a9a9"];

    useEffect(() => {
      let newData = [];

      if (compare && bau && compare.npvTotalValues && bau.npvTotalValues){
        let npvVals = [...compare.npvTotalValues];
        let bauVals = [...bau.npvTotalValues];
        let diff = [];

        let maxIndex;

        if (longterm){
          maxIndex = Math.min(300, npvVals.length, bauVals.length);
        }
        else{
          maxIndex = parseInt(compare.totalYears)+parseInt(compare.delay)+1;
        }

        
        for (let i = 0; i < compare.delay; i++){
          diff.push(0);
        }
        
        for (let i = compare.delay; i < maxIndex; i++){
          const npvVal = parseFloat(npvVals[i]) || 0;
          const bauVal = parseFloat(bauVals[i]) || 0;
          const difference = -(npvVal - bauVal);
          diff.push(+difference.toFixed(10));
        }

        setDeff(parseFloat(diff[maxIndex-1].toPrecision(3)).toFixed(2));

        let current = {
            x: diff.map((_, i) => i+year),
              y: diff,
              type: 'line',
              mode: 'lines+markers',
              marker: { color: colors[0] },
              hovertemplate: `Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<extra></extra>`,
          }
        setData([current]);
        findBreakeven(diff);
      }
    else{
      setData([]);
    }
  }, [compare, bau, units, update, longterm]);

 function findBreakeven(diff) {
    if (diff){
      let found = false;
      for (let i = 0; i < diff.length - 1; i++) {
          const y1 = diff[i];
          const y2 = diff[i + 1];
  
          if ((y1 < 0 && y2 > 0) || (y1 > 0 && y2 < 0)) {
              const x1 = i;
              const x2 = i + 1;
  
              let xZero = x1 + (0 - y1) * (x2 - x1) / (y2 - y1) + year;
              setBreakEven(xZero);
              found = true;
          }
      }
      if(!found){
          setBreakEven(null);
      }
    }
  }

  function handleToggle(){
    setLongterm(prev => !prev);
  }

    return (
      <div className = {styles.section}>
        <h2 className = {styles.sectionTitle}>Visualizing Effective Decarbonization</h2>
        <div className = {styles.deff}><span className = {styles.info}><i class="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
                            </span>D<sub>Eff</sub>: {deff} {units} Today</div>
        <SelectScenario scenarios = {scenarios} compare = {compare} setCompare = {setCompare} bau = {bau} setDeff = {setDeff}/>
        
        <div className = {styles.visualSection}>
      
            <div> 
                            
          <Plot
        data={data}
        layout={{
          xaxis: {
            title: {
              text: 'Year',
              font: {
                family: 'Verdana, sans-serif',
                size: 18,
                color: 'black'
              }
            }
          },
          yaxis: {
            title: {
              text: `${units} Reduced`,
              font: {
                family: 'Verdana, sans-serif',
                size: 18,
                color: 'black'
              },
              standoff: 40
            },
          },
          title: {
            text:`Effective Decarbonization (D<sub>Eff</sub>) from (BAU) ${bau.name} to ${compare.name || "_____"}`,
            font: {
              family: 'Verdana, sans-serif',
              color: 'black',
              size: 22
            },
            xref: 'paper',
            xanchor: 'center'
          },
          margin: { t: 60, l: 60, r: 40, b: 40 },
            paper_bgcolor: '#aed9ea',
            plot_bgcolor: '#94c8dc',
            annotations: breakEven !== null ? [
              {
                x: breakEven,
                y: 0,
                text: 'Breakeven at <br> Year ' + breakEven.toFixed(0),
                showarrow: true,
                arrowhead: 2,
                align: 'center',
                bgcolor: 'white',
                bordercolor: 'red',
                borderwidth: 1,
                borderpad: 4,
                opacity: 0.9,
                cliponaxis: false,
                font: { color: 'red' }
              }] : []
          }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        config={{ responsive: true }}
      /> </div>
      <div className = {styles.longterm}>
        <label>
            Include Long-Term Value:
            <input 
        type="checkbox" id = "longterm" checked={longterm} onChange={handleToggle} />
        </label>
    </div>
        </div>
        {showInfo && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                    <h2>D<sub>Eff</sub> (Effective Decarbonization)</h2>
                    <p>This represents the relative difference between a scenario’s emissions (emissions resulting from taking some sort of action) and BAU emissions (a continuation of today’s emissions, the “do nothing” case). This metric helps to answer the question, “how effective is this scenario compared to what is currently happening?”. While NPV<sub>CO<sub>2</sub></sub> is an absolute metric, this is a metric relative to BAU.</p>
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

export default Decarbonization;