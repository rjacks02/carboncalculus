import React, {useState, useEffect} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';

const CompareTable = ({names, npvs, longTerms, units}) => {
    const [npvColors, setNPVColors] = useState([]);
    const [longColors, setLongColors] = useState([]);


    useEffect(() => {
        const numericNPVs = npvs
        .map(n => (n === '' ? null : parseFloat(n)))
        .filter(n => n !== null && !isNaN(n));
    
        const minNPV = Math.min(...numericNPVs);
        const maxNPV = Math.max(...numericNPVs);
        
        const newNPVColors = npvs.map(n => {
            const num = parseFloat(n);
            if (n === '' || isNaN(num)) return 'white';
            if (num === minNPV) return '#89E189';
            if (num === maxNPV) return '#D9544D';
            else return 'white';
        });
        
        setNPVColors(newNPVColors);


        const numericLongs = longTerms
        .map(n => (n === '' ? null : parseFloat(n)))
        .filter(n => n !== null && !isNaN(n));
    
        const minLong = Math.min(...numericLongs);
        const maxLong = Math.max(...numericLongs);
        
        const newLongColors = longTerms.map(n => {
            const num = parseFloat(n);
            if (n === '' || isNaN(num)) return 'white';
            if (num === minLong) return '#89E189';
            if (num === maxLong) return '#D9544D';
            else return 'white';
        });
        
        setLongColors(newLongColors);
    }, [names, npvs, longTerms, units])

    return (
        <div className = {styles.visualSection}>
            <h3 className = {styles.visualHeader}>
            NPV<sub>CO₂</sub> Comparison Table ({units})
        </h3>

          <Plot
      data={[
        {
          type: 'table',
          header: {
            values: [['<b>Scenario</b>'], [`<b>NPV<sub>CO<sub>2</sub></sub></b>`], [`<b>Long-Term NPV<sub>CO<sub>2</sub></sub></b>`]],
            align: 'center',
            line: { width: 1, color: 'black' },
            fill: { color: 'lightgrey' },
            font: { family: 'Arial', size: 16, color: 'black' }
          },
          cells: {
            values: [
              names,
              npvs,
              longTerms
            ],
            align: 'center',
            height: 30,
            line: { color: 'black', width: 1 },
            fill: { color: ['white', npvColors, longColors] },
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
    );
};

export default CompareTable;