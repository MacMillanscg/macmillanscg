import React, { useState } from "react";
import { useAppContext } from "../Context/AppContext";
import styles from "./AddClients.module.css";
import toast from "react-hot-toast";
import { url } from "../../api";
import axios from "axios";
import { getUser } from "../../storageUtils/storageUtils";
import { ConfirmCancelPopUp } from "../Common/ConfirmCancelPopUp/ConfirmCancelPopUp";

export const AddClients = ({ closeModal, setFetchTrigger }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { dashboardWidth } = useAppContext();
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [shopifyFields, setShopifyFields] = useState({
    storeUrl: "",
    apiKey: "",
  });
  const [showWarningPopup, setShowWarningPopup] = useState(false); // State for warning popup
  const [isDirty, setIsDirty] = useState(false);

  let userId = getUser();
  userId = userId?._id;

  const [isVerified, setIsVerified] = useState(false);

  const [woocommerceFields, setWooCommerceFields] = useState({
    storeUrl: "",
    consumerKey: "",
    consumerSecret: "",
  });
  const [magentoFields, setMagentoFields] = useState({
    storeUrl: "",
    accessToken: "",
    accessTokenSecret: "",
    consumerKey: "",
    consumerSecret: "",
  });
  const [oauthKeys, setOAuthKeys] = useState({
    oauthKey1: "",
    oauthKey2: "",
  });

  const handleOAuthKeyChange = (e) => {
    const { name, value } = e.target;
    setOAuthKeys((prevKeys) => ({ ...prevKeys, [name]: value }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePlatformChange = (e) => {
    const platform = e.target.value;
    setSelectedPlatform(platform);
  };

  const handleShopifyFieldChange = (e) => {
    const { name, value } = e.target;
    setShopifyFields((prevFields) => ({ ...prevFields, [name]: value }));
    setIsVerified(false); // Reset verification status if fields change
  };

  const handleWooCommerceFieldChange = (e) => {
    const { name, value } = e.target;
    setWooCommerceFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const handleMagentoFieldChange = (e) => {
    const { name, value } = e.target;
    setMagentoFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !email || !phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const cleanedPhone = phone.replace(/[^\d\s+]/g, "");

    try {
      const newClient = {
        clientName,
        email,
        phone: cleanedPhone,
        userId,
      };
      // console.log("newClinet", newClient);

      const response = await axios.post(`${url}/clients/addclients`, newClient);
      setFetchTrigger((prev) => !prev); // Toggle fetchTrigger to re-fetch clients

      console.log("New client created:", response.data);
      toast.success("New client created successfully!");
      setIsDirty(false);
      closeModal();
    } catch (error) {
      console.error("Error creating new client:", error);
      toast.error("Error creating new client. Please try again.");
    }
  };

  const handleNameKeyPress = (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[a-zA-Z ]/.test(char)) {
      e.preventDefault();
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setIsDirty(true); // Mark the form as dirty when any input changes
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const phoneRegex = /^[+\d\s()-]*$/;

    if (phoneRegex.test(value)) {
      setPhone(value.trim());
      setIsDirty(true);
    } else {
      toast.error("Invalid character in phone number.");
    }
  };

  const handleCancelModal = () => {
    if (isDirty) {
      setShowWarningPopup(true); // Show warning if there are unsaved changes
    } else {
      closeModal(); // Close modal directly if no changes
    }
  };

  const handleWarningOk = () => {
    setShowWarningPopup(false);
    closeModal(); // Proceed to close the modal
  };

  const handleWarningCancel = () => {
    setShowWarningPopup(false); // Dismiss the warning popup
  };

  return (
    <div className="dashboard" style={{ width: dashboardWidth }}>
      <div className={styles.modalBackground}>
        <div className={styles.modalContainer}>
          <div className={styles.modalHeader}>
            <h2>Create New Client</h2>
          </div>
          <div className={styles.tabContent}>
            {activeTab === "info" && (
              <>
                <div className={styles.tabPanel}>
                  <label htmlFor="clientName">Client Name:</label>
                  <div className="form-group mb-2">
                    <input
                      type="text"
                      className={`form-control ${styles.formControl}`}
                      id="name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      onKeyPress={handleNameKeyPress}
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
                <div className={styles.tabPanel}>
                  <label htmlFor="clientName">Client Contact:</label>
                  <div className="form-group mb-2">
                    <input
                      type="text"
                      className={`form-control ${styles.formControl}`}
                      id="contactId"
                      value={phone}
                      onChange={handlePhoneChange} // Use the validation handler
                    />
                  </div>
                </div>
                {selectedPlatform === "shopify" && (
                  <div className={styles.platformFields}>
                    <label htmlFor="shopifyStoreUrl">Shopify Store URL:</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      id="shopifyStoreUrl"
                      name="storeUrl"
                      value={shopifyFields.storeUrl}
                      onChange={handleShopifyFieldChange}
                    />
                    <label htmlFor="shopifyApiKey">Shopify API Key:</label>
                    <input
                      className="form-control"
                      type="text"
                      id="shopifyApiKey"
                      name="apiKey"
                      value={shopifyFields.apiKey}
                      onChange={handleShopifyFieldChange}
                    />
                  </div>
                )}
                {selectedPlatform === "woocommerce" && (
                  <div className={styles.platformFields}>
                    <label htmlFor="woocommerceStoreUrl">
                      WooCommerce Store URL:
                    </label>
                    <input
                      className="form-control mb-2"
                      type="text"
                      id="woocommerceStoreUrl"
                      name="storeUrl"
                      value={woocommerceFields.storeUrl}
                      onChange={handleWooCommerceFieldChange}
                    />
                    <label htmlFor="woocommerceConsumerKey">
                      WooCommerce Consumer Key:
                    </label>
                    <input
                      className="form-control mb-2"
                      type="text"
                      id="woocommerceConsumerKey"
                      name="consumerKey"
                      value={woocommerceFields.consumerKey}
                      onChange={handleWooCommerceFieldChange}
                    />
                    <label htmlFor="woocommerceConsumerSecret">
                      WooCommerce Consumer Secret:
                    </label>
                    <input
                      className="form-control mb-2"
                      type="text"
                      id="woocommerceConsumerSecret"
                      name="consumerSecret"
                      value={woocommerceFields.consumerSecret}
                      onChange={handleWooCommerceFieldChange}
                    />
                  </div>
                )}
                {selectedPlatform === "magento" && (
                  <div className={styles.platformFields}>
                    <label htmlFor="magentoStoreUrl">Magento Store URL:</label>
                    <input
                      className="form-control mb-2"
                      type="text"
                      id="magentoStoreUrl"
                      name="storeUrl"
                      value={magentoFields.storeUrl}
                      onChange={handleMagentoFieldChange}
                    />
                    <label htmlFor="magentoAccessToken">
                      Magento Access Token:
                    </label>
                    <input
                      className="form-control mb-2"
                      type="text"
                      id="magentoAccessToken"
                      name="accessToken"
                      value={magentoFields.accessToken}
                      onChange={handleMagentoFieldChange}
                    />
                    <label htmlFor="magentoAccessTokenSecret">
                      Magento Access Token Secret:
                    </label>
                    <input
                      className="form-control mb-2"
                      type="text"
                      id="magentoAccessTokenSecret"
                      name="accessTokenSecret"
                      value={magentoFields.accessTokenSecret}
                      onChange={handleMagentoFieldChange}
                    />
                    <label htmlFor="magentoConsumerKey">
                      Magento Consumer Key:
                    </label>
                    <input
                      className="form-control mb-2"
                      type="text"
                      id="magentoConsumerKey"
                      name="consumerKey"
                      value={magentoFields.consumerKey}
                      onChange={handleMagentoFieldChange}
                    />
                    <label htmlFor="magentoConsumerSecret">
                      Magento Consumer Secret:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="magentoConsumerSecret"
                      name="consumerSecret"
                      value={magentoFields.consumerSecret}
                      onChange={handleMagentoFieldChange}
                    />
                  </div>
                )}
              </>
            )}
            {activeTab === "connections" && (
              <div className={` ${styles.tabPanel} pt-3`}>
                <label htmlFor="oauthKey1">OAuth Key:</label>
                <input
                  className="form-control"
                  type="text"
                  id="oauthKey1"
                  name="oauthKey1"
                  // value={oauthKeys.oauthKey1}
                  // onChange={handleOAuthKeyChange}
                />
              </div>
            )}
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={handleCancelModal}>
              Cancel
            </button>
            <button onClick={handleSubmit} className={styles.addButton}>
              Add
            </button>
          </div>
        </div>
      </div>
      {showWarningPopup && (
        <ConfirmCancelPopUp
          headerText="Warning"
          bodyText="You have unsaved data. Do you want to continue?"
          onOk={handleWarningOk}
          onCancel={handleWarningCancel}
          okButtonText="Yes"
          cancelButtonText="No"
        />
      )}
    </div>
  );
};
