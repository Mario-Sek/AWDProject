import React, { useState } from "react";
import useLogs from "../../hooks/useLogs";

const CarLogsDashboard = ({ carId }) => {
    const { logs, onAdd, onDelete } = useLogs(carId);
    const [logForm, setLogForm] = useState({
        km_stand: "",
        fuel_liters: "",
        fuel_price: "",
        distance_traveled: "",
        average_fuel: "",
        road_condition: "",
        road_type: "",
        ac: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLogForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onAdd({ ...logForm, createdAt: new Date() });
        setLogForm({
            km_stand: "",
            fuel_liters: "",
            fuel_price: "",
            distance_traveled: "",
            average_fuel: "",
            road_condition: "",
            road_type: "",
            ac: "",
        });
    };

    // Calculate average fuel consumption
    const totalDistance = logs.reduce((sum, l) => sum + Number(l.distance_traveled || 0), 0);
    const totalFuel = logs.reduce((sum, l) => sum + Number(l.fuel_liters || 0), 0);
    const avgFuelConsumption = totalDistance && totalFuel ? (totalFuel / totalDistance) * 100 : 0;

    return (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
            <h4>Car Logs Dashboard</h4>
            <div style={{ marginBottom: "1rem" }}>
                <strong>Total Logs:</strong> {logs.length} <br />
                <strong>Total Distance:</strong> {totalDistance} km <br />
                <strong>Total Fuel:</strong> {totalFuel.toFixed(2)} L <br />
                <strong>Average Fuel Consumption:</strong> {avgFuelConsumption.toFixed(2)} L/100km
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <h5>Add New Log</h5>
                <input type="number" name="km_stand" placeholder="Kilometers" value={logForm.km_stand} onChange={handleChange} />
                <input type="number" name="fuel_liters" placeholder="Fuel Liters" value={logForm.fuel_liters} onChange={handleChange} />
                <input type="number" name="fuel_price" placeholder="Fuel Price" value={logForm.fuel_price} onChange={handleChange} />
                <input type="number" name="distance_traveled" placeholder="Distance Traveled" value={logForm.distance_traveled} onChange={handleChange} />
                <input type="number" name="average_fuel" placeholder="Average Fuel" value={logForm.average_fuel} onChange={handleChange} />
                <select name="road_condition" value={logForm.road_condition} onChange={handleChange}>
                    <option value="">Road Condition</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Snow">Snow</option>
                    <option value="Rain">Rain</option>
                </select>
                <select name="road_type" value={logForm.road_type} onChange={handleChange}>
                    <option value="">Road Type</option>
                    <option value="City">City</option>
                    <option value="Open Road">Open Road</option>
                    <option value="Highway">Highway</option>
                    <option value="Combined">Combined</option>
                </select>
                <select name="ac" value={logForm.ac} onChange={handleChange}>
                    <option value="">A/C</option>
                    <option value="true">A/C</option>
                    <option value="false">No A/C</option>
                </select>
                <button onClick={handleSubmit}>Add Log</button>
            </div>

            <div>
                <h5>All Logs</h5>
                {logs.map((l) => (
                    <div key={l.id} style={{ padding: "0.5rem", marginBottom: "0.5rem", background: "#fff", borderRadius: "6px" }}>
                        {l.km_stand} km | {l.fuel_liters} L | {l.average_fuel} L/100 | {l.road_condition} | {l.road_type} | {l.ac === "true" ? "A/C" : "No A/C"}
                        <button onClick={() => onDelete(l.id)} style={{ marginLeft: "0.5rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarLogsDashboard;
