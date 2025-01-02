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
import { Spinner } from "../Spinner/Spinner";
import { fetchConnections } from "../../Redux/Actions/ConnectionsActions";
// import { eShipperUsername } from "../../api";
// import { eShipperPassword } from "../../api";

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
  const [connectionId, setConnectionId] = useState("23523452523452");
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
  const { connections, error } = useSelector((state) => state.connections);
  const dispatch = useDispatch();
  console.log("connectinos", connections);
  const abc = "asdfkjasdkj";

  const eShipperUsername = process.env.REACT_APP_ESHIPPER_USERNAME;
  const eShipperPassword = process.env.REACT_APP_ESHIPPER_PASSWORD;
  console.log("eShipperUsername" , eShipperUsername)
  console.log("eShipperPassword" , eShipperPassword)

  const { xmlData, formattedData, shipmentsId, setShipmentsId } =
    useFetchXmlData();

  let userId = getUser();
  userId = userId?._id;

  useEffect(() => {
    const fetchAllConncections = async () => {
      try {
        const response = await axios.get(`${url}/summary`);
        if (response.data) {
          // setConnectionId(response?.data[0]?._id);
          // console.log("response", response?.data[0]?._id);
          console.log("testing")
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllConncections();
  }, [connectionId]);

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
    fetchConnections();
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


  console.log("connecitonid", connectionId);

  const fetchShopifyOrders = async () => {
    if (!connectionId) return;
    try {
      const response = await axios.get(
        `${url}/connections/${connectionId}/api/orders`
      );
      console.log("testing");
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
    }, 4000);

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
    dispatch(verifyEShipperCredentials(eShipperUsername, eShipperPassword));
  };

  useEffect(() => {
    handleEShipperClick();
  }, []);

  const decodeBase64 = (base64String, fileType = "application/octet-stream") => {
    try {
      const binaryString = atob(base64String.replace(/\s/g, ""));
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);
      for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes], { type: fileType });
    } catch (error) {
      console.error("Failed to decode Base64 string:", error);
      return null;
    }
  };
  
  const handleDownloadClick = async (rowIndex, base64Data, trackingNumber) => {
    try {
      // Validate base64 data
      if (!base64Data || typeof base64Data !== "string") {
        throw new Error("Invalid base64 data");
      }
  
      let pdfBytes;
    // Use trackingNumber or a fallback name
  
      if (base64Data.startsWith("JVBERi0")) {
        // Handle PDF data
        const blob = decodeBase64(base64Data, "application/pdf");
  
        if (!blob) {
          throw new Error("Failed to decode Base64 string");
        }
  
        const arrayBuffer = await blob.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
  
        // Save the unmodified PDF
        pdfBytes = await pdfDoc.save();
      } else if (base64Data.startsWith("iVBORw0KGgoAAAANSU")) {
        // Handle PNG image data and embed it in a PDF
        const blob = decodeBase64(base64Data, "image/png");
  
        if (!blob) {
          throw new Error("Failed to decode Base64 string");
        }
  
        const arrayBuffer = await blob.arrayBuffer();
        const pdfDoc = await PDFDocument.create();
        const pngImage = await pdfDoc.embedPng(new Uint8Array(arrayBuffer));
  
        const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pngImage.width,
          height: pngImage.height,
        });
  
        pdfBytes = await pdfDoc.save();
      } else {
        throw new Error("Unsupported file type or invalid base64 data");
      }
  
      // Create a Blob and trigger download
      const modifiedBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(modifiedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Label_${trackingNumber}.pdf`; // Use trackingNumber as filename
      link.click();
      URL.revokeObjectURL(url);
  
      // Safely update the data array
      if (Array.isArray(data) && data[rowIndex]) {
        const updatedData = [...data];
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          downloaded: true,
        };
        setData(updatedData);
      } else {
        console.warn(`Row at index ${rowIndex} does not exist in the data array.`);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to process the file. Please try again.");
    }
  };
  
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
  
    if (checked) {
      const allRows = [
        ...(currentOrders || []),
        ...allShipmentData.filter(
          (shipment) =>
            !currentOrders?.some((order) => order.id.toString() === shipment.shopifyOrderId)
        ),
      ];
      setSelectedRows(allRows); // Store all rows when "select all" is checked
    } else {
      setSelectedRows([]); // Clear selection when "select all" is unchecked
    }
  };
  
  const handleRowSelect = (e, rowIndex, rowData, scheduledDate) => {
    const checked = e.target.checked;
    const updatedSelection = [...selectedRows];
  
    if (checked) {
      // Add the row data and scheduledDate to the selected rows
      updatedSelection.push({
        rowData,
        scheduledDate,
      });
    } else {
      // Remove the row data from the selected rows
      const indexToRemove = updatedSelection.findIndex(
        (selected) => selected.rowData === rowData
      );
      if (indexToRemove > -1) {
        updatedSelection.splice(indexToRemove, 1);
      }
    }
    setSelectedRows(updatedSelection);
  };
  

  console.log("slectedRow" , selectedRows)

  const extractFields = (data) => {
    return data.map(item => ({
        carrier: item.rowData.carrier,
        shipmentId: item.rowData.shipmentId,
        trackingNumber: item.rowData.trackingNumber,
        trackingUrl: item.rowData.trackingUrl,
        reference: item.rowData.reference,
        reference2: item.rowData.reference2,
        reference3: item.rowData.reference3,
        shopifyOrderId: item.rowData.shopifyOrderId,
        dimensions: item.rowData.dimentions, // Correct spelling as "dimensions"
        weight: item.rowData.weight,
        attention: item.scheduledDate.from.attention,
        address1: item.scheduledDate.from.address1,
    }));
};

const result = extractFields(selectedRows);
console.log("resutl" ,result);
  

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
                  result={result}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Spinner isLoading={loading} message="Loading data, please wait..." />
        <table className={`${styles.table} mt-4`}>
  <thead>
    <tr>
      <th>
        <input
          type="checkbox"
          checked={selectedRows.length === currentOrders.length + allShipmentData.length}
          onChange={(e) => handleSelectAll(e)}
        />
      </th>
      {columns.map((col) =>
        col.visible ? <th key={col.name}>{col.name}</th> : null
      )}
    </tr>
  </thead>
  <tbody>
    {[
      ...(currentOrders || []),
      ...allShipmentData.filter(
        (shipment) =>
          !currentOrders?.some((order) => order.id.toString() === shipment.shopifyOrderId)
      ),
    ].map((item, index) => {
      const isOrder = currentOrders?.some((order) => order.id === item.id);
      const order = isOrder ? item : null;

      const shipment = allShipmentData?.find(
        (shipment) =>
          shipment.shopifyOrderId === (order ? order.id.toString() : item.shopifyOrderId)
      );
      console.log("shipent" , shipment)

      const scheduledShipDated = formattedData?.find(
        (data) =>
          data.reference1 === (order ? order.id.toString() : shipment?.shopifyOrderId)
      );
      console.log("scheduledShipment" , scheduledShipDated)

      return (
        <tr key={index}>
          {columns.map((col, colIndex) => {
            if (!col.visible) return null;

            let value = "";
            switch (col.key) {
              case "select":
                value = (
                  <input
                    type="checkbox"
                    checked={selectedRows.some((selected) => selected.rowData === item)}
                    onChange={(e) =>
                      handleRowSelect(e, index, item, scheduledShipDated)
                    }
                  />
                );
                break;
              case "orderNumber":
                value = order ? order.id : shipment?.shopifyOrderId;
                break;
              case "platform":
                value = order ? "Shopify" : "Shipment";
                break;
              case "shipmentStatus":
                value = shipment ? "Ready for shipping" : "";
                break;
              case "carrier":
                value = shipment?.carrier || "";
                break;
              case "client":
                value = clients[0]?.clientName;
                break;
              case "customer":
                value = scheduledShipDated?.from?.attention || "-";
                break;
              case "address":
                value = scheduledShipDated?.from?.address1 || "-";
                break;
              case "trackingNumber":
                value = shipment?.trackingNumber || "";
                break;
              case "trackingUrl":
                value = shipment?.trackingUrl ? (
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
                value = order
                  ? new Date(order.created_at).toISOString().split("T")[0]
                  : "-";
                break;
              case "shippedDate":
                value =
                  scheduledShipDated?.scheduledShipDate?.split(" ")[0] || "-";
                break;
              case "reference":
                value = shipment?.reference || "-";
                break;
              case "reference2":
                value = shipment?.reference2 || "-";
                break;
              case "reference3":
                value = shipment?.reference3 || "-";
                break;
              case "dimentions":
                value = shipment?.dimentions || "-";
                break;
              case "weight":
                value = shipment?.weight || "-";
                break;
              case "labels":
                value = shipment ? "Label" : ""; // Placeholder
                break;
              case "downloaded":
                value = shipment?.labels ? (
                  <button
                    onClick={() =>
                      handleDownloadClick(index, shipment.labels, shipment.trackingNumber)
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
