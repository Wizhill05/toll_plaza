import sqlite3 from "sqlite3";

// Open a database connection
const db = new sqlite3.Database("./toll_booth.db", (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to SQLite database.");
    // Create tables if they do not exist
    db.serialize(() => {
      // Create tables
      db.run(`
        CREATE TABLE IF NOT EXISTS Toll_Booth (
          BoothID INTEGER PRIMARY KEY AUTOINCREMENT,
          Name TEXT,
          Location TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS Vehicle (
          VehicleID INTEGER PRIMARY KEY AUTOINCREMENT,
          LicensePlate TEXT,
          VehicleType TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS Checkin (
          CheckinID INTEGER PRIMARY KEY AUTOINCREMENT,
          CheckinTime DATETIME DEFAULT CURRENT_TIMESTAMP,
          VehicleID INTEGER,
          BoothID INTEGER,
          Fee REAL,
          FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID),
          FOREIGN KEY (BoothID) REFERENCES Toll_Booth(BoothID)
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS Violation (
          ViolationID INTEGER PRIMARY KEY AUTOINCREMENT,
          CheckinID INTEGER,
          ViolationType TEXT,
          Fee REAL,
          FOREIGN KEY (CheckinID) REFERENCES Checkin(CheckinID)
        )
      `);

      // Check if toll booths exist
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

          const insertStmt = db.prepare(
            "INSERT INTO Toll_Booth (Name, Location) VALUES (?, ?)"
          );

          boothsData.forEach((booth) => {
            insertStmt.run([booth.Name, booth.Location], (err) => {
              if (err) console.error("Error inserting booth:", err.message);
            });
          });

          insertStmt.finalize();
          console.log("Sample toll booths added successfully");
        }
      });
    });
  }
});

export default db;
