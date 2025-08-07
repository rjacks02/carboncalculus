import React, {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";

import styles from '../css/NPV.module.css'

const Item = ({key_, onDelete, rename, addScenario, update}) => {
    const navigate = useNavigate();
    const [info, setInfo] = useState({});

    const [showPopup, setShowPopup] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
      const parsedInfo = JSON.parse(localStorage.getItem(key_));
      if (parsedInfo) {
        setInfo(parsedInfo);
      }
    }, [key_, update]);

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
                <div className = {styles.saveActionItem} onClick = {() => addScenario(key_)}>Open</div>
                <div className = {styles.saveActionItem} onClick = {() => setShowPopup(true)}>Rename</div>
                <div className = {styles.saveActionItem}>Download</div>
                <div className = {styles.saveActionItem} onClick={() => onDelete(key_)}>Delete</div>
            </div>
            {showPopup && (
                <div className={styles.overlay}>
                    <div className={styles.popup}>
                    <h2>Enter a New Name for the Scenario:</h2>
                    <input id="newName" 
                            value = {newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            type="text" />
                    <div className = {styles.popupButtonContainer}> 
                        <button className = {styles.popupButton} onClick={() => {setShowPopup(false); setNewName('')}}>Cancel</button>
                        <button className = {styles.popupButton} onClick={() => {setShowPopup(false); rename(key_, newName); setNewName('');}}>Confirm</button>
                    </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const Saved = ({addScenario, setPage}) => {
    const [localKeys, setLocalKeys] = useState([]);
    const [update, setUpdate] = useState(false);

    useEffect(() => {
        refreshKeys();
    }, []);

    function refreshKeys() {
        const keyWithTimestamps = Object.keys(localStorage)
        .filter(k => k.startsWith("scenario-"))
        .sort((a, b) => {
            const numA = parseInt(a.split("-")[1], 10);
            const numB = parseInt(b.split("-")[1], 10);
            return numB - numA;
        });
        setLocalKeys(keyWithTimestamps);
    }

    function onDelete(key){
        localStorage.removeItem(key);
        refreshKeys();
    }

    function rename(key, newName){
        const data = JSON.parse(localStorage.getItem(key));
        data.name = newName;
        localStorage.setItem(key, JSON.stringify(data));
        setUpdate(prev => !prev);
        refreshKeys();
    }

    return (
        <div className = {styles.mainContainer}>
            <div className = {`${styles.section} ${styles.saveSection}`}>
                <h2 className = {styles.sectionTitle}>Saved Scenarios</h2>
                <div className = {styles.savedList}>
                    {localKeys.map((key) => (<Item key={key} key_ = {key} onDelete = {onDelete} rename = {rename} addScenario = {addScenario} update = {update}/>))}
                </div>
                <button className = {styles.npvButton} onClick = {() => {setPage('npv');}}><span>Cancel</span></button>
            </div>
        </div>
    );
};

export default Saved;