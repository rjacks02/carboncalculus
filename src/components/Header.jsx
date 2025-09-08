import React from "react"; //react imports

import { useNavigate } from "react-router-dom"; //navigation imports

import styles from '../css/NPV.module.css' //styling imports

const Header = () => {
  let navigate = useNavigate(); //navigation

  return (
    <div className = {styles.headerContainer}>
      <h2 className = {styles.header}>Carbon Calculus™</h2>
      <button className = {styles.navButton} onClick = {() => {navigate('/Home')}}>Home</button>
      <button className = {styles.navButton} onClick = {() => {navigate('/NPVCarbon')}}>Calculator</button>
      <button className = {styles.navButton} onClick = {() => {navigate('/FAQs')}}>FAQs/Tutorial</button>
      <button className = {styles.navButton} onClick = {() => {navigate('/FAQs')}}>Our Research</button>
    </div>
  );
};

export default Header;