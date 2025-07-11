import React, {useState, useEffect} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';



const Graph = ({name, vertical, vals, units, emissions}) => {
    const [values, setValues] = useState(vals);
    const year = new Date().getFullYear();

    useEffect(() => {
      if (!emissions){
        setValues(vals.map(i => -i));
      }
      else{
        setValues(vals);
      }
    }, [vals, emissions])

    return (
        <div className={`${styles.visualSection} ${vertical === false ? styles.visualSectionHorizontal : ''}`}>
            {values && (<Plot
        data={[
          {
            x: values.map((_, i) => i+year),
            y: values,
            type: 'line',
            mode: 'lines+markers',
            hovertemplate: `Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<extra></extra>`,
            marker: { color: 'black' },
          },
        ]}
        layout={{
          title: {
            text:`${name}: Cumulative NPV<sub>CO<sub>2</sub></sub>`,
            font: {
              family: 'Verdana, sans-serif',
              color: 'black',
              size: 22
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
            },
          },
          yaxis: {
            title: {
              text: `${units} ${emissions ? 'Emitted' : 'Reduced'}`,
              font: {
                family: 'Verdana, sans-serif',
                size: 18,
                color: 'black'
              },
            },
            standoff: 10
          },
          margin: { t: 50, l: 60, r: 40, b: 40 },
          paper_bgcolor: '#aed9ea',
          plot_bgcolor: '#94c8dc',
          autosize: true,
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        config={{ responsive: true }}
      />)}
        </div>
    );
};

export default Graph;