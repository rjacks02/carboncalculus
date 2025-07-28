import React, {useState, useEffect, useRef} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';

const SelectScenario = ({scenarios, compare, setCompare, bau, setBAU}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const dropdownRef = useRef();

  const toggleOptionBAU = (option) => {
    if (bau && bau.createdAt === option.createdAt){
      setBAU({})
    }
    else{
      setBAU(option);
    }
  };

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
    <div className={styles.multiSelectDropdown} ref={dropdownRef}>
      <div
        className={styles.multiSelectLabel}
        onClick={() => setIsOpen((prev) => !prev)}
      >
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
    <div className={styles.multiSelectDropdown} ref={dropdownRef}>
      <div
        className={styles.multiSelectLabel}
        onClick={() => setIsOpen((prev) => !prev)}
      >
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
  const [breakEven, setBreakEven] = useState(null);
  const [data, setData] = useState([]);
  const year = new Date().getFullYear();
  const [showInfo, setShowInfo] = useState(false);

  const [longterm, setLongterm] = useState(false);

  const [deff, setDeff] = useState(0);

    const colors =["#000000", "#E69F00", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"];

    useEffect(() => {
      let newData = [];

      if (compare && bau && bau?.npvTotalValues && compare[0]?.npvTotalValues){
        let bauVals = [...bau.npvTotalValues];

        for (let i = 0; i < compare.length; i++){
          let npvVals = [...compare[i].npvTotalValues];
          let diff = [];

          let maxIndex;

          if (longterm){
            maxIndex = Math.min(300, npvVals.length, bauVals.length);
          }
          else{
            maxIndex = parseInt(compare[i].totalYears)+parseInt(compare[i].delay)+1;
          }
          console.log(compare[i]);
          
          for (let j = 0; j < parseInt(compare[i].delay); j++){
            diff.push(0);
          }
          
          for (let j = parseInt(compare[i].delay); j < maxIndex; j++){
            const npvVal = parseFloat(npvVals[j]) || 0;
            const bauVal = parseFloat(bauVals[j]) || 0;
            const difference = -(npvVal - bauVal);
            diff.push(+difference.toFixed(10));
          }

          

          let current = {
              x: diff.map((_, k) => k+year),
                y: diff,
                type: 'line',
                mode: 'lines+markers',
                name: compare[i].name,
                marker: { color: colors[i%7] },
                hovertemplate: `${compare[i].name} </br>Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<extra></extra>`,
            }

          newData.push(current)
        }
        setData(newData);
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
        <h2 className = {styles.sectionTitle}><span className = {styles.info}><i class="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
                            </span> Visualizing Effective Decarbonization</h2>
        <SelectScenario scenarios = {scenarios} compare = {compare} setCompare = {setCompare} bau = {bau} setBAU = {setBAU} setDeff = {setDeff}/>
        
        <div className = {styles.visualSection}>
      
            <div> 
                            
          <Plot
        data={data}
        layout={{
          showlegend: true,
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
            text:`Effective Decarbonization (D<sub>Eff</sub>) from BAU ${bau.name ? "(" + bau.name + ")": ""}`,
            font: {
              family: 'Verdana, sans-serif',
              color: 'black',
              size: 22
            },
            xref: 'paper',
            xanchor: 'center'
          },
          margin: { t: 40, l: 60, r: 40, b: 30 },
            paper_bgcolor: '#aed9ea',
            plot_bgcolor: '#94c8dc',
            legend: {
              orientation: 'h',
              x: 0,
              y: -0.2,
              xanchor: 'left',
              yanchor: 'top'
            }
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