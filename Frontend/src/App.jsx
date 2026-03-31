import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginUserPage from "./pages/user-login/LoginUserPage";
import RegisterUserPage from "./pages/user-login/RegisterUserPage";
import FirstPage from "./pages/user-login/FirstPage";
import LayoutPage from "./pages/HomeSection/LayoutPage";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/HomeSection/Home";
import StatusPage from "./pages/statusSection/StatusPage";
import SettingPage from "./pages/settingSection/SettingPage";
import SocketManager from "./services/SocketManager.jsx";
import UserProfile from "./pages/userProfile/UserProfile";
import AuthRoute from "./ProtectedRoute/AuthRoute.jsx";
import { VideoCallUI } from "./pages/videoCall/VideoCallUI.jsx";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      <Router>
        <SocketManager />
        <VideoCallUI />
        <Routes>
          <Route path="/welcome" element={<FirstPage />} />
          <Route
            path="/user-login"
            element={
              <AuthRoute>
                <LoginUserPage />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <RegisterUserPage />
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <LayoutPage />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>

        </Routes>
      </Router>
    </>
  );
}

export default App;