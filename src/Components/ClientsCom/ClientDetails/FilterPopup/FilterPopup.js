import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../../Context/AppContext";
import styles from "./FilterPopup.module.css";
import { getUser } from "../../../../storageUtils/storageUtils";

export const FilterPopup = ({ closeModal, applyFilters }) => {
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const { dashboardWidth } = useAppContext();

  const handleApply = () => {
    applyFilters({ clientName, email });
    closeModal();
  };

  let userId = getUser();
  userId = userId?._id;

  const popupRef = useRef(null);

  const handleClear = () => {
    // Clear filter inputs
    setClientName("");
    setEmail("");

    // Reset filters in the parent component
    applyFilters({ clientName: "", email: "" });
    closeModal();
  };

  // Handle clicks outside the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  return (
    <div className={styles.modalBackground} ref={popupRef}>
      <div className={styles.modalContainer}>
        <div className={styles.tabContent}>
          <div className={styles.filterHeader}>
            <h3>Filters</h3>
            <span onClick={closeModal}>x</span>
          </div>
          <div className={styles.tabPanel}>
            <label htmlFor="clientName">Client Name:</label>
            <div className="form-group mb-2">
              <input
                type="text"
                className={`form-control ${styles.formControl}`}
                id="name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.tabPanel}>
            <label htmlFor="clientName">Client Email:</label>
            <div className="form-group mb-2">
              <input
                type="text"
                className={`form-control ${styles.formControl}`}
                id="emailId"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.applyBtn} onClick={handleApply}>
            Apply
          </button>
          <button className={styles.filterButton} onClick={handleClear}>
            Clear Filter
          </button>
        </div>
      </div>
    </div>
  );
};
