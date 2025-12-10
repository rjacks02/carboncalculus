import React from "react"; //react imports

import styles from '../../css/NPV.module.css' //styling imports

import Plot from 'react-plotly.js'; //plotly imports

const DecarbTable = ({names, deffs, breakEvens, IRRs, tableColors, units}) => {
  
  return (
    <div className = {styles.visualSection}>
      <h3 className = {styles.visualHeader}>
        D<sub>Eff</sub> Comparison Table ({units})
      </h3>

      <Plot
        data={[{
          type: 'table',
          columnwidth: [90, 60, 100, 70, 60],
          header: {
            values: [['<b>Scenario</b>'], [`<b>D<sub>Eff</sub></b>`], [`<b>Breakeven</b>`], [`<b>IRR</b>`]],
            align: 'center',
            line: { width: 1, color: 'black' },
            fill: { color: '#94c8dc' },
            font: { family: 'Arial', size: 15, color: 'black' }
          },
          cells: {
            values: [
              names,
              deffs,
              breakEvens,
              IRRs
            ],
            align: 'center',
            height: 30,
            line: { color: 'black', width: 1 },
            fill: { color: [tableColors, tableColors, tableColors] },
            font: { family: 'Arial', size: 14, color: 'black' }
          }
        }]}
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

export default DecarbTable;