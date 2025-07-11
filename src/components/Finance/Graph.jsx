import React, {useState, useEffect} from "react";

import styles from '../../css/NPV.module.css'
import Plot from 'react-plotly.js';



const Graph = ({vertical, vals}) => {
    const [breakEven, setBreakEven] = useState(null);
    const year = new Date().getFullYear();

    useEffect(() => {
      if (vals){
        let found = false;
        for (let i = 0; i < vals.length - 1; i++) {
            const y1 = vals[i];
            const y2 = vals[i + 1];
    
            if ((y1 < 0 && y2 > 0) || (y1 > 0 && y2 < 0)) {
                const x1 = i;
                const x2 = i + 1;
    
                let xZero = x1 + (0 - y1) * (x2 - x1) / (y2 - y1) + year;
                setBreakEven(xZero);
                found = true;
            }
        }
        if(!found){
            setBreakEven(null);
        }
      }
    }, [vals])

    return (
        <div className={`${styles.visualSection} ${vertical === false ? styles.visualSectionHorizontal : ''}`}>
            {vals && (<Plot
        data={[
          {
            x: vals.map((_, i) => i+year),
            y: vals,
            type: 'line',
            mode: 'lines+markers',
            hovertemplate: `Year: %{x}<br>NPV: $%{y}<extra></extra>`,
            marker: { color: 'black' },
          },
        ]}
        layout={{
          title: {
            text:'Cumulative Net Value',
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
              text: 'NPV ($)',
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
          autosize: true,
          annotations: breakEven !== null ? [
            {
              x: breakEven,
              y: 0,
              text: 'Breakeven at <br> Year ' + breakEven.toFixed(0),
              showarrow: true,
              arrowhead: 2,
              align: 'center',
              bgcolor: 'white',
              bordercolor: 'red',
              borderwidth: 1,
              borderpad: 4,
              opacity: 0.9,
              cliponaxis: false,
              font: { color: 'red' }
            }
          ] : []
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        config={{ responsive: true }}
      />)}
        </div>
    );
};

export default Graph;