import React, { useState, useEffect } from "react";
import { LogsTabHeader } from "../LogsTabHeader";
import styles from "./LogsTab.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBug,
  faInfoCircle,
  faExclamationTriangle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import axios from "axios";
import { url } from "../../../../api";
import { fetchLogs } from "../../../../Redux/Actions/LoggerActions";
import { useSelector, useDispatch } from "react-redux";

const getIconForLogType = (type) => {
  switch (type) {
    case "debug":
      return (
        <FontAwesomeIcon
          icon={faBug}
          className={`${styles.logIcon} ${styles.debug}`}
        />
      );
    case "info":
      return (
        <FontAwesomeIcon
          icon={faInfoCircle}
          className={`${styles.logIcon} ${styles.info}`}
        />
      );
    case "warn":
      return (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className={`${styles.logIcon} ${styles.warn}`}
        />
      );
    case "error":
      return (
        <FontAwesomeIcon
          icon={faTimesCircle}
          className={`${styles.logIcon} ${styles.error}`}
        />
      );
    default:
      return null;
  }
};

export const LogsTab = () => {
  const [client, setClient] = useState([]);
  const [updatedLogs, setUpdatedLogs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10); // Updated to be stateful
  const [logss, setLogss] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { logs } = useSelector((state) => state.logs);
  console.log("Log", logs);
  console.log("Logsss", logss);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}/clients/addclients/logss`);
        setLogss(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    dispatch(fetchLogs());
  }, []);

  useEffect(() => {
    setUpdatedLogs(logs && logs.filter((log) => log.id === id));
  }, [logs]);
  console.log("updatedlog", updatedLogs);

  useEffect(() => {
    const fetchClientSingleRecord = async () => {
      try {
        const response = await axios.get(`${url}/clients/${id}`);
        const clientData = response.data;
        setClient(clientData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchClientSingleRecord();
  }, [id]);

  useEffect(() => {
    const getConnections = async () => {
      setError(null);
      try {
        const response = await axios.get(`${url}/connections`);
        setConnections(response.data);
      } catch (err) {
        setError("Error fetching connections");
      }
    };
    getConnections();
  }, []);

  const filteredConnections = connections?.filter(
    (connection) => connection.client.clientId === id
  );

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = updatedLogs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(updatedLogs.length / logsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle logs per page change
  const handleLogsPerPageChange = (event) => {
    setLogsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to the first page when changing logs per page
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-4">
        <h2>Logs</h2>
        <LogsTabHeader />
      </div>

      <div className={styles.logsContainer}>
        <table className={styles.logsTable}>
          <thead className={styles.tableHead}>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Timestamp</th>
              <th>Connection</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs &&
              currentLogs.map((log, i) => (
                <tr className={styles.logRow} key={i}>
                  <td className="d-flex">
                    {getIconForLogType(log.level)}
                    {log.level}
                  </td>
                  <td>{log.message}</td>
                  <td>{log.timestamp}</td>
                  <td>{filteredConnections[0]?.connectionName}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pageControls}>
        <div className={styles.recordsPerPage}>
          <select
            id="logsPerPage"
            value={logsPerPage}
            onChange={handleLogsPerPageChange}
            className={styles.selectDropdown}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>

        <div className={styles.pagination}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`${styles.paginationButton} ${
              currentPage === 1 ? "" : styles.activeButton
            }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              disabled={currentPage === i + 1}
              className={`${styles.paginationButton} ${
                currentPage === i + 1 ? styles.activeButton : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`${styles.paginationButton} ${
              currentPage === totalPages ? "" : styles.activeButton
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
