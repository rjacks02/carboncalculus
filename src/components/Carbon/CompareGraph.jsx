import React, {useState, useEffect} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';

const CompareGraph = ({scenarios, update, units, emissions}) => {
    const [data, setData] = useState([]);
    const year = new Date().getFullYear();

    const [longterm, setLongterm] = useState(false);

    const colors =["#000000", "#E69F00", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"];

    useEffect(() => {
      let newData = [];
      if (scenarios){
        for (let i = 0; i < scenarios.length; i++){
          if (scenarios[i].npvTotalValues){
            let setY;
            if (longterm){
              setY = emissions ? (scenarios[i].npvTotalValues) : (scenarios[i].npvTotalValues.map(i => -i));
            }
            else{
              setY = emissions ? (scenarios[i].npvTotalValues.slice(0, parseInt(scenarios[i].totalYears)+parseInt(scenarios[i].delay)+1)) : (scenarios[i].npvTotalValues.slice(0, parseInt(scenarios[i].totalYears)+parseInt(scenarios[i].delay)+1).map(i => -i));
            }
            let current = {
              x: scenarios[i].npvTotalValues.map((_, i) => i+year).slice(0, setY.length),
                y: setY,
                type: 'line',
                mode: 'lines+markers',
                marker: { color: colors[i % 10] },
                name: scenarios[i].name,
                hovertemplate: `${scenarios[i].name}<br> Year: %{x}<br>${units} of CO<sub>2</sub>: %{y}<extra></extra>`,
                hoverlabel: {
                    align: 'left'
                  }
            }
            newData.push(current);
          }
        }
        setData(newData);
      }
    else{
      setData([]);
    }
  }, [scenarios, update, emissions, units, longterm]);


  function handleToggle(){
    setLongterm(prev => !prev);
  }

    return (
        <div className = {styles.visualSection}>
          <div>
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
        config={{ responsive: true}}
      /></div><div className = {styles.longterm}>
      <label>
          Include Long-Term Value:
          <input 
      type="checkbox" id = "longterm" checked={longterm} onChange={handleToggle} />
      </label>
  </div>
        </div>
    );
};

export default CompareGraph;