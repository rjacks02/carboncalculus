import React, {useState, useEffect} from "react";

import styles from '../../css/NPV.module.css'

import Plot from 'react-plotly.js';

const BarChart = ({vertical, vals}) => {
  const year = new Date().getFullYear();

    return (
      <div className={`${styles.visualSection} ${vertical === false ? styles.visualSectionHorizontal : ''}`}>
            {vals && (<Plot
        data={[
          {
            x: vals.map((_, i) => i+year).slice(1),
            y: vals.slice(1),
            type: 'bar',
            mode: 'lines+markers',
            hovertemplate: `Year: %{x}<br>PV: $%{y}<extra></extra>`,
            marker: { color: 'black' },
          },
        ]}
        layout={{
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
            },        
            
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
            standoff: 40,
          },
          margin: { t: 40, l: 60, r: 40, b: 40 },
            paper_bgcolor: '#aed9ea',
            plot_bgcolor: '#94c8dc',
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
          config={{ responsive: true }}
        />)}
          </div>
    );
};

export default BarChart;