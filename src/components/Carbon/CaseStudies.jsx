import React, {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";

import styles from '../../css/NPV.module.css'

const Item = ({key_, setPage, setCaseStudy, openCaseStudy, refreshKeys}) => {
    const navigate = useNavigate();
    const [info, setInfo] = useState({});
    const [deleteCase, setDeleteCase] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [newName, setNewName] = useState('');
    const [rename, setRename] = useState(false);

    useEffect(() => {
      const parsedInfo = JSON.parse(localStorage.getItem(key_));
      if (parsedInfo) {
        setInfo(parsedInfo);
      }
    }, [key_]);

    function deleteCaseStudy(){
        let scenarios = JSON.parse(localStorage.getItem(key_)).scenarios;
        for (let i = 0; i < scenarios.length; i++){
            localStorage.removeItem('scenario-'+scenarios[i]);
        }
        localStorage.removeItem(key_);
        refreshKeys();
    }

    function renameCaseStudy(name){
        const stored = JSON.parse(localStorage.getItem(key_));
        localStorage.removeItem(key_);
        localStorage.setItem('caseStudy-' + name, JSON.stringify(stored));
        refreshKeys();
    }

    return(
        <div className = {styles.save}>
            <div className = {styles.caseInfo}>
                <div className = {styles.caseInfoItem}>
                    {key_.substring(10)}
                </div>
                <div className = {styles.caseInfoItem}>
                    {info.scenarios?.length ?? 0}
                </div>
                <div className = {styles.caseInfoItem}>
                    {info.openedAt ? new Date(info.openedAt).toLocaleDateString() : ''}
                </div>
            </div>
            <div className = {styles.saveAction}>
                <div className = {styles.saveActionItem} onClick = {() => {setCaseStudy(key_.substring(10)); setPage('npv'); openCaseStudy(key_.substring(10));}}>Open</div>
                <div className = {styles.saveActionItem} onClick = {() => {setCaseStudy(key_.substring(10)); setPage('saved');}}>View</div>
                <div className = {styles.saveActionItem} onClick = {() => {setRename(true);}}>Rename</div>
                <div className = {styles.saveActionItem} onClick = {() => {setDeleteCase(true);}}>Delete</div>
            </div>
            {deleteCase && (
            <div className={styles.overlay}>
              <div className={styles.popup}>
              <h2>Are you sure you want to delete this case study? <br/> This will also delete all the scenarios within it.</h2>
                <div className = {styles.popup2Container}> 
                <button className = {styles.popupButton} onClick={() => {setDeleteCase(false);}}>No, Cancel</button>
                <button className = {styles.popupButton} onClick={() => {setDeleteCase(false); deleteCaseStudy();}}>Yes, Delete</button>
              </div>
              </div>
            </div>
          )}
          {rename && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                    <h2>Enter a New Name for the Case Study:</h2>
                    <input id="newName" 
                            value = {newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            type="text" />
                    <div className = {styles.popupButtonContainer}> 
                        <button className = {styles.popupButton} onClick={() => {setRename(false); setNewName('')}}>Cancel</button>
                        <button className = {styles.popupButton} onClick={() => {setRename(false); renameCaseStudy(newName); setNewName('');}}>Confirm</button>
                    </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const CaseStudies = ({setCaseStudy, addScenario, setPage, openCaseStudy}) => {
    const [localKeys, setLocalKeys] = useState([]);
    const [addPopup, setAddPopup] = useState(false);
    const [newName, setNewName] = useState('');
    const [refreshCode, setRefreshCode] = useState(0);

    useEffect(() => {
        if (Object.keys(localStorage).filter(k => k.startsWith("caseStudy-")).length === 0){
            newCaseStudy('Default');
        }
        refreshKeys();
    }, []);


    function newCaseStudy(name){
        localStorage.setItem('caseStudy-' + name, JSON.stringify({openedAt: Date.now(), scenarios: Object.values([])}));
        refreshKeys();
    }

    function refreshKeys() {
        if (Object.keys(localStorage).filter(k => k.startsWith("caseStudy-")).length === 0){
            newCaseStudy('Default');
        }
        const keyWithTimestamps = Object.keys(localStorage)
        .filter(k => k.startsWith("caseStudy-"))
        .sort((a, b) => {
            const numA = parseInt(a.openedAt);
            const numB = parseInt(b.openedAt);
            return numB - numA;
        });
        setLocalKeys(keyWithTimestamps);
        setRefreshCode(prev => prev+1);
    }

    return (
        <div className = {styles.mainContainer}>
            <div className = {`${styles.section} ${styles.saveSection}`}>
                <h2 className = {styles.sectionTitle}>Case Studies:</h2>
                <div className = {styles.savedList}>
                    <div className = {styles.case}>
                <div className = {styles.caseTitle}>
                    <div className = {styles.caseInfoItem}>
                        Title:
                    </div>
                    <div className = {styles.caseInfoItem}>
                        Scenarios:
                    </div>
                    <div className = {styles.caseInfoItem}>
                        Opened:
                    </div>
                </div>
                <div className = {styles.actionsTitle}>
                    Actions:
                </div>
                </div>
                    {localKeys.map((key) => (<Item key={key+refreshCode} key_ = {key} setPage = {setPage} setCaseStudy = {setCaseStudy} openCaseStudy = {openCaseStudy} refreshKeys = {refreshKeys}/>))}
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
          
        </div>
    );
};

export default CaseStudies;