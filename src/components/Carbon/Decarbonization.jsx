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
  const [data, setData] = useState([]);
  const year = new Date().getFullYear();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [showInfo, setShowInfo] = useState(false);

  const [names, setNames] = useState(['', '', '', '', '']);
  const [deffs, setDeffs] = useState(['', '', '', '', '']);
  const [longs, setLongs] = useState(['', '', '', '', '']);
  const [breakEvens, setBreakEvens] = useState(['', '', '', '', '']);
  const [IRRs, setIRRs] = useState(['', '', '', '', '']);

  const [longterm, setLongterm] = useState(false);

  const [deff, setDeff] = useState(0);

    const colors =["#000000", "#E69F00", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"];

    useEffect(() => {
      let newData = [];
      let newNames = [];
      let newDeffs = []
      let newLongs = [];
      let newBreakEvens = [];
      let newIRRs = [];
      let curBreak;

      if (compare && bau && bau?.npvTotalValues && compare[0]?.npvTotalValues){
        let bauVals = [...bau.npvTotalValues];

        for (let i = 0; i < compare.length; i++){
          let npvVals = [...compare[i].npvTotalValues];
          let diff = [];

          let longIndex = Math.min(101, npvVals.length, bauVals.length);

          let shortIndex = parseInt(compare[i].totalYears)+parseInt(compare[i].delay)+1;
          
          for (let j = 0; j < parseInt(compare[i].delay); j++){
            diff.push(0);
          }
          
          for (let j = parseInt(compare[i].delay); j < longIndex; j++){
            const npvVal = parseFloat(npvVals[j]) || 0;
            const bauVal = parseFloat(bauVals[j]) || 0;
            const difference = -(npvVal - bauVal);
            diff.push(+difference.toFixed(10));
          }
          
          let fullBreak = findBreakeven(diff);

          if (fullBreak !== 'N/A'){
            console.log(fullBreak);
            curBreak = (fullBreak - year).toFixed(2);
            let monthVal = fullBreak - Math.floor(fullBreak);
            let monthInd = Math.floor(monthVal * 12);
            let yearVal = parseInt(fullBreak)
            fullBreak = months[monthInd] + ' ' + yearVal;
          }
          else{
            curBreak = 'N/A';
          }

          let current = {
              x: longterm ? diff.map((_, k) => k+year) : diff.slice(0, shortIndex).map((_, k) => k+year),
                y: longterm ? diff : diff.slice(0, shortIndex),
                type: 'line',
                mode: 'lines+markers',
                name: compare[i].name,
                marker: { color: colors[i%7] },
                hovertemplate: `${compare[i].name} </br>Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<br>Breakeven: ${fullBreak}<extra></extra>`,
            }

          newData.push(current);
          newNames.push(compare[i].name);
          newDeffs.push(diff.slice(0, shortIndex).at(-1).toFixed(2));
          newLongs.push(diff.at(-1).toFixed(2));

          newBreakEvens.push(curBreak);
          if (curBreak === 'N/A' || parseFloat(curBreak) === 0 ){
            newIRRs.push('N/A');
          }
          else{
            newIRRs.push(IRR(compare[i], bau, shortIndex-1));
          }
        }
        setData(newData);
        setNames([...newNames, ...Array(Math.max(0, 5 - newNames.length)).fill('')]);
        setDeffs([...newDeffs, ...Array(Math.max(0, 5 - newDeffs.length)).fill('')]);
        setLongs([...newLongs, ...Array(Math.max(0, 5 - newLongs.length)).fill('')]);
        setBreakEvens([...newBreakEvens, ...Array(Math.max(0, 5 - newBreakEvens.length)).fill('')]);
        setIRRs([...newIRRs, ...Array(Math.max(0, 5 - newIRRs.length)).fill('')]);
      }
    else{
      setData([]);
      setNames(['', '', '', '', '']);
      setDeffs(['', '', '', '', '']);
      setLongs(['', '', '', '', '']);
      setBreakEvens(['', '', '', '', '']);
      setIRRs(['', '', '', '', '']);
    }
  }, [compare, bau, units, update, longterm]);

 function findBreakeven(diff) {
    if (diff){
      if (Math.min(...diff) >= 0){
        let xZero = year;
        return xZero.toFixed(2);
      }
      let found = false;
      let lastFound;
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
      if(!found){
          return 'N/A';
      }
      else{
        return lastFound;
      }
    }
    return 'N/A'
  }

  function IRR(c, b, ind) {
    let min = 0.0;
    let max = 1.0;
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


  function handleToggle(){
    setLongterm(prev => !prev);
  }

    return (
      <div className = {styles.section}>
        <h2 className = {styles.sectionTitle}><span className = {styles.info}><i class="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i>
                            </span> Visualizing Effective Decarbonization</h2>
        <SelectScenario scenarios = {scenarios} compare = {compare} setCompare = {setCompare} bau = {bau} setBAU = {setBAU} setDeff = {setDeff}/>
        
        <div className = {styles.compareCols}>
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
          paper_bgcolor: 'transparent',
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
            Long-Term Value:
            <input 
        type="checkbox" id = "longterm" checked={longterm} onChange={handleToggle} />
        </label>
    </div>
        </div>
        <div className = {styles.visualSection}>
            <h3 className = {styles.visualHeader}>
            D<sub>Eff</sub> Comparison Table ({units})
        </h3>

          <Plot
      data={[
        {
          type: 'table',
          columnwidth: [90, 60, 100, 70, 60],
          header: {
            values: [['<b>Scenario</b>'], [`<b>D<sub>Eff</sub></b>`], [`<b>Long-Term D<sub>Eff</sub></b>`], [`<b>Breakeven</b>`], [`<b>IRR</b>`]],
            align: 'center',
            line: { width: 1, color: 'black' },
            fill: { color: 'lightgrey' },
            font: { family: 'Arial', size: 15, color: 'black' }
          },
          cells: {
            values: [
              names,
              deffs,
              longs,
              breakEvens,
              IRRs
            ],
            align: 'center',
            height: 30,
            line: { color: 'black', width: 1 },
            fill: { color: ['white', 'white', 'white'] },
            font: { family: 'Arial', size: 14, color: 'black' }
          }
        }
      ]}
      layout={{
        margin: { t: 10, b: 10, r: 10, l: 10 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
      }}
      config={{
        responsive: true,
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />

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