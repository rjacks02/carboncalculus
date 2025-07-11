import React, {useState, useEffect} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';

const CompareBarChart = ({scenarios, update}) => {
  const [data, setData] = useState([]);

  const colors = ["#2e7c53", "#1e516a", "#e66157", "#f0db9a", "#264653", "#e07a5f", "#6a4c93", "#00b8d9", "#8a9a5b", "#a9a9a9"];
    
  useEffect(() => {
    const year = new Date().getFullYear();
    if (scenarios){
      let newData = [];
      for (let i = 0; i < scenarios.length; i++){
        if (scenarios[i].npvTotalValues){
          let current = {
            x: scenarios[i].npvYearlyValues.map((_, i) => i+year).slice(1),
              y: scenarios[i].npvYearlyValues.slice(1),
              type: 'bar',
              mode: 'lines+markers',
              marker: { color: colors[i % 10] },
              name: scenarios[i].name,
              hovertemplate: `${scenarios[i].name}<br>Year: %{x}<br>PV: $%{y}<extra></extra>`,
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
}, [scenarios, update]);

    return (
        <div className = {styles.visualSection}>
            {scenarios && (<Plot
        data={data}
            layout={{
              showlegend: true,
              title: {
                text:'Present Values per Year',
                font: {
                  family: 'Verdana, sans-serif',
                  color: 'black',
                  size: 24
                },
                xref: 'paper',
                x: 0.05,
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
                  text: 'PV ($)',
                  font: {
                    family: 'Verdana, sans-serif',
                    size: 18,
                    color: 'black'
                  },
                },
                standoff: 40
              },
              margin: { t: 40, l: 60, r: 40, b: 40 },
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
        />)}
          </div>
    );
};

export default CompareBarChart;