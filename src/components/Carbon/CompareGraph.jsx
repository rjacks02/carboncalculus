import React, {useState, useEffect} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';

const CompareGraph = ({data, handleToggle, longterm, units, emissions}) => {

    return (
        <div className = {styles.visualSection}>
          <div >
            <Plot
        data={data}
        layout={{
          showlegend: true,
          title: {
            text: `Comparitive Cumulative NPV<sub>CO<sub>2</sub></sub>`,
            font: {
              family: 'Verdana, sans-serif',
              color: 'black',
              size: 24
            },
            xref: 'paper',
            xanchor: 'center'
          },
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
              text:  `${units} ${emissions ? 'Emitted' : 'Reduced'}`,
              font: {
                family: 'Verdana, sans-serif',
                size: 18,
                color: 'black'
              },
            },
            standoff: 40
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
        config={{ responsive: true}}
      /></div><div className = {styles.longterm}>
      <label>
          Long-Term Value:
          <input 
      type="checkbox" id = "longterm" checked={longterm} onChange={handleToggle} />
      </label>

  </div>

        </div>
    );
};

export default CompareGraph;