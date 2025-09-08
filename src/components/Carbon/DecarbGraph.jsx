import React, {useState} from "react"; //react imports

import { useNavigate } from "react-router-dom"; //navigation imports

import styles from '../../css/NPV.module.css' //styling imports

import info from './info.json' //more info about terms

import Plot from 'react-plotly.js'; //plotting imports

const DecarbGraph = ({data, handleToggle, longterm, units, bau}) => {
  let navigate = useNavigate(); //navigation
  
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className = {styles.visualSection}>
      <div> 
        <Plot
          data={data}
          layout={{
            showlegend: true,
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
                text: `${units} Reduced`,
                font: {
                  family: 'Verdana, sans-serif',
                  size: 18,
                  color: 'black'
                },
                standoff: 40
              },
            },
            title: {
              text:`Effective Decarbonization (D<sub>Eff</sub>) from BAU ${bau.name ? "(" + bau.name + ")": ""}`,
              font: {
                family: 'Verdana, sans-serif',
                color: 'black',
                size: 22
              },
              xref: 'paper',
              xanchor: 'center'
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
          config={{ responsive: true }}
        />
      </div>
      <div className = {styles.longterm}>
        <label><div className = {styles.info}><i className="material-icons" onClick = {() => {setShowInfo(true);}}>info_outline</i></div>
            Long-Term Value:
            <input type="checkbox" id = "longterm" checked={longterm} onChange={handleToggle} />
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

export default DecarbGraph;