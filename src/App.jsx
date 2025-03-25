import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Add this at the start of the component
  console.log("App component rendering");

  // State for data
  const [checkins, setCheckins] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [booths, setBooths] = useState([]);

  // State for form inputs
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedBoothId, setSelectedBoothId] = useState("");

  // State for new vehicle form
  const [newLicensePlate, setNewLicensePlate] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("car");

  // State for feedback
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  // Add this near the top of your component with other state declarations
  const [isLoading, setIsLoading] = useState(false);

  // Add these near your other state declarations
  const [selectedViolations, setSelectedViolations] = useState([]);

  // Add this state near your other state declarations
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(true);

  // Add this constant at the top of your file, outside the component
  const VIOLATIONS = [
    { id: "speeding", name: "Speeding", fee: 100 },
    { id: "roadRage", name: "Road Rage", fee: 200 },
    { id: "noLicense", name: "No License", fee: 150 },
    { id: "redLight", name: "Red Light", fee: 125 },
    { id: "overweight", name: "Overweight Vehicle", fee: 175 },
  ];

  // Add new state for active tab
  const [activeTab, setActiveTab] = useState("register");

  // Add this state for selected checkin
  const [selectedCheckinId, setSelectedCheckinId] = useState(null);

  // Add this helper function for finding selected checkin
  const getSelectedCheckin = () => {
    return checkins.find((c) => c.CheckinID === selectedCheckinId);
  };

  // Add new state for violations
  const [allViolations, setAllViolations] = useState([]);
  const [isLoadingViolations, setIsLoadingViolations] = useState(true);

  // Fetch all data on component mount
  useEffect(() => {
    console.log("useEffect running - fetching data");
    fetchCheckins();
    fetchVehicles();
    fetchBooths();
    fetchAllViolations(); // Add this line
  }, []);

  // Fetch functions
  const fetchCheckins = async () => {
    setIsLoadingCheckins(true);
    try {
      const response = await fetch("http://localhost:5000/api/checkins");
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Checkins API Error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched checkins:", data);

      // Ensure violations array exists and has expected structure
      const sanitizedData = data.map((checkin) => ({
        ...checkin,
        Violations: Array.isArray(checkin.Violations) ? checkin.Violations : [],
        Fee: checkin.Fee || 50, // Default fee if not set
      }));

      setCheckins(sanitizedData);
    } catch (error) {
      console.error("Error fetching checkins:", error);
      showFeedback(
        "Failed to load checkins. Database error occurred.",
        "error"
      );
      setCheckins([]);
    } finally {
      setIsLoadingCheckins(false);
    }
  };

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/vehicles");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched vehicles:", data); // Debug log
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      showFeedback(`Failed to load vehicles: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBooths = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/booths");
      const data = await response.json();
      setBooths(data);
    } catch (error) {
      console.error("Error fetching booths:", error);
      showFeedback("Failed to load toll booths. Please try again.", "error");
    }
  };

  // Add new fetch function
  const fetchAllViolations = async () => {
    setIsLoadingViolations(true);
    try {
      const response = await fetch("http://localhost:5000/api/checkins");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const checkins = await response.json();

      // Extract and flatten all violations from checkins
      const allViolations = checkins.reduce((acc, checkin) => {
        if (checkin.Violations && Array.isArray(checkin.Violations)) {
          const violationsWithMetadata = checkin.Violations.map(
            (violation) => ({
              ...violation,
              CheckinTime: checkin.CheckinTime,
              VehicleID: checkin.VehicleID,
              CheckinID: checkin.CheckinID,
            })
          );
          return [...acc, ...violationsWithMetadata];
        }
        return acc;
      }, []);

      setAllViolations(allViolations);
    } catch (error) {
      console.error("Error fetching violations:", error);
      showFeedback("Failed to load violations.", "error");
    } finally {
      setIsLoadingViolations(false);
    }
  };

  const handleNewVehicleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!newLicensePlate || !newVehicleType) {
      showFeedback(
        "Please enter both license plate and vehicle type.",
        "error"
      );
      return;
    }

    // Check if vehicle with same license plate already exists
    const existingVehicle = vehicles.find(
      (v) => v.LicensePlate.toLowerCase() === newLicensePlate.toLowerCase()
    );

    if (existingVehicle) {
      showFeedback(
        "A vehicle with this license plate already exists.",
        "error"
      );
      return;
    }

    setIsLoading(true);
    try {
      // Add debug logging for request payload
      const payload = {
        LicensePlate: newLicensePlate, // Changed from licensePlate to LicensePlate
        VehicleType: newVehicleType, // Changed from vehicleType to VehicleType
      };
      console.log("Sending payload:", payload);

      const response = await fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Add debug logging for error response
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Response from server:", data);

      if (data.error) {
        showFeedback(`Error: ${data.error}`, "error");
      } else {
        // Update the vehicles list immediately with the new vehicle
        setVehicles((prevVehicles) => [...prevVehicles, data]);

        // Reset form
        setNewLicensePlate("");
        setNewVehicleType("car");

        // Show success message
        showFeedback("Vehicle added successfully!", "success");

        // Refresh the vehicles list
        await fetchVehicles();
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      showFeedback(`Failed to add vehicle: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle checkin submission
  const handleCheckinSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVehicleId || !selectedBoothId) {
      showFeedback("Please select both a vehicle and a toll booth.", "error");
      return;
    }

    // Calculate violations with fees
    const violations = selectedViolations.map((violationId) => {
      const violation = VIOLATIONS.find((v) => v.id === violationId);
      return {
        ViolationType: violation.name, // Changed from Type to ViolationType
        Fee: violation.fee,
      };
    });

    // Calculate total fee including violations
    const baseFee = 50;
    const violationFees = violations.reduce((sum, v) => sum + v.Fee, 0);

    const newCheckin = {
      VehicleID: parseInt(selectedVehicleId),
      BoothID: parseInt(selectedBoothId),
      Fee: baseFee,
      Violations: violations,
      TotalFee: baseFee + violationFees,
    };

    try {
      const response = await fetch("http://localhost:5000/api/checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCheckin),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Checkin response:", data);

      if (data.error) {
        showFeedback(`Error: ${data.error}`, "error");
      } else {
        await fetchCheckins();
        setSelectedVehicleId("");
        setSelectedBoothId("");
        setSelectedViolations([]);
        showFeedback("Checkin added successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding checkin:", error);
      showFeedback("Failed to add checkin. Please try again.", "error");
    }
  };

  // Helper function to show feedback
  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 5000);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Find vehicle and booth names by ID
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.VehicleID === vehicleId);
    return vehicle
      ? `${vehicle.LicensePlate} (${vehicle.VehicleType})`
      : `Vehicle #${vehicleId}`;
  };

  const getBoothName = (boothId) => {
    const booth = booths.find((b) => b.BoothID === boothId);
    return booth ? booth.Name : `Booth #${boothId}`;
  };

  // Add this function near other helper functions
  const handleRefreshTables = async () => {
    await Promise.all([fetchCheckins(), fetchAllViolations()]);
    showFeedback("Tables refreshed successfully!", "success");
  };

  return (
    <div className="app-container">
      <h1>Toll Plaza Management System</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "register" ? "active" : ""}`}
          onClick={() => setActiveTab("register")}
        >
          Vehicle Registration
        </button>
        <button
          className={`tab-button ${activeTab === "checkin" ? "active" : ""}`}
          onClick={() => setActiveTab("checkin")}
        >
          New Checkin
        </button>
        <button
          className={`tab-button ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          Checkin Logs
        </button>
      </div>

      {activeTab === "register" && (
        <div className="card">
          <h2>Vehicle Registration</h2>
          <div className="form">
            <div className="form-group">
              <label>
                License Plate:
                <input
                  type="text"
                  value={newLicensePlate}
                  onChange={(e) => setNewLicensePlate(e.target.value)}
                  required
                  className="text-input"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Vehicle Type:
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value)}
                  className="select-input"
                >
                  <option value="car">Car</option>
                  <option value="truck">Truck</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={handleNewVehicleSubmit}
              className="primary-button"
            >
              Register Vehicle
            </button>
          </div>
        </div>
      )}

      {activeTab === "checkin" && (
        <div className="card">
          <h2>Add New Checkin</h2>
          <form onSubmit={handleCheckinSubmit} className="form">
            <div className="form-group">
              <label>
                Vehicle:
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="select-input"
                  disabled={isLoading}
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.length === 0 ? (
                    <option value="" disabled>
                      No vehicles available
                    </option>
                  ) : (
                    vehicles.map((vehicle) => (
                      <option key={vehicle.VehicleID} value={vehicle.VehicleID}>
                        {vehicle.LicensePlate} ({vehicle.VehicleType})
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>
            <div className="form-group">
              <label>
                Toll Booth:
                <select
                  value={selectedBoothId}
                  onChange={(e) => setSelectedBoothId(e.target.value)}
                  className="select-input"
                >
                  <option value="">-- Select Toll Booth --</option>
                  {booths.map((booth) => (
                    <option key={booth.BoothID} value={booth.BoothID}>
                      {booth.Name} ({booth.Location})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-group">
              <label>Violations:</label>
              <div className="violations-container">
                {VIOLATIONS.map((violation) => (
                  <label key={violation.id} className="violation-checkbox">
                    <input
                      type="checkbox"
                      value={violation.id}
                      checked={selectedViolations.includes(violation.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedViolations([
                            ...selectedViolations,
                            violation.id,
                          ]);
                        } else {
                          setSelectedViolations(
                            selectedViolations.filter((v) => v !== violation.id)
                          );
                        }
                      }}
                    />
                    {violation.name} (${violation.fee})
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="primary-button">
              Record Checkin
            </button>
          </form>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="card">
          <h2>System Logs</h2>
          <div className="logs-container">
            <div className="checkins-section">
              <div className="section-header">
                <h3>Checkin Logs</h3>
                <button
                  onClick={handleRefreshTables}
                  className="refresh-button"
                  disabled={isLoadingCheckins || isLoadingViolations}
                >
                  ↻ Refresh
                </button>
              </div>
              {isLoadingCheckins ? (
                <p>Loading checkins...</p>
              ) : !Array.isArray(checkins) ? (
                <p>Error loading checkins</p>
              ) : checkins.length === 0 ? (
                <p>No checkins available.</p>
              ) : (
                <div className="table-container">
                  <table className="checkins-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Time</th>
                        <th>Vehicle</th>
                        <th>Toll Booth</th>
                        <th>Total Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkins.map((checkin) => (
                        <tr key={checkin.CheckinID || Math.random()}>
                          <td>{checkin.CheckinID || "N/A"}</td>
                          <td>{formatDate(checkin.CheckinTime)}</td>
                          <td>{getVehicleInfo(checkin.VehicleID)}</td>
                          <td>{getBoothName(checkin.BoothID)}</td>
                          <td>
                            $
                            {(
                              (checkin.Fee || 50) +
                              (Array.isArray(checkin.Violations)
                                ? checkin.Violations.reduce(
                                    (sum, v) => sum + (v.Fee || 0),
                                    0
                                  )
                                : 0)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="violations-section">
              <div className="section-header">
                <h3>All Violations</h3>
              </div>
              {isLoadingViolations ? (
                <p>Loading violations...</p>
              ) : !Array.isArray(allViolations) ? (
                <p>Error loading violations</p>
              ) : allViolations.length === 0 ? (
                <p>No violations recorded.</p>
              ) : (
                <div className="table-container">
                  <table className="violations-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Vehicle</th>
                        <th>Violation</th>
                        <th>Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allViolations.map((violation, index) => (
                        <tr key={`${violation.CheckinID}-${index}`}>
                          <td>{formatDate(violation.CheckinTime)}</td>
                          <td>{getVehicleInfo(violation.VehicleID)}</td>
                          <td>{violation.ViolationType}</td>
                          <td>${violation.Fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {feedback.message && (
        <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
      )}
    </div>
  );
}

export default App;
