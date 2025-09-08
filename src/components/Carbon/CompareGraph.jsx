import React, {useState} from "react"; //react imports

import { useNavigate } from "react-router-dom"; //navigation imports

import styles from '../../css/NPV.module.css' //styling imports

import info from './info.json' //more info about terms

import Plot from 'react-plotly.js'; //plotting imports

const CompareGraph = ({data, handleToggle, longterm, units, emissions}) => {
  let navigate = useNavigate(); //navigation

  const [showInfo, setShowInfo] = useState(false);

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
        />
      </div>
      <div className = {styles.longterm}>
        <label><div className = {styles.info}><i className="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i></div>
          Long-Term Value:
          <input 
            type="checkbox" id = "longterm" checked={longterm} onChange={handleToggle} 
          />
        </label>
      </div>

      {showInfo && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Long-Term Value:</h2>
                        <p>{info["Long-Term Value"]}</p>
                        <div className = {styles.popup2Container}> 
                            <button className = {styles.popupButton} onClick={() => {setShowInfo(false);}}>Close</button>
                            <button className = {styles.popupButton} onClick={() => {setShowInfo(false); navigate('/FAQs');}}>Read More</button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default CompareGraph;