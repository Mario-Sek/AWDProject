import React, { useState } from "react";
import useLogs from "../../hooks/useLogs";

const initialFormData = {
    ac: "",
    average_fuel: "",
    fuel_liters: "",
    fuel_price: "",
    km_stand: "",
    road_condition: "",
    road_type: "",
    distance_traveled: "",
};

const TestLogs = ({ carId }) => {
    const { logs, onAdd, onDelete } = useLogs(carId);
    const [formData, setFormData] = useState(initialFormData);
    const [open, setOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // Simple validation: prevent empty km_stand or fuel_liters
        if (!formData.km_stand || !formData.fuel_liters) {
            alert("Please fill in at least Kilometers and Fuel Liters.");
            return;
        }

        // Convert numeric fields to numbers
        const preparedData = {
            ...formData,
            km_stand: Number(formData.km_stand),
            fuel_liters: Number(formData.fuel_liters),
            fuel_price: Number(formData.fuel_price),
            distance_traveled: Number(formData.distance_traveled),
            average_fuel: Number(formData.average_fuel),
            carId, // ensure carId is included
        };

        onAdd(preparedData);
        setFormData(initialFormData);
    };

    const styles = {
        container: { marginTop: "1rem", padding: "1rem", background: "#f9fafb", borderRadius: "12px" },
        input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "0.5rem", width: "100%" },
        select: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "0.5rem", width: "100%" },
        button: { padding: "0.5rem 1rem", borderRadius: "8px", border: "none", backgroundColor: "#1d4ed8", color: "#fff", cursor: "pointer", marginTop: "0.5rem" },
        deleteButton: { padding: "0.25rem 0.5rem", borderRadius: "6px", border: "none", backgroundColor: "#ef4444", color: "#fff", cursor: "pointer", marginLeft: "0.5rem" },
        logItem: { background: "#fff", padding: "0.75rem", borderRadius: "10px", marginBottom: "0.5rem", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" },
    };

    return (
        <div style={styles.container}>
            <button style={styles.button} onClick={() => setOpen(!open)}>
                {open ? "Hide Logs" : "Add / Show Logs"}
            </button>

            {open && (
                <div style={{ marginTop: "1rem" }}>
                    <input type="number" name="km_stand" placeholder="Kilometers" value={formData.km_stand} onChange={handleChange} style={styles.input} />
                    <input type="number" name="fuel_liters" placeholder="Fuel Liters" value={formData.fuel_liters} onChange={handleChange} style={styles.input} />
                    <input type="number" name="fuel_price" placeholder="Fuel Price" value={formData.fuel_price} onChange={handleChange} style={styles.input} />
                    <input type="number" name="distance_traveled" placeholder="Distance Traveled" value={formData.distance_traveled} onChange={handleChange} style={styles.input} />
                    <input type="number" name="average_fuel" placeholder="Average Consumption" value={formData.average_fuel} onChange={handleChange} style={styles.input} />
                    <select name="road_condition" value={formData.road_condition} onChange={handleChange} style={styles.select}>
                        <option value="">Road Condition</option>
                        <option value="Summer">Summer</option>
                        <option value="Winter">Winter</option>
                        <option value="Snow">Snow</option>
                        <option value="Rain">Rain</option>
                    </select>
                    <select name="road_type" value={formData.road_type} onChange={handleChange} style={styles.select}>
                        <option value="">Road Type</option>
                        <option value="City">City</option>
                        <option value="Open Road">Open Road</option>
                        <option value="Highway">Highway</option>
                        <option value="Combined">Combined</option>
                    </select>
                    <select name="ac" value={formData.ac} onChange={handleChange} style={styles.select}>
                        <option value="">A/C</option>
                        <option value="true">A/C</option>
                        <option value="false">No A/C</option>
                    </select>
                    <button style={styles.button} onClick={handleSubmit}>Add Log</button>

                    {logs.map((l) => (
                        <div key={l.id} style={styles.logItem}>
                            <div>
                                {l.km_stand} km | {l.fuel_liters} L | {l.fuel_price}$ | {l.average_fuel} L/100 | {l.ac === "true" ? "A/C" : "No A/C"} | {l.road_condition} | {l.road_type}
                                <button style={styles.deleteButton} onClick={() => onDelete(l.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestLogs;
