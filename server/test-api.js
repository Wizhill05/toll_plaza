import fetch from "node-fetch";

async function testAPI() {
  try {
    // Test GET /api/vehicles
    console.log("\nTesting GET /api/vehicles");
    const vehiclesResponse = await fetch("http://localhost:5000/api/vehicles");
    const vehicles = await vehiclesResponse.json();
    console.log("Vehicles:", vehicles);

    // Test GET /api/booths
    console.log("\nTesting GET /api/booths");
    const boothsResponse = await fetch("http://localhost:5000/api/booths");
    const booths = await boothsResponse.json();
    console.log("Booths:", booths);

    // Test POST /api/checkins
    console.log("\nTesting POST /api/checkins");
    const checkinResponse = await fetch("http://localhost:5000/api/checkins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        VehicleID: 1,
        BoothID: 1,
        Violations: [{ ViolationType: "Speeding", Fee: 100 }],
      }),
    });
    const checkin = await checkinResponse.json();
    console.log("New Checkin:", checkin);
  } catch (error) {
    console.error("API Test Error:", error);
  }
}

testAPI();
