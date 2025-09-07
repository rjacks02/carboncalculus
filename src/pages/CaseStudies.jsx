import React, {useState, useEffect} from "react"; //react imports
import { useNavigate } from "react-router-dom"; //navigation imports

import styles from '../css/NPV.module.css' //styling imports

//component imports
import Saved from '../components/Carbon/Saved'
import Header from '../components/Header'

//each case study component
const Item = ({caseStudy, refreshKeys, setBadName, setOpenCase}) => {
    const navigate = useNavigate(); //navigation

    const [info, setInfo] = useState({}); //info about each case study
    const [newName, setNewName] = useState(''); //for renaming case study

    const [deletePopup, setDeletePopup] = useState(false); //delete case study popup
    const [renamePopup, setRenamePopup] = useState(false); //rename case study popup

    //update info based on case study
    useEffect(() => {
      const parsedInfo = JSON.parse(localStorage.getItem(caseStudy));
      if (parsedInfo) {
        setInfo(parsedInfo);
      }
    }, [caseStudy]);

    //deletes case study and included scenarios from local storage, refreshes keys
    function deleteCaseStudy(){
        let scenarios = JSON.parse(localStorage.getItem(caseStudy)).scenarios;
        for (let i = 0; i < scenarios.length; i++){
            localStorage.removeItem('scenario-'+scenarios[i]);
        }
        localStorage.removeItem(caseStudy);
        refreshKeys();
    }

    //rename case study, check if name already exists
    function renameCaseStudy(name){
        if (localStorage.getItem('caseStudy-'+name)){
            setBadName(true);
        }
        else{
            const stored = JSON.parse(localStorage.getItem(caseStudy));
            localStorage.removeItem(caseStudy);
            localStorage.setItem('caseStudy-' + name, JSON.stringify(stored));
            refreshKeys();
        }
    }

    return(
        <div className = {styles.save}>
            <div className = {styles.caseInfo}>
                <div className = {styles.caseInfoItem}>
                    {caseStudy.substring(10)}
                </div>
                <div className = {styles.caseInfoItem}>
                    {info.scenarios?.length ?? 0}
                </div>
                <div className = {styles.caseInfoItem}>
                    {info.openedAt ? new Date(info.openedAt).toLocaleDateString() : ''}
                </div>
            </div>
            <div className = {styles.saveAction}>
                <div className = {styles.saveActionItem} onClick = {() => {localStorage.setItem('currentCase', JSON.stringify({name: caseStudy.substring(10)})); navigate('/NPVCarbon')}}>Open</div>
                <div className = {styles.saveActionItem} onClick = {() => {setOpenCase(caseStudy.substring(10))}}>List</div>
                {caseStudy !== 'caseStudy-Default' && (<div className = {styles.saveActionItem} onClick = {() => {setRenamePopup(true);}}>Rename</div>)}
                {caseStudy !== 'caseStudy-Default' && (<div className = {styles.saveActionItem} onClick = {() => {setDeletePopup(true);}}>Delete</div>)}
            </div>
            
            {deletePopup && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Are you sure you want to delete this case study? <br/> This will also delete all the scenarios within it.</h2>
                        <div className = {styles.popup2Container}> 
                            <button className = {styles.popupButton} onClick={() => {setDeletePopup(false);}}>No, Cancel</button>
                            <button className = {styles.popupButton} onClick={() => {setDeletePopup(false); deleteCaseStudy();}}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {renamePopup && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>Enter a New Name for the Case Study:</h2>
                        <input id="newName" 
                            value = {newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            type="text" />
                        <div className = {styles.popupButtonContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setRenamePopup(false); setNewName('')}}>Cancel</button>
                            <button className = {styles.popupButton} onClick={() => {setRenamePopup(false); renameCaseStudy(newName); setNewName('');}}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

//page for list of case studies
const CaseStudies = () => {
    const [caseStudies, setCaseStudies] = useState([]); //list of case studies
    const [openCase, setOpenCase] = useState(''); //currently open case
    const [refreshCode, setRefreshCode] = useState(0); //rerender list of case studies

    const [addPopup, setAddPopup] = useState(false); //popup to add new case study
    const [newName, setNewName] = useState(''); //rename case study
    const [badName, setBadName] = useState(false); //triggers true if case study with new name already exists


    //finds all saved case studies
    useEffect(() => {
        if (Object.keys(localStorage).filter(k => k.startsWith("caseStudy-")).length === 0){
            newCaseStudy('Default'); //if no case studies exist, create default case study
        }
        refreshKeys();
    }, []);


    //creates new case study
    function newCaseStudy(name){
        if (localStorage.getItem('caseStudy-'+name)){ //if case study with name already exists
            setBadName(true);
        }
        else{
            localStorage.setItem('caseStudy-' + name, JSON.stringify({openedAt: Date.now(), scenarios: Object.values([])}));
            refreshKeys();
        }
    }

    //refreshes case studies in order of last opened
    function refreshKeys() {
        if (Object.keys(localStorage).filter(k => k.startsWith("caseStudy-")).length === 0){
            newCaseStudy('Default'); //if no case studies exist, create default case study
        }

        //sorts case studies
        const keysWithTimestamps = Object.keys(localStorage)
        .filter(k => k.startsWith("caseStudy-"))
        .sort((a, b) => {
            let caseA = JSON.parse(localStorage.getItem(a));
            let caseB = JSON.parse(localStorage.getItem(b));
            const numA = parseInt(caseA.openedAt);
            const numB = parseInt(caseB.openedAt);
            return numB - numA;
        });
        setCaseStudies(keysWithTimestamps);
        setRefreshCode(prev => prev+1); //updates list
    }

    
    return (
        <div>
            <Header />
            {!openCase && (<div className = {styles.mainContainer}>
                <div className = {`${styles.section} ${styles.saveSection}`}>
                    <h2 className = {styles.sectionTitle}>Case Studies:</h2>
                    <div className = {styles.savedList}>
                        <div className = {styles.case}>
                            <div className = {styles.caseTitle}>
                                <div className = {styles.titleItem}>
                                    Title:
                                </div>
                                <div className = {styles.titleItem}>
                                    Scenarios:
                                </div>
                                <div className = {styles.titleItem}>
                                    Opened:
                                </div>
                            </div>
                            <div className = {styles.actionsTitle}>
                                Actions:
                            </div>
                        </div>
                        {caseStudies.map((key) => (<Item key={key+refreshCode} caseStudy = {key} refreshKeys = {refreshKeys} setBadName={setBadName} setOpenCase = {setOpenCase}/>))}
                        <div className = {styles.caseButtonWrapper}>
                            <button className = {styles.caseButton} onClick = {() => {setAddPopup(true);}}><span>+ Add New Case Study</span></button>
                        </div>
                    </div>
                </div>

                {addPopup && (
                    <div className={styles.overlay}>
                        <div className={styles.popup}>
                            <h2>Enter A Name For The Case Study:</h2>
                            <input id="caseName" 
                                value = {newName} 
                                onChange={(e) => setNewName(e.target.value)} 
                                type="text" />
                            <div className = {styles.popupButtonContainer}> 
                                <button className = {styles.popupButton} onClick={() => {setAddPopup(false); setNewName('');}}>Cancel</button>
                                <button className = {styles.popupButton} onClick={() => {setAddPopup(false); newCaseStudy(newName); setNewName('');}}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )}

                {badName && (
                    <div className={styles.overlay}>
                    <div className={styles.popup}>
                        <h2>A case study with this name already exists, so the action could not be completed.</h2>
                        <div className = {styles.popupContainer}> 
                            <button className = {styles.popupButton} onClick={() => {setBadName(false);}}>OK</button>
                        </div>
                    </div>
                    </div>
                )}

            </div>)}

            {openCase && <Saved openCase = {openCase} setOpenCase = {setOpenCase} caseStudies = {caseStudies}/>}
        </div>
    );
};

export default CaseStudies;