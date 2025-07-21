import React from "react";

import Header from '../components/Header';
import Plot from 'react-plotly.js';

import styles from '../css/NPV.module.css'

const FAQs = () => {
    return (
        <div>
            <div className = {styles.mainContainer}>
                <div className = {styles.faqsContainer}>
                    <div className = {styles.faqTitle}>
                        Frequently Asked Questions (FAQs)
                    </div>
                    <div className = {`${styles.qanda} ${styles.leftFAQs}`}>
                        <div className = {styles.question}>
                            What is Carbon Calculus™?
                        </div>
                        <div className = {styles.answer}>
                            Carbon Calculus™ is a novel methodology for science-based net present value (NPV) where the fundamental unit of measurement is carbon dioxide (CO<sub>2</sub>). 
                            It provides critically important metrics to be used in sustainability efforts and decarbonization decision-making. 
                            The primary metric showcased in this tool is a calculation of the net present value of carbon dioxide emissions (NPV<sub>CO<sub>2</sub></sub>).
                        </div>
                    </div>
                    <div className = {`${styles.qanda} ${styles.rightFAQs}`}>
                        <div className = {styles.question}>
                            How Does NPV Relate to Carbon? What is NPV<sub>CO<sub>2</sub></sub>?
                        </div>
                        <div className = {styles.answer}>
                        This is the cumulative net discounted CO<sub>2</sub> emitted into the atmosphere per your scenario, valued from the perspective of emissions today. For example, at a 3.355% annual discount rate, 1 ton of CO<sub>2</sub> emitted annually, indefinitely, has a net present value (NPV<sub>CO<sub>2</sub></sub>) of 30.8 tons of CO<sub>2</sub> emitted only once, today. The term “value” here is a proxy for “impact,” as quantity emitted, when those emissions occur, and the rate at which those emissions dissipate all contribute to the impact that CO<sub>2</sub> in the atmosphere has on global radiative forcing (the greenhouse effect, global average temperature increase).
                        </div>
                    </div>
                    <div className = {`${styles.qanda} ${styles.leftFAQs}`}>
                            <div className = {styles.question}>
                                What is BAU (Business as Usual)?
                            </div>
                            <div className = {styles.answer}>
                            This is a scenario that represents the current projected annual emissions rate if today’s actions are continued. This is likely a continuation of today’s emissions rate indefinitely, depending on one’s assumptions for what their “business as usual” is. This should not reflect targets or commitments for emissions reductions, which can be modeled as its own scenario.
                            </div>
                    </div>
                    <div className = {`${styles.qanda} ${styles.rightFAQs}`}>
                        <div className = {styles.question}>
                         How Would I Compare Other Scenarios To My BAU? What is D<sub>Eff</sub>?
                        </div>
                        <div className = {styles.answer}>
                        D<sub>Eff</sub> is Effective Decarbonization. This represents the relative difference between a scenario’s emissions (emissions resulting from taking some sort of action) and BAU emissions (a continuation of today’s emissions, the “do nothing” case). This metric helps to answer the question, “how effective is this scenario compared to what is currently happening?”. While NPV_CO_2 is an absolute metric, this is a metric relative to BAU.
                        </div>
                    </div>
                    <div className = {styles.faqsColumns}>
                        <div className = {styles.qanda}>
                            <div className = {styles.question}>
                                What is Upfront Emissions?
                            </div>
                            <div className = {styles.answer}>
                            Upfront emissions are the amount of carbon released at the beginning of a project or intervention. They occur immediately in year 0 and thus carry full weight in Carbon Calculus, significantly influencing a scenario’s climate impact.
                            </div>
                        </div>
                        <div className = {styles.qanda}>
                            <div className = {styles.question}>
                                What is a Discount Rate?
                            </div>
                            <div className = {styles.answer}>
                            Carbon’s “discount” rate represents the effective annual dissipation rate of CO2 in the atmosphere through the flux of the global carbon cycle. We recommend using a discount rate somewhere in the range of 2% to 5%; 3.355% is the default, as it is aligned with prior literature and the 100-year global warming potential of CO2.
                            </div>
                        </div>
                    </div>
                    <div className = {styles.faqsColumns}>
                        <div className = {styles.qanda}>
                        <div className = {styles.question}>
                                What is Long-Term Value?
                            </div>
                            <div className = {styles.answer}>
                            Enabling this function accounts for the limit of your scenario, taking your final year’s emission rate and assuming that rate continues for many years to come. This is encouraged as a default setting, as most real-world emissions will not stop at the end of your chosen time horizon, but that ultimately depends on your scenario.
                            </div>
                        </div>
                        <div className = {styles.qanda}>
                            <div className = {styles.question}>
                                What is Years Delayed?
                            </div>
                            <div className = {styles.answer}>
                            This is the number of years before a scenario begins generating or reducing emissions. Both upfront and annual emissions are affected by this delay. As the delay increases, the climate impact of those emissions or reductions decreases due to the discount rate.
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default FAQs;