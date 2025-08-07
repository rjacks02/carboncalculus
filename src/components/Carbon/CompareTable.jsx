import React, {useState, useEffect} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';

const CompareTable = ({names, npvs, longTerms, colors, units}) => {

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
            fill: { color: '#94c8dc' },
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
            fill: { color: [colors, colors, colors] },
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