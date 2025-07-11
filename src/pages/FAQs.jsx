import React from "react";

import Header from '../components/Header';
import Plot from 'react-plotly.js';

import styles from '../css/NPV.module.css'

const FAQs = () => {
    return (
        <div>
            <Header />
            <div className = {styles.mainContainer}>
                <div className = {styles.faqsContainer}>
                    <div className = {styles.faqTitle}>
                        Frequently Asked Questions (FAQs)
                    </div>
                    <div className = {styles.qanda}>
                        <div className = {styles.question}>
                            What is Carbon Calculus™?
                        </div>
                        <div className = {styles.answer}>
                            Carbon Calculus™ is a novel methodology for science-based net present value (NPV) where the fundamental unit of measurement is carbon dioxide (CO2). 
                            It provides critically important metrics to be used in sustainability efforts and decarbonization decision-making. 
                            The primary metric showcased in this tool is a calculation of the net present value of carbon dioxide emissions (NPVCO2).
                        </div>
                    </div>
                    <div className = {styles.faqsColumns}>
                        <div className = {styles.qanda}>
                            <div className = {styles.question}>
                                What is Net Present Value (NPV)?
                            </div>
                            <div className = {styles.answer}>
                                NPV is the the sum of all estimated future cash flows of a project which are discounted back to their present value.
                                It helps determine a project's profitability by seeing if the NPV breaks even.
                            </div>
                            <div className = {styles.answer}>
                                If NPV {">"} 0, then the project has broken even and is determined to be profitable and the company will likely see a return on their initial investment.
                            </div>
                            <div className = {styles.answer}>
                                If NPV {"<"} 0, then the project has not broken even, will likely not be profitable, and the company will have ultimately lost money by investing in the project.
                            </div>
                            <div className = {styles.answer}>
                                The graph on the right represented a project 
                            </div>
                        </div>
                        <div className = {styles.plotContainer}>
                            <Plot className = {styles.plot}
                                data={[
                                {
                                    x: [0, 1, 2, 3, 4, 5],
                                    y: [
                                        -300,
                                        -204.76190476190476, 
                                        -114.05895691609977,
                                        -27.67519706295218,
                                        54.595050416236006,
                                        132.9476670630819],
                                    type: 'line',
                                    mode: 'lines+markers',
                                    hovertemplate: `Year: %{x}<br>NPV: $%{y}<extra></extra>`,
                                    marker: { color: 'black' },
                                },
                                ]}
                                layout={{
                                title: {
                                    text:'Cumulative Net Present Value',
                                    font: {
                                    family: 'Verdana, sans-serif',
                                    color: 'black',
                                    size: 24
                                    },
                                    xref: 'paper',
                                    x: 0.05,
                                },
                                height: '100%',
                                margin: { t: 40, l: 40, r: 40, b: 40 },
                                paper_bgcolor: '#aed9ea',
                                plot_bgcolor: '#94c8dc',
                                }}
                                style={{ width: '80%', height: '80%' }}
                                useResizeHandler={true}
                                config={{ responsive: true }}
                            />
                        </div>
                    </div>
                    <div className = {styles.qanda}>
                        <div className = {styles.question}>
                            How Does CO2 Relate to NPV?
                        </div>
                        <div className = {styles.answer}>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQs;