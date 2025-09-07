import React, {useState, useEffect} from "react"; //react imports

import styles from '../../css/NPV.module.css' //styling imports

import Plot from 'react-plotly.js'; //plotting imports

const BarChart = ({name, vertical, vals, units, emissions}) => {
  const [values, setValues] = useState(vals); //x values (pvco2)
  const year = new Date().getFullYear(); //y values (years)

  //if reductions, make all values negative
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
      {values && (
        <Plot
          data={[
            {
              x: values.map((_, i) => i+year),
              y: values,
              type: 'bar',
              mode: 'lines+markers',
              hovertemplate: `Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<extra></extra>`,
              marker: { color: 'black' },
            },
          ]}
          layout={{
            title: {
              text: `${name}`,
              font: {
                family: 'Verdana, sans-serif',
                color: 'black',
                size: 22
              },
              xref: 'paper',
              x: 0.5,
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
              standoff: 40,
            },
          margin: { t: 40, l: 60, r: 40, b: 40 },
            paper_bgcolor: '#aed9ea',
            plot_bgcolor: '#94c8dc',
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
          config={{ responsive: true, displayModeBar: false }}
        />)}
          </div>
    );
};

export default BarChart;