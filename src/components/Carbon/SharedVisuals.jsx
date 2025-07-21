import React, {useState, useEffect, useRef} from "react";
import styles from '../../css/NPV.module.css';

import CompareGraph from './CompareGraph';

const SelectScenarios = ({scenarios, selected, setSelected, update }) => {
    const [isOpen, setIsOpen] = useState(true);
    const dropdownRef = useRef();


    const toggleOption = (option) => {
      setSelected((prev) => {
        const exists = prev.some((o) => o.createdAt === option.createdAt);
        return exists
          ? prev.filter((o) => o.createdAt !== option.createdAt)
          : [...prev, option];
      });
    };
  
    return (
      <div className={styles.multiSelectDropdown} ref={dropdownRef}>
        <div
          className={styles.multiSelectLabel}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          Select Scenarios To Compare ▾
        </div>
        {isOpen && (
          <div className={styles.SelectContent}>
            {scenarios.map((option, ind) => (
              <label className={styles.multiSelectItem} key={option.createdAt}>
                <input
                  type="checkbox"
                  checked={selected.some(sel => sel.createdAt === option.createdAt)}
                  onChange={() => toggleOption(option)}
                />
                {ind === 0 ? `(BAU) ${option.name}` : option.name}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

const SharedVisuals = ({scenarioData, selected, setSelected, update, units, emissions}) => {

    
    return (
        <div className = {styles.section}>
            <h2 className = {styles.sectionTitle} >Comparing Results and Visualizations</h2>
            <SelectScenarios scenarios = {scenarioData} selected = {selected} setSelected = {setSelected}/>
            <CompareGraph scenarios ={selected} update = {update} units = {units} emissions = {emissions}/>
        </div>
    );
};

export default SharedVisuals;