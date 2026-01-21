/**
 * @file DashboardLayout.jsx
 * @description Main layout component for the MAESTA dashboard with responsive behavior
 * @author Sherif Talaat
 * @version 3.0.0
 * @date 2025-12-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-01-19
 */

import React, {
  useState,
  createContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import styles from "./DashboardLayout.module.css";
import { Outlet } from "react-router-dom";

/**
 * Dashboard context for managing role and sidebar state
 * @type {React.Context}
 */
export const DashboardContext = createContext();

/**
 * Main dashboard layout component with responsive sidebar behavior
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The rendered dashboard layout
 */
const DashboardLayout = ({ children }) => {
  const [currentRole, setCurrentRole] = useState("client");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const resizeTimeoutRef = useRef(null);

  /**
   * Handle responsive behavior based on screen size
   * @function
   */
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      const width = window.innerWidth;
      const mobile = width < 640;

      setIsMobile(mobile);

      // Use functional update to avoid dependency on sidebarOpen
      setSidebarOpen((prevOpen) => {
        if (mobile && prevOpen) {
          return false;
        } else if (!mobile && width >= 968 && !prevOpen) {
          return true;
        }
        return prevOpen;
      });
    }, 100);
  }, []); // Empty dependency array - handleResize is now stable

  /**
   * Toggle sidebar with mobile-friendly behavior
   * @function
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Close sidebar when clicking overlay on mobile
   * @function
   */
  const closeSidebarOnMobile = useCallback(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  // Handle responsive behavior
  useEffect(() => {
    // Initial check
    const initialCheck = () => {
      const width = window.innerWidth;
      const mobile = width < 640;
      setIsMobile(mobile);

      // On mobile, start with sidebar closed
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    initialCheck();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentRole,
      setCurrentRole: (role) => {
        // Validate role before setting
        const validRoles = [
          "client",
          "company",
          "freelancer",
          "jobseeker",
          "admin",
        ];
        if (validRoles.includes(role)) {
          setCurrentRole(role);
        }
      },
      sidebarOpen,
      toggleSidebar,
      isMobile,
    }),
    [currentRole, sidebarOpen, toggleSidebar, isMobile],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className={styles.dashboardLayout}>
        {/* Mobile overlay - closes sidebar when clicked */}
        {isMobile && sidebarOpen && (
          <div
            className={styles.overlay}
            onClick={closeSidebarOnMobile}
            aria-hidden="true"
          />
        )}

        <DashboardSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          isMobile={isMobile}
        />

        <div
          className={`${styles.mainContent} ${sidebarOpen && !isMobile ? styles.sidebarOpen : styles.sidebarClosed
            }`}>
          <DashboardHeader />
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};

export default DashboardLayout;
