import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import logo from "../../assets/images/logo.jpg";
import styles from "./Login.module.css";
import { url } from "../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useCustomFetch } from "../../customsHooks/useCustomFetch";
import { getUser } from "../../storageUtils/storageUtils";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [role, setRole] = useState("");
  // const url = process.env.REACT_APP_API_URL;
  let userId = getUser();
  userId = userId?._id;
  const { data, loading, error } = useCustomFetch(url, userId);

  useEffect(() => {
    if (data) {
      setRole(data.role);
    }
  }, [data]);
  console.log("ROle", role);

  console.log("Backend URL in login file:", process.env.REACT_APP_BACKEND_URL);

  const navigate = useNavigate();

  const loginUser = async () => {
    let errorOccurred = false;
    if (email.length < 1 && password.length < 1) {
      toast.error("Please enter your credentials", { autoClose: 50000 });
      errorOccurred = true;
    }

    if (!errorOccurred) {
      if (email.length < 1) {
        toast.error("Please enter your email", { autoClose: 50000 });
        errorOccurred = true;
      }

      if (password.length < 1) {
        toast.error("Please enter your Password", { autoClose: 50000 });
        errorOccurred = true;
      }
    }

    if (errorOccurred) {
      return;
    }

    const userObj = {
      email,
      password,
    };
    try {
      // toast.loading("Loading");
      const response = await axios.post(`${url}/auth/login`, userObj);
      console.log("response", response);

      // toast.dismiss();
      const { success, data, user, message } = response.data;

      if (success) {
        toast.success(message, { autoClose: 50000 });
        if (rememberMe) {
          localStorage.setItem("rememberMe", response.data.data);
          localStorage.setItem("rememberMeUser", JSON.stringify(user));
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberMeUser");
        }
        sessionStorage.setItem("user", response.data.data);
        sessionStorage.setItem("userRecord", JSON.stringify(user));
        if (user.role === "admin") {
          navigate("/"); // Redirect admin to the dashboard or home
        } else if (user.role === "guest" || user.role === "member") {
          navigate("/summary"); // Redirect guest/member to the summary page
        }
      } else {
        toast.error(response.data.message, { autoClose: 50000 });
      }
    } catch (error) {
      // toast.dismiss();
      toast.error("Something went wrong", { autoClose: 50000 });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      loginUser();
    }
  };

  return (
    <div className="authenticate">
      <div className={styles.login}>
        <div className={styles.logo}>
          <img src={logo} alt="Macmallin logo" />
        </div>
        <h3 className={`text-center ${styles.heading3}`}>MacMillan</h3>
        {/* <form> */}
        <div className="inputFields">
          <div className="form-group">
            <input
              type="email"
              className={`form-control ${styles.formControl}`}
              id="exampleInputEmail"
              placeholder="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group position-relative">
            <input
              type={passwordVisible ? "text" : "password"}
              className={`form-control ${styles.formControl}`}
              id="exampleInputPassword"
              placeholder="Password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <span
              className={`position-absolute end-0 top-50 translate-middle-y ${styles.eyeIcon}`}
              onClick={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility on click
            >
              {passwordVisible ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} />
              )}{" "}
            </span>
          </div>
          <div className="remember d-flex justify-content-between my-2">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="flexCheckIndeterminate"
                value={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label class="form-check-label" for="flexCheckIndeterminate">
                Remember Me
              </label>
            </div>
            <div class={styles.forgot}>
              <Link className={styles.forgotLink} to="/forgot-password">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            onClick={loginUser}
            onKeyPress={handleKeyPress}
            type="submit"
            className={styles.submit}
          >
            Log In
          </button>
          <div className="no-account text-end mt-1">
            <p className={styles.account}>
              Don't have account <Link to="/register">Sign Up here</Link>
            </p>
          </div>
          <p className={`me-3 ${styles.para}`}>
            Powered by <img src={logo} alt="MacMillan" />
          </p>
        </div>
        {/* </form> */}
      </div>
    </div>
  );
};
