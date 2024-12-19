import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { NotFound } from "./Components/NotFound";
import { Register } from "./Components/Register/Register";
import { Login } from "./Components/Login/Login";
import { Dashboard } from "./Components/Dashboard/Dashboard";
import { OtpVerification } from "./Components/OtpVerification/OtpVerification";
import { ResetPassword } from "./Components/ResetPassword/ResetPassword";
import { ForgotPass } from "./Components/ForgotPass/ForgotPass";
import { Layout } from "./Components/Layout";
import { Support } from "./Components/Support/Support";
import { ProfileDetails } from "./Components/ProfileDetails/ProfileDetails";
import { ProfileResetPass } from "./Components/ProfileResetPass/ProfileResetPass";
import { Connections } from "./Components/Connections/Connections";
import { Connectors } from "./Components/Connectors/Connectors";
import { ClientsCom } from "./Components/ClientsCom/ClientsCom";
import { AlertMonitors } from "./Components/AlertMonitors/AlertMonitors";
import { DeployedInstances } from "./Components/DeployedInstances/DeployedInstances";
import { ConnectorList } from "./Components/Connectors/ConnectorList";
import { VerifyEmail } from "./Components/Register/VerifyEmail";
import { ClientDetailsTabs } from "./Components/ClientsCom/ClientDetails/ClientDetailsTabs";
import { ExploreConnections } from "./Components/Explore/Connections/ExploreConnections";
import { Explore } from "./Components/Explore/Explore";
import { Executions } from "./Components/Explore/Executions/Executions";
import { Logss } from "./Components/Explore/Logss/Logss";
import { Users } from "./Components/Explore/Users/Users";
import { IntegrationCanvas } from "./Components/Connections/Webhook/IntegrationCanvas";
import { Summary } from "./Components/Summary/Summary";
import { UserDetails } from "./Components/Explore/Users/UserDetails/UserDetails";

export const AllRoutes = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the role from localStorage or sessionStorage (after login)
    const userRole =
      JSON.parse(localStorage.getItem("rememberMe")) ||
      JSON.parse(sessionStorage.getItem("userRecord"));
    console.log("userRole", userRole);
    if (userRole) {
      setRole(userRole.role);
    } else {
      // Redirect to login if no role is found
      navigate("/login");
    }
  }, [navigate]);

  console.log("role", role);

  return (
    <div>
      <Routes>
        <Route
          element={
            <ProtectedRoutes>
              <Layout />
            </ProtectedRoutes>
          }
        >
          <Route path="/summary" element={<Summary />} />
          {role === "admin" && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profiledetails" element={<ProfileDetails />} />
              <Route path="/profileResetPass" element={<ProfileResetPass />} />
              <Route path="/connectors" element={<Connectors />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/addclients" element={<ClientsCom />} />
              <Route path="/alertmonitors" element={<AlertMonitors />} />
              <Route
                path="/deployedinstances"
                element={<DeployedInstances />}
              />

              <Route
                path="/connectors/connectorList"
                element={<ConnectorList />}
              />
              <Route path="/addclients/:id" element={<ClientDetailsTabs />} />
              <Route path="/explore" element={<Explore />} />
              <Route
                path="/explore/exploreconnections"
                element={<ExploreConnections />}
              />
              <Route path="/explore/executions" element={<Executions />} />
              <Route path="/explore/Logs" element={<Logss />} />
              <Route path="/explore/users" element={<Users />} />
              <Route path="/explore/users/:id" element={<UserDetails />} />
            </>
          )}
        </Route>
        {/* <Route path="/connections/:id" element={<IntegrationCanvas />} /> */}
        <Route
          path="/connections/:id"
          element={
            <ProtectedRoutes>
              <IntegrationCanvas />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoutes>
              <Register />
            </PublicRoutes>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoutes>
              <Login />
            </PublicRoutes>
          }
        />

        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/otpverification" element={<OtpVerification />} />
        <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
        <Route path="/support" element={<Support />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />

        {/* <Route
          path="*"
          element={
            // <ProtectedRoutes>
            // <NotFound />
            // </ProtectedRoutes>
          }
        /> */}
      </Routes>
    </div>
  );
};

export function ProtectedRoutes({ children }) {
  const user = sessionStorage.getItem("user");
  const remember = localStorage.getItem("rememberMe");

  if (remember || user) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}

export function PublicRoutes({ children }) {
  const user = sessionStorage.getItem("user");
  console.log("user", user);
  const remember = localStorage.getItem("rememberMe");
  if (remember || user) {
    return <Navigate to="/" />;
  } else {
    return children;
  }
}
