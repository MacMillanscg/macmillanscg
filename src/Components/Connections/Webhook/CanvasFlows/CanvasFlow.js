import React, { useState, useEffect, useRef } from "react";
import styles from "./CanvasFlow.module.css"; // Import the CSS module
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  faCopy,
  faEdit,
  faTrash,
  faPlus,
  faChevronDown,
  faTh,
  faEllipsisV,
  faSleigh,
} from "@fortawesome/free-solid-svg-icons";
import { AddnewSteps } from "./AddnewSteps/AddnewSteps";
import { ConfirmCancelPopUp } from "../../../Common/ConfirmCancelPopUp/ConfirmCancelPopUp";
import { url } from "../../../../api";

export const CanvasFlow = ({
  selectedStep,
  setSelectedStep,
  selectedStepId,
  setSelectedStepId,
  setScheduleIds,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddNewStep, setShowAddNewStep] = useState(false);
  const [connectionsSteps, setConnectionsSteps] = useState([]);
  const [seletedEditStep, setSeletedEditStep] = useState(null);
  const [seletedEditStepId, setSeletedEditStepId] = useState(null);
  const [connectionName, setConnectionName] = useState("");
  const [copyStep, setCopyStep] = useState(false);
  const [showdeleteModal, setShowDeleteModal] = useState(false);
  const [stepIdToDelete, setStepIdToDelete] = useState(null);
  // const [selectedStep, setSelectedStep] = useState("Rule 1");
  const { id } = useParams();
  const menuRef = useRef(null);

  const fetchConnections = async () => {
    try {
      const response = await axios.get(
        `${url}/connections/${id}/connectionSteps`
      );
      console.log("connection Rules", response.data.connectionRule);
      if (response.data) {
        setConnectionsSteps(response.data.connectionRule);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      // setLoading(false);
    }
  };
  console.log("selectedStep", selectedStep);
  console.log("selectedStepId", selectedStepId);

  useEffect(() => {
    fetchConnections();
  }, [showAddNewStep]);
  console.log("connectionsStep", connectionsSteps);

  useEffect(() => {
    const filteredIds = connectionsSteps
      .filter((item) => item.scheduleDetails.option === "Schedule")
      .map((item) => item._id);
    setScheduleIds(filteredIds);
  }, [connectionsSteps]);

  const handleAddNewStep = () => {
    setShowAddNewStep(true);
    setConnectionName("");
  };
  const handleCloseAddNewStep = () => {
    setShowAddNewStep(false);
  };

  const handleToggleMenu = () => {
    setShowMenu(true);
  };

  const handleCoseMenu = () => {
    setShowMenu(false);
  };

  const handleStepSelect = (stepName, stepId) => {
    setSelectedStep(stepName, stepId);
    setSelectedStepId(stepId);
    setShowMenu(false);
  };

  const updatedData = connectionsSteps.find(
    (data) => data._id === selectedStepId
  );
  if (updatedData && selectedStep !== "Rule 1") {
    setSelectedStep(updatedData?.connectionName); // Store the object directly in the state
  }

  console.log("newUpdatedData", updatedData?.connectionName);
  const handleNewStepCreated = (newStep) => {
    console.log("NEWSTEP", newStep);
    setSelectedStep(newStep.connectionName);
    setSelectedStepId(newStep._id);
    setConnectionsSteps((prevSteps) => [...prevSteps, newStep]); // Add the new step to the list
  };

  const handleEditStep = (step) => {
    // setSelectedStep(step.connectionName);
    setSeletedEditStep(step.connectionName);
    setConnectionName(step.connectionName);
    setSeletedEditStepId(step._id);
    // setSelectedStepId(step._id);
    setShowAddNewStep(true); // Open the modal for editing
  };

  const handleCopyStep = (step) => {
    setSeletedEditStep(step);
    setConnectionName(`${step.connectionName} (Copy)`);
    setShowAddNewStep(true); // Open the modal for copying
    setCopyStep(true);
  };

  console.log("selectedEditStep ", seletedEditStep);
  console.log("selectedEditStep ", seletedEditStepId);

  const handleDeletModal = (stepId) => {
    setStepIdToDelete(stepId);
    setShowDeleteModal(true);
  };
  const cancelDeletModal = () => {
    setStepIdToDelete(null);
    setShowDeleteModal(false);
  };

  const deleteConnectionStep = async () => {
    if (!stepIdToDelete) return;
    console.log("Deleting step with ID:", stepIdToDelete);

    try {
      await axios.delete(
        `${url}/connections/${id}/connectionSteps/${stepIdToDelete}`
      );
      setConnectionsSteps(
        connectionsSteps.filter((step) => step._id !== stepIdToDelete)
      );
      setSelectedStep("Rule 1");
      cancelDeletModal();
    } catch (error) {
      console.error("Error deleting step:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  console.log("selctedstep", selectedStep);

  return (
    <div className={styles.dropdownContainer}>
      <button onClick={handleToggleMenu} className={styles.dropdownToggle}>
        {/* {selectedStep ? selectedStep : selectedStep} */}
        {selectedStep}
        <FontAwesomeIcon icon={faChevronDown} className={styles.flowIconDown} />
      </button>
      {showAddNewStep && (
        <AddnewSteps
          onclose={handleCloseAddNewStep}
          onStepCreated={handleNewStepCreated}
          oncloseMenu={handleCoseMenu}
          selectedStep={selectedStep}
          selectedStepId={selectedStepId}
          setConnectionsSteps={setConnectionsSteps}
          connectionsSteps={connectionsSteps}
          setSelectedStep={setSelectedStep}
          setSelectedStepId={setSelectedStepId}
          setSeletedEditStep={setSeletedEditStep}
          seletedEditStep={seletedEditStep}
          setSeletedEditStepId={setSeletedEditStepId}
          seletedEditStepId={seletedEditStepId}
          setConnectionName={setConnectionName}
          connectionName={connectionName}
          copyStep={copyStep}
          setCopyStep={setCopyStep}
        />
      )}
      {showdeleteModal && (
        <ConfirmCancelPopUp
          headerText="Warning"
          bodyText="Are you sure you want to delete this record?"
          onOk={deleteConnectionStep}
          onCancel={cancelDeletModal}
          okButtonText="Ok"
          cancelButtonText="No"
        />
      )}
      {showMenu && (
        <div className={styles.dropdownMenu} ref={menuRef}>
          <div className={styles.dropdownAddItem} onClick={handleAddNewStep}>
            <FontAwesomeIcon icon={faPlus} /> Add new Rule
          </div>
          <div className={styles.dropdownItem}>
            <FontAwesomeIcon icon={faEllipsisV} className="me-1" />{" "}
            <FontAwesomeIcon icon={faEllipsisV} className="me-2" />{" "}
            <span
              className={styles.flowName}
              onClick={() => handleStepSelect("Rule 1")}
            >
              Rule 1
            </span>
            <span className={styles.flowActions}>
              <FontAwesomeIcon icon={faCopy} title="Copy" />
              <FontAwesomeIcon icon={faEdit} title="Edit" />
              <FontAwesomeIcon icon={faTrash} title="Delete" />
            </span>
          </div>

          {/* New div to display connectionSteps */}
          <div className={styles.connectionStepsContainer}>
            {connectionsSteps &&
              connectionsSteps.map((step, index) => (
                <div
                  key={index}
                  className={styles.dropdownItem}
                  onClick={() =>
                    handleStepSelect(step.connectionName, step._id)
                  }
                >
                  <FontAwesomeIcon icon={faEllipsisV} className="me-1" />{" "}
                  <FontAwesomeIcon icon={faEllipsisV} className="me-2" />{" "}
                  <span className={styles.flowName}>{step.connectionName}</span>
                  <span className={styles.flowActions}>
                    <FontAwesomeIcon
                      icon={faCopy}
                      title="Copy"
                      onClick={() => handleCopyStep(step)}
                    />
                    <FontAwesomeIcon
                      icon={faEdit}
                      title="Edit"
                      onClick={() => handleEditStep(step)}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      title="Delete"
                      onClick={() => handleDeletModal(step._id)}
                    />
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
