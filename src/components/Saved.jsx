import React, {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";

import styles from '../css/NPV.module.css'

const Item = ({key_, caseStudy, refreshKeys, caseStudies}) => {
    const navigate = useNavigate();
    const [info, setInfo] = useState({});

    const [renamePopup, setRenamePopup] = useState(false);
    const [newName, setNewName] = useState('');
    const [movePopup, setMovePopup] = useState(false);
    const [moveTo, setMoveTo] = useState(caseStudies[0]);
    const [copyPopup, setCopyPopup] = useState(false);
    const [copyTo, setCopyTo] = useState(caseStudies[0]);

    useEffect(() => {
      const parsedInfo = JSON.parse(localStorage.getItem('scenario-' + key_));
      if (parsedInfo) {
        setInfo(parsedInfo);
      }
    }, [key_]);

    function move(){
        if (moveTo){
            let stored = JSON.parse(localStorage.getItem('caseStudy-' + caseStudy));
            let newScenarios = stored.scenarios.filter(timestamp => timestamp !== key_);
            stored.scenarios = newScenarios;
            localStorage.setItem('caseStudy-' + caseStudy, JSON.stringify(stored));

            let newStored = JSON.parse(localStorage.getItem(moveTo));
            let newScens = [...newStored.scenarios];
            newScens.push(key_);
            newStored.scenarios = newScens;
            localStorage.setItem(moveTo, JSON.stringify(newStored));
            setMoveTo(caseStudies[0]);
            refreshKeys();
        }
    }

    function copy(){
        if (copyTo){
            let newStored = JSON.parse(localStorage.getItem(copyTo));
            let newScens = [...newStored.scenarios];
           
            let toCopy = JSON.parse(localStorage.getItem('scenario-'+key_));
            let now = Date.now();
            toCopy.createdAt = now;
            toCopy.name = toCopy.name + ' copy';
            localStorage.setItem('scenario-'+now, JSON.stringify(toCopy));

            newScens.push(now);
            newStored.scenarios = newScens;
            localStorage.setItem(copyTo, JSON.stringify(newStored));
            setCopyTo(caseStudies[0]);
            refreshKeys();
        }
    }

    function rename(key, name){
        let stored = JSON.parse(localStorage.getItem('scenario-'+key));
        stored.name = name;
        localStorage.setItem('scenario-'+key, JSON.stringify(stored));
        refreshKeys();
    }

    function onDelete(){
        let newStored = JSON.parse(localStorage.getItem('caseStudy-'+caseStudy));
        let newScens = [...newStored.scenarios];
        newScens = newScens.filter(s => s !== key_);
        newStored.scenarios = newScens ?? [];

        localStorage.setItem('caseStudy-'+caseStudy, JSON.stringify(newStored));
        localStorage.removeItem('scenario-'+key_);
        refreshKeys();
    }

    return(
        <div className = {styles.save}>
            <div className = {styles.saveInfo}>
                <div className = {`${styles.saveInfoItem} ${styles.saveInfoName}`}>
                    {info.name}
                </div>
                <div className = {styles.saveInfoItem}>
                    {info.upfrontEmissions}
                </div>
                <div className = {styles.saveInfoItem}>
                    {info.discountRate}
                </div>
                <div className = {styles.saveInfoItem}>
                    {Number(info.npv).toFixed(2)}
                    
                </div>
            </div>
            
            <div className = {styles.saveAction}>
                <div className = {styles.saveActionItem} onClick = {() => {setMovePopup(true);}}>Move To...</div>
                <div className = {styles.saveActionItem} onClick = {() => {setCopyPopup(true);}}>Copy To...</div>
                <div className = {styles.saveActionItem} onClick = {() => setRenamePopup(true)}>Rename</div>
                <div className = {styles.saveActionItem} onClick={() => onDelete()}>Delete</div>
            </div>
            {renamePopup && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                    <h2>Enter a New Name for the Scenario:</h2>
                    <input id="newName" 
                            value = {newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            type="text" />
                    <div className = {styles.popupButtonContainer}> 
                        <button className = {styles.popupButton} onClick={() => {setRenamePopup(false); setNewName('')}}>Cancel</button>
                        <button className = {styles.popupButton} onClick={() => {setRenamePopup(false); rename(key_, newName); setNewName('');}}>Confirm</button>
                    </div>
                    </div>
                </div>
            )}
            {movePopup && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                    <h2>Select A Case Study To Move This Scenario To:</h2>
                        <select name="dropdown" className={styles.selectBox} onChange={(e) => setMoveTo(`caseStudy-${e.target.value}`)}> 
                        {caseStudies.map((key) => (<option key = {key.substring(10)} value={key.substring(10)} className={styles.optionItem}>{key.substring(10)}</option>))}
                        </select>
                    <div className = {styles.popupButtonContainer}> 
                        <button className = {styles.popupButton} onClick={() => {setMovePopup(false); setMoveTo('caseStudy-Default');}}>Cancel</button>
                        <button className = {styles.popupButton} onClick={() => {setMovePopup(false); move();}}>Confirm</button>
                    </div>
                    </div>
                </div>
            )}
            {copyPopup && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                    <h2>Select A Case Study To Copy This Scenario To:</h2>
                        <select name="dropdown" className={styles.selectBox} onChange={(e) => setCopyTo(`caseStudy-${e.target.value}`)}> 
                        {caseStudies.map((key) => (<option key = {key.substring(10)} value={key.substring(10)} className={styles.optionItem}>{key.substring(10)}</option>))}
                        </select>
                    <div className = {styles.popupButtonContainer}> 
                        <button className = {styles.popupButton} onClick={() => {setCopyPopup(false); setCopyTo('caseStudy-Default');}}>Cancel</button>
                        <button className = {styles.popupButton} onClick={() => {setCopyPopup(false); copy();}}>Confirm</button>
                    </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const Saved = ({caseStudy, setPage, openCaseStudy}) => {
    const [localKeys, setLocalKeys] = useState(['start']);
    const [update, setUpdate] = useState(false);
    const [refreshCode, setRefreshCode] = useState(0);
    const [caseStudies, setCaseStudies] = useState(Object.keys(localStorage).filter(k => k.startsWith("caseStudy-")));

    useEffect(() => {
        refreshKeys();
    }, []);

    function refreshKeys() {
        let caseInfo = JSON.parse(localStorage.getItem('caseStudy-' + caseStudy));
        let scenarioKeys = caseInfo.scenarios;
        if (!scenarioKeys || scenarioKeys.length === 0){
            setLocalKeys([]);
        }
        else{
            scenarioKeys.map(key => `scenario-${key}`).sort((a, b) => {
                const numA = parseInt(a.split("-")[1], 10);
                const numB = parseInt(b.split("-")[1], 10);
                return numB - numA;
            });
            setLocalKeys(scenarioKeys);
        }
        setRefreshCode(prev => prev+1);
    }

    return (
        <div className = {styles.mainContainer}>
            <div className = {`${styles.section} ${styles.saveSection}`}>
            <div className = {styles.caseRibbonContainer}>
            <div className = {styles.caseRibbonButton} onClick = {() => {setPage('case study');}}>
                    <i className='fas fa-arrow-left'></i> Back
                </div>
                <div className = {styles.caseRibbonButton} onClick = {() => {setPage('npv'); openCaseStudy();}}>
                  Open Case Study
                </div>
              </div>
                <h2 className = {styles.sectionTitle}>Case Study: {caseStudy}</h2>   
                <div className = {styles.savedList}>
                {localKeys.length === 0 && (<div className = {styles.noScenarios}>
                        This case study does not have any scenarios.
                         </div>)}
                    {localKeys.map((key) => (<Item key={key + refreshCode} key_ = {key} setPage = {setPage} update = {update} openCaseStudy = {openCaseStudy} caseStudy = {caseStudy} refreshKeys = {refreshKeys} caseStudies = {caseStudies}/>))}
                </div>
            </div>
        </div>
    );
};

export default Saved;