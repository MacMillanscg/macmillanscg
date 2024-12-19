import React, { useState } from "react";
import styles from "./ForgotPass.module.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { url } from "../../api";

export const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    let errorOccurred = false;
    if (email.length < 1) {
      toast.error("Please enter your email");
      errorOccurred = true;
    }

    if (errorOccurred) {
      return;
    }

    axios
      .post(`${url}/auth/forgot-password`, { email })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          navigate("/login");
        } else {
          toast.dismiss();
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error("User does not exist", err);
      });
  };

  return (
    <div className="authenticate">
      <div className={styles.forgot}>
        <h3 className={styles.heading3}>Forgot Password</h3>
        <p className={styles.para}>
          Please enter your email and you will receive a link to reset your
          password.
        </p>
        <div className="form-group">
          <label className={styles.emailLabel}>Email:</label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail"
            // placeholder="Email*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          onClick={handleSubmit}
          className={`btn w-100 submit mt-2 ${styles.resetPasword}`}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};
