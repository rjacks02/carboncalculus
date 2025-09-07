import React, {useState, useEffect} from "react"; //react imports
import { useNavigate } from "react-router-dom"; //navigation imports

import styles from '../../css/NPV.module.css' //styling imports

//each saved scenario component
const Item = ({scenario, openCase, refreshKeys, caseStudies}) => {
    const [info, setInfo] = useState({}); //info about each saved scenario

    const [renamePopup, setRenamePopup] = useState(false); //rename scenario popup
    const [newName, setNewName] = useState(''); //for renaming a scenario

    const [movePopup, setMovePopup] = useState(false); //move scenario popup
    const [moveTo, setMoveTo] = useState(caseStudies[0]); //case study to move scenario to

    const [copyPopup, setCopyPopup] = useState(false); //copy scenario popup
    const [copyTo, setCopyTo] = useState(caseStudies[0]); //case study to copy scenario to

    //when scenario changes, update info
    useEffect(() => {
      const parsedInfo = JSON.parse(localStorage.getItem('scenario-' + scenario));
      if (parsedInfo) {
        setInfo(parsedInfo);
      }
    }, [scenario]);


    //move scenario - delete from this case study, move to other case study
    function move(){
        if (moveTo){
            let stored = JSON.parse(localStorage.getItem('caseStudy-' + openCase));
            let newScenarios = stored.scenarios.filter(timestamp => timestamp !== scenario);
            stored.scenarios = newScenarios;
            localStorage.setItem('caseStudy-' + openCase, JSON.stringify(stored));

            let newStored = JSON.parse(localStorage.getItem(moveTo));
            let newScens = [...newStored.scenarios];
            newScens.push(scenario);
            newStored.scenarios = newScens;
            localStorage.setItem(moveTo, JSON.stringify(newStored));
            setMoveTo(caseStudies[0]);
            refreshKeys();
        }
    }

    //copy scenario - add this scenario to another case study with name + ' copy'
    function copy(){
        if (copyTo){
            let newStored = JSON.parse(localStorage.getItem(copyTo));
            let newScens = [...newStored.scenarios];
           
            let toCopy = JSON.parse(localStorage.getItem('scenario-'+scenario));
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


    //rename scenario
    function rename(key, name){
        let stored = JSON.parse(localStorage.getItem('scenario-'+key));
        stored.name = name;
        localStorage.setItem('scenario-'+key, JSON.stringify(stored));
        refreshKeys();
    }

    //delete scenario - remove from case study and from storage
    function onDelete(){
        let newStored = JSON.parse(localStorage.getItem('caseStudy-'+openCase));
        let newScens = [...newStored.scenarios];
        newScens = newScens.filter(s => s !== scenario);
        newStored.scenarios = newScens ?? [];

        localStorage.setItem('caseStudy-'+openCase, JSON.stringify(newStored));
        localStorage.removeItem('scenario-'+scenario);
        refreshKeys();
    }


    return(
        <div className = {styles.save}>
            <div className = {styles.saveInfo}>
                <div className = {`${styles.saveInfoItem} ${styles.saveInfoName}`}>
                    {info.name}
                </div>
                <div className = {styles.saveInfoItem}>
                    {Number(info.npv).toFixed(2)} 
                </div>
            </div>
            
            <div className = {styles.saveAction}>
                <div className = {styles.saveActionItem} onClick = {() => {setMovePopup(true);}}>Move...</div>
                <div className = {styles.saveActionItem} onClick = {() => {setCopyPopup(true);}}>Copy...</div>
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
                            <button className = {styles.popupButton} onClick={() => {setRenamePopup(false); rename(scenario, newName); setNewName('');}}>Confirm</button>
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

//page for list of scenarios in case study
const Saved = ({openCase, setOpenCase, caseStudies}) => {
    const navigate = useNavigate(); //navigation

    const [localKeys, setLocalKeys] = useState([]); //list of saved scenarios within open case study
    const [refreshCode, setRefreshCode] = useState(0); //rerender list of scenarios

    //refresh keys on initial render
    useEffect(() => {
        refreshKeys();
    }, []);

    //refreshes scenarios in order of creation date
    function refreshKeys() {
        let caseInfo = JSON.parse(localStorage.getItem('caseStudy-' + openCase));
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
                    <div className = {styles.caseRibbonButton} onClick = {() => {setOpenCase(false);}}>
                        <i className='fas fa-arrow-left'></i> Back
                    </div>
                    <h2 className = {styles.openCase}>Case Study: {openCase}</h2>   
                    <div className = {styles.caseRibbonButton} onClick = {() => {localStorage.setItem('currentCase', JSON.stringify({name: openCase})); navigate('/NPVCarbon')}}>
                        Open Case Study
                    </div>
                </div>
                <div className = {styles.savedList}>
                    <div className = {styles.case}>
                        <div className = {styles.saveTitle}>
                            <div className = {styles.titleItem}>
                                Title:
                            </div>
                            <div className = {styles.titleItem}>
                                NPV (kg):
                            </div>
                            </div>
                        <div className = {styles.actionsTitle}>
                            Actions:
                        </div>
                    </div>
                
                {localKeys.map((key) => (<Item key={key + refreshCode} scenario = {key} openCase = {openCase} refreshKeys = {refreshKeys} caseStudies = {caseStudies}/>))}

                {localKeys.length === 0 && (
                    <div className = {styles.noScenarios}>
                        This case study does not have any scenarios.
                    </div>
                )}
                    
                </div>
            </div>
        </div>
    );
};

export default Saved;