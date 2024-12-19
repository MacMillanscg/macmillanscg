import React, { useEffect, useState } from "react";
import styles from "./Summary.module.css";
import { useAppContext } from "../Context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { verifyEShipperCredentials } from "../../Redux/Actions/SummaryActions";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { DotsModal } from "./DotsModal";
import { PrintModal } from "./PrintModal";
import { MockData } from "./MockData";
import { ColumnManagementModal } from "./ColumnManagementModal";
import { StatusPopup } from "./StatusPopup/StatusPopup";
import { TimeRangeFilter } from "./AllTimePopup/TimeRangeFilter ";
import { CustomPagination } from "./CustomPagination/CustomPagination";
import "react-datepicker/dist/react-datepicker.css";
import { getUser } from "../../storageUtils/storageUtils";
import { url } from "../../api";
import { PDFDocument, rgb } from "pdf-lib";
import { ExportModal } from "./ExportModal/ExportModal";
import { ConfirmCancelPopUp } from "../Common/ConfirmCancelPopUp/ConfirmCancelPopUp";
import { useFetchXmlData } from "./hooks/useFetchXmlData";

export const Summary = () => {
  const { dashboardWidth } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [data, setData] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const token = useSelector((state) => state.eshipper.token);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isColumnManagerVisible, setIsColumnManagerVisible] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [timeRange, setTimeRange] = useState("allTime");
  const [showDialog, setShowDialog] = useState(false);
  const [orders, setOrders] = useState([]);
  const [shipmentData, setShipmentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [allShipmentData, setAllShipmentData] = useState([]);
  const initialColumns = [
    { name: "", key: "select", visible: true },
    { name: "Order Number", key: "orderNumber", visible: true },
    { name: "Platform", key: "platform", visible: true },
    { name: "Shipment Status", key: "shipmentStatus", visible: true },
    { name: "Carrier", key: "carrier", visible: true },
    { name: "Client", key: "client", visible: true },
    { name: "Customer", key: "customer", visible: true },
    { name: "Address", key: "address", visible: true },
    { name: "Tracking Number", key: "trackingNumber", visible: true },
    { name: "Tracking URL", key: "trackingUrl", visible: true },
    { name: "Created Date", key: "createdDate", visible: true },
    { name: "Shipped Date", key: "shippedDate", visible: true },
    { name: "Reference", key: "reference", visible: true },
    { name: "Reference2", key: "reference2", visible: true },
    { name: "Reference3", key: "reference3", visible: true },
    { name: "Dimentions", key: "dimentions", visible: true },
    { name: "Weight", key: "weight", visible: true },
    { name: "Labels", key: "labels", visible: true },
    { name: "Downloaded", key: "downloaded", visible: true },
  ];
  const [columns, setColumns] = useState(initialColumns);
  const dispatch = useDispatch();

  const { xmlData, formattedData, shipmentsId, setShipmentsId } =
    useFetchXmlData();

  let userId = getUser();
  userId = userId?._id;

  useEffect(() => {
    const fetchAllClients = async () => {
      try {
        const response = await axios.get(`${url}/clients`);
        const updatedData = response.data;
        const userClients = updatedData.filter(
          (user) => user.userId === userId
        );

        setClients(userClients);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllClients();
  }, [userId]);
  // console.log("clients", clients);

  const filterDataByTimeRange = (data) => {
    const today = new Date();

    // Helper function to normalize dates to remove time components
    const normalizeDate = (date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());

    console.log("Original data:", data); // Log the input data

    if (timeRange === "allTime") {
      return data;
    }

    if (timeRange === "today") {
      return data.filter((item) => {
        const createdDate = new Date(item.created_at);
        const isToday =
          normalizeDate(createdDate).getTime() ===
          normalizeDate(today).getTime();
        console.log(
          "Today Filter - Created Date:",
          createdDate,
          "Normalized Created Date:",
          normalizeDate(createdDate),
          "Normalized Today:",
          normalizeDate(today),
          "Match:",
          isToday
        );
        return isToday;
      });
    } else if (timeRange === "thisWeek") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return data.filter((item) => {
        const createdDate = new Date(item.created_at);
        const isThisWeek =
          normalizeDate(createdDate) >= normalizeDate(startOfWeek);

        return isThisWeek;
      });
    } else if (timeRange === "thisMonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return data.filter((item) => {
        const createdDate = new Date(item.created_at);
        const isThisMonth =
          normalizeDate(createdDate) >= normalizeDate(startOfMonth);

        return isThisMonth;
      });
    } else if (timeRange === "custom" && customStartDate && customEndDate) {
      return data.filter((item) => {
        const createdDate = new Date(item.created_at);
        const isInCustomRange =
          normalizeDate(createdDate) >= normalizeDate(customStartDate) &&
          normalizeDate(createdDate) <= normalizeDate(customEndDate);
        console.log(
          "Custom Range Filter - Created Date:",
          createdDate,
          "Normalized Created Date:",
          normalizeDate(createdDate),
          "Custom Start Date:",
          normalizeDate(customStartDate),
          "Custom End Date:",
          normalizeDate(customEndDate),
          "Match:",
          isInCustomRange
        );
        return isInCustomRange;
      });
    }

    console.log("No filtering applied, returning all data:", data);
    return data;
  };

  // Example usage in useEffect
  useEffect(() => {
    const filtered = filterDataByTimeRange(orders);
    console.log("Filtered data based on selected time range:", filtered);
    setFilteredData(filtered);
  }, [orders, timeRange, customStartDate, customEndDate]);

  const handleColumnManagerClick = () => {
    setIsColumnManagerVisible(true);
  };

  const closeColumnManager = () => {
    setIsColumnManagerVisible(false);
  };

  const handleMenuClick = () => {
    setIsModalVisible(true);
  };

  const handlePrintClick = () => {
    setIsPrintModalVisible(!isPrintModalVisible);
    setIsModalVisible(false);
  };

  const closePrintModal = () => {
    setIsPrintModalVisible(false);
  };

  const handleExportClick = () => {
    setShowExportModal(true); // Open the export modal
    setIsModalVisible(false);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false); // Close the export modal
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    let newItem = [];
    if (value.length > 3) {
      newItem = orders.filter((val, i) => {
        return val.customer.toLowerCase().startsWith(value.toLowerCase());
      });
      setFilteredData(newItem);
    } else {
      setFilteredData(orders);
    }
  };

  const handleRowSelect = (e, rowIndex) => {
    // console.log("reowindex", rowIndex);
    const updatedSelection = [...selectedRows];
    if (e.target.checked) {
      updatedSelection.push(rowIndex);
    } else {
      const index = updatedSelection.indexOf(rowIndex);
      if (index > -1) {
        updatedSelection.splice(index, 1);
      }
    }
    setSelectedRows(updatedSelection);
  };

  const fetchShopifyOrders = async () => {
    try {
      const response = await axios.get(
        `${url}/connections/67053d4b8a2309ab8db347d7/api/orders`
      );
      const orders = response.data.orders;

      const ordersWithPhone = orders.map((order) => {
        const phoneNumber = order.customer?.phone || "No phone provided";
        // console.log("phonenumber", phoneNumber);
        return { ...order, customerPhone: phoneNumber };
      });

      // console.log("orderwith", ordersWithPhone);
      setOrders(ordersWithPhone);
      setFilteredClients(ordersWithPhone);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShopifyOrders();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const sendToEShipper = async () => {
    if (formattedData.length === 0) return;

    const newShipmentsData = formattedData.filter(
      (dataItem) =>
        !shipmentsId.some(
          (idItem) => idItem.shopifyOrderId === dataItem.reference1
        )
    );

    console.log("newShipmentsData", newShipmentsData);

    if (newShipmentsData.length === 0) {
      console.log("All shipments are already created.");
      return; // Skip if there are no new shipments
    }

    try {
      const data = {
        extractedData: [newShipmentsData[0]], // Only send new shipments
        token,
      };

      // Send request to backend
      const response = await axios.put(`${url}/summary/create-shipment`, data);

      // Handle success and failed responses from backend
      console.log("eShipper Response:", response.data?.successResponses[0]);
      const newShipmentIds = response.data.successResponses.map((res) => res);
      console.log("newshipmentIds", newShipmentIds);
      setShipmentsId((prev) => [...prev, ...newShipmentIds]);
    } catch (error) {
      console.error("Error sending data to eShipper:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      sendToEShipper();
    }, 50000);

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [formattedData, token, shipmentsId]);

  const fetchShipmentDetails = async () => {
    try {
      const response = await axios.get(`${url}/summary/getShipments`);

      console.log("Shipment Details:", response.data.shipments);
      setShipmentData(response.data.shipments);
    } catch (error) {
      console.error("Error fetching shipment details:", error);
    }
  };
  console.log("shipmentData", shipmentData);

  useEffect(() => {
    fetchShipmentDetails();
  }, []);

  const cleanShipmentData = (data) => {
    return data.map((item) => {
      const { shipmentData, trackingData, shopifyOrderId, shipmentId } = item;
      const { dimensionUnit, height, length, weight, weightUnit, width } =
        trackingData?.orderDetails?.packages?.packages[0];
      // Extracting necessary fields from shipmentData
      const cleanedData = {
        carrier: shipmentData?.carrier?.carrierName || "",
        shipmentId: shipmentId || "",
        trackingNumber: shipmentData?.trackingNumber || "",
        trackingUrl: shipmentData?.trackingUrl || "",
        reference: shipmentData?.reference?.name || "",
        reference2: shipmentData?.reference2?.name || "",
        reference3: shipmentData?.reference3?.name || "",
        labels: shipmentData?.labelData?.label[0]?.data || "",
        shopifyOrderId: shopifyOrderId || "",

        // Extracting necessary fields from trackingData
        status: trackingData?.status || "",
        dimentions: `${width} x ${length} x ${height} ${dimensionUnit}`,
        weight: `${weight} ${weightUnit}`,
      };

      return cleanedData;
    });
  };

  useEffect(() => {
    const cleanData = cleanShipmentData(shipmentData);
    setAllShipmentData(cleanData);
  }, [shipmentData]);

  // Example usage with shipmentData
  console.log("allShipmentData", allShipmentData);

  console.log("ordrs", orders);
  // console.log("filterclients", filteredClients);

  const handleEShipperClick = () => {
    dispatch(verifyEShipperCredentials("Macmillan_sandbox", "Macmillan@123"));
  };

  useEffect(() => {
    handleEShipperClick();
  }, []);

  const decodeBase64 = (base64String) => {
    try {
      const binaryString = atob(base64String);
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);
      for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes], { type: "application/pdf" });
    } catch (error) {
      console.error("Failed to decode Base64 string:", error);
      return null;
    }
  };

  const handleDownloadClick = async (rowIndex, base64Data) => {
    const trackingNumber = 123456789012;
    if (base64Data) {
      const blob = decodeBase64(base64Data);

      const arrayBuffer = await blob.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      const x = width / 3 - 90;
      const y = height / 3.3;
      const textWidth = 180;
      const textHeight = 16;

      firstPage.drawRectangle({
        x: x - 2,
        y: y - 2,
        width: textWidth,
        height: textHeight,
        color: rgb(1, 1, 1),
        // borderColor: rgb(0, 0, 0),
      });

      firstPage.drawText(`Tracking Number: ${trackingNumber}`, {
        x,
        y,
        size: 10,
        color: rgb(0, 0, 0),
      });
      const pdfBytes = await pdfDoc.save();
      const modifiedBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(modifiedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `label_${trackingNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      const updatedData = [...data];
      updatedData[rowIndex].downloaded = true;
      setData(updatedData);
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const updatedSelection = checked ? orders.map((_, index) => index) : [];
    setSelectedRows(updatedSelection);
  };

  const handleReset = () => {
    setShowDialog(true);
  };

  const handleOk = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    setTimeRange("allTime");
    setCustomStartDate(null);
    setCustomEndDate(null);
    setFilteredData(orders);
    setCurrentPage(1);
    setSelectedRows([]);
    setColumns(initialColumns);
    setShowDialog(false);
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle change in items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page is changed
  };

  return (
    <div
      className={`dashboard ${styles.summaryWrap}`}
      style={{ width: dashboardWidth }}
    >
      <div className={styles.summaryHeader}>
        {showDialog && (
          <ConfirmCancelPopUp
            headerText="Warning"
            bodyText="Do you still want to continue?"
            onOk={handleOk}
            onCancel={handleCancel}
            okButtonText="Ok"
            cancelButtonText="No"
          />
        )}
        <h1 className={styles.title}>Transaction Summary</h1>

        <div className={styles.filters}>
          <div className={styles.searchField}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`form-control me-4 ${styles.searchBar}`}
            />
          </div>
          <div className={styles.filterFields}>
            <div className={`${styles.dateFilters} me-2`}>
              <TimeRangeFilter
                setTimeRange={setTimeRange}
                timeRange={timeRange}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                startDate="Start Date"
                endDate="End Date"
                setCustomStartDate={setCustomStartDate}
                setCustomEndDate={setCustomEndDate}
              />
            </div>
            <div className={styles.columnsManagement}>
              Columns:
              <button
                onClick={handleColumnManagerClick}
                className={styles.manageColumns}
              >
                Show Columns
                <FontAwesomeIcon
                  icon={isColumnManagerVisible ? faChevronUp : faChevronDown}
                  className="ms-2"
                />
              </button>
              {isColumnManagerVisible && (
                <ColumnManagementModal
                  columns={columns}
                  setColumns={setColumns}
                  onClose={closeColumnManager}
                />
              )}
            </div>

            <div className={styles.statusFilter}>
              <StatusPopup
                // statuses={uniqueStatuses}
                selectedStatuses={selectedStatuses}
                setSelectedStatuses={setSelectedStatuses}
              />
            </div>
            <button className={styles.resetBtn} onClick={handleReset}>
              Reset
            </button>

            <div className="dotModal position-relative">
              <div className={styles.dots}>
                <FontAwesomeIcon
                  icon={faEllipsisV}
                  onClick={handleMenuClick}
                  className="p-1 cursor-pointer"
                />
              </div>
              {isModalVisible && (
                <DotsModal
                  handlePrintClick={handlePrintClick}
                  handleExportClick={handleExportClick}
                  setIsModalVisible={setIsModalVisible}
                  onclose={closePrintModal}
                />
              )}
              {isPrintModalVisible && (
                <PrintModal
                  onclose={closePrintModal}
                  selectedRows={selectedRows}
                  filteredClients={filteredClients}
                />
              )}
              {showExportModal && (
                <ExportModal
                  onClose={handleCloseExportModal}
                  selectedRows={selectedRows}
                  filteredClients={filteredClients}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading && (
          <div className={styles.overlay}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading data, please wait...</p>
          </div>
        )}
        <table className={`${styles.table} mt-4`}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === orders.length}
                  onChange={(e) => handleSelectAll(e)}
                />
              </th>
              {columns.map((col) =>
                col.visible ? <th key={col.name}>{col.name}</th> : null
              )}
            </tr>
          </thead>
          <tbody>
            {currentOrders &&
              currentOrders.map((order, index) => {
                const shipment =
                  allShipmentData &&
                  allShipmentData.find(
                    (shipment) =>
                      shipment.shopifyOrderId === order.id.toString()
                  );
                const scheduledShipDated =
                  formattedData &&
                  formattedData.find(
                    (data) => data.reference1 === order.id.toString()
                  );
                console.log("formattedData", formattedData);

                return (
                  <tr key={index}>
                    {columns.map((col, colIndex) => {
                      if (!col.visible) return null; // Skip invisible columns

                      let value = "";
                      switch (col.key) {
                        case "select":
                          value = (
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(index)}
                              onChange={(e) => handleRowSelect(e, index)}
                            />
                          );
                          break;
                        case "orderNumber":
                          value = order.id;
                          break;
                        case "platform":
                          value = "Shopify";
                          break;
                        case "shipmentStatus":
                          value = shipment ? "Ready for shipping" : "";
                          break;
                        case "carrier":
                          value = shipment ? shipment.carrier : "";
                          break;
                        case "client":
                          value = clients[0]?.clientName;
                          break;
                        case "customer":
                          value = `${order.customer.first_name} ${order.customer.last_name}`;
                          break;
                        case "address":
                          value = `${order.customer.default_address.address1} ${order.customer.default_address.city}`;
                          break;
                        case "trackingNumber":
                          value = shipment ? shipment.trackingNumber : "";
                          break;
                        case "trackingUrl":
                          value =
                            shipment && shipment.trackingUrl ? (
                              <a
                                href={shipment.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Url
                              </a>
                            ) : (
                              ""
                            );
                          break;
                        case "createdDate":
                          value = new Date(order.created_at)
                            .toISOString()
                            .split("T")[0];
                          break;
                        case "shippedDate":
                          value =
                            scheduledShipDated?.scheduledShipDate.split(
                              " "
                            )[0] || "";
                          break;
                        case "reference":
                          value = shipment ? shipment.reference : "";
                          break;
                        case "reference2":
                          value = shipment ? shipment.reference2 : "";
                          break;
                        case "reference3":
                          value = shipment ? shipment.reference3 : "";
                          break;
                        case "dimentions":
                          value = shipment ? shipment.dimentions : "";
                          break;
                        case "weight":
                          value = shipment ? shipment.weight : "";
                          break;
                        case "labels":
                          value = shipment ? "Label" : ""; // Placeholder
                          break;
                        case "downloaded":
                          value =
                            shipment && shipment.labels ? (
                              <button
                                onClick={() =>
                                  handleDownloadClick(index, shipment.labels)
                                }
                              >
                                Download
                              </button>
                            ) : (
                              ""
                            );
                          break;
                        default:
                          value = "-";
                          break;
                      }

                      return <td key={colIndex}>{value}</td>;
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {!loading && (
        <CustomPagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handlePageChange={handlePageChange}
          handleItemsPerPageChange={handleItemsPerPageChange}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};
