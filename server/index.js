import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
// Make port configurable with fallback to 5000
const DEFAULT_PORT = 5000;
const PORT = process.env.PORT || DEFAULT_PORT;

app.use(express.json());
app.use(cors());

// Initialize database with some sample data if empty
db.get("SELECT COUNT(*) as count FROM Toll_Booth", [], (err, result) => {
  if (err) {
    console.error("Error checking toll booths:", err.message);
    return;
  }

  if (result.count === 0) {
    // Insert sample toll booths
    const boothsData = [
      { Name: "Main Gate", Location: "Highway 101" },
      { Name: "East Gate", Location: "Route 66" },
      { Name: "West Gate", Location: "Interstate 95" },
    ];

    boothsData.forEach((booth) => {
      db.run(
        "INSERT INTO Toll_Booth (Name, Location) VALUES (?, ?)",
        [booth.Name, booth.Location],
        (err) => {
          if (err) console.error("Error inserting booth:", err.message);
        }
      );
    });

    console.log("Sample toll booths added");
  }
});

// Endpoint: Get all vehicles
app.get("/api/vehicles", (req, res) => {
  const sql = "SELECT * FROM Vehicle";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Endpoint: Add a new vehicle
app.post("/api/vehicles", (req, res) => {
  const { LicensePlate, VehicleType } = req.body;

  if (!LicensePlate || !VehicleType) {
    return res
      .status(400)
      .json({ error: "License plate and vehicle type are required" });
  }

  const sql = "INSERT INTO Vehicle (LicensePlate, VehicleType) VALUES (?, ?)";
  db.run(sql, [LicensePlate, VehicleType], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      VehicleID: this.lastID,
      LicensePlate,
      VehicleType,
    });
  });
});

// Endpoint: Get all toll booths
app.get("/api/booths", (req, res) => {
  const sql = "SELECT * FROM Toll_Booth";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Helper function to calculate fee based on vehicle type and violation count
function calculateFee(vehicleType, violationCount) {
  // Define base fees for different vehicle types
  let baseFee = 5.0; // default
  if (vehicleType.toLowerCase() === "car") {
    baseFee = 5.0;
  } else if (vehicleType.toLowerCase() === "truck") {
    baseFee = 10.0;
  } else if (vehicleType.toLowerCase() === "motorcycle") {
    baseFee = 3.0;
  }

  // Define penalty fee for each violation (for example, $20 per violation)
  const violationPenalty = 20.0;

  return baseFee + violationPenalty * violationCount;
}

// Modify the GET checkins endpoint to include violations
app.get("/api/checkins", (req, res) => {
  const sql = `
    SELECT 
      c.*,
      GROUP_CONCAT(v.ViolationType) as ViolationTypes,
      GROUP_CONCAT(v.Fee) as ViolationFees
    FROM Checkin c
    LEFT JOIN Violation v ON c.CheckinID = v.CheckinID
    GROUP BY c.CheckinID
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    // Process the rows to include violations as objects
    const processedRows = rows.map((row) => {
      const violations = [];
      if (row.ViolationTypes) {
        const types = row.ViolationTypes.split(",");
        const fees = row.ViolationFees.split(",").map(Number);

        types.forEach((type, index) => {
          violations.push({
            ViolationType: type,
            Fee: fees[index],
          });
        });
      }

      delete row.ViolationTypes;
      delete row.ViolationFees;

      return {
        ...row,
        Violations: violations,
      };
    });

    res.json(processedRows);
  });
});

// Modify the checkin endpoint to handle violations
app.post("/api/checkins", (req, res) => {
  const { VehicleID, BoothID, Violations = [] } = req.body;

  if (!VehicleID || !BoothID) {
    return res
      .status(400)
      .json({ error: "VehicleID and BoothID are required" });
  }

  // Calculate base fee and total violations fee
  const baseFee = 50; // Base toll fee
  const violationsFee = Violations.reduce((sum, v) => sum + (v.Fee || 0), 0);
  const totalFee = baseFee + violationsFee;

  // Insert the new checkin with the calculated fee
  const insertQuery = `
    INSERT INTO Checkin (VehicleID, BoothID, Fee, CheckinTime) 
    VALUES (?, ?, ?, datetime('now'))
  `;

  db.run(insertQuery, [VehicleID, BoothID, totalFee], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const checkinId = this.lastID;

    // If there are violations, insert them
    if (Violations.length > 0) {
      const violationQuery = `
        INSERT INTO Violation (CheckinID, ViolationType, Fee) 
        VALUES (?, ?, ?)
      `;

      Violations.forEach((violation) => {
        db.run(
          violationQuery,
          [checkinId, violation.ViolationType, violation.Fee],
          (err) => {
            if (err) console.error("Error inserting violation:", err.message);
          }
        );
      });
    }

    // Return the complete checkin data
    res.json({
      CheckinID: checkinId,
      VehicleID,
      BoothID,
      Fee: totalFee,
      Violations,
      CheckinTime: new Date().toISOString(),
    });
  });
});

// Additional endpoints for Vehicles and Violations can be added similarly

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
