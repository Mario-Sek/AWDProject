import React, {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import useCars from "../../hooks/useCars";
import {useAuth} from "../../hooks/useAuth";

import {
    Line,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

const conditionColors = {
    city: "#1d4ed8",
    highway: "#10b981",
    offroad: "#ef4444",
    mixed: "#f59e0b",
};

const conditions = ["city", "highway", "offroad", "mixed"];
const VERCEL_BASE_URL = "https://carapi-zeta.vercel.app";

const CarDetailsPage = () => {
    const {id} = useParams();
    const {user} = useAuth();
    const {cars, onUpdate, findById} = useCars();
    const [car, setCar] = useState(null);
    const [logs, setLogs] = useState([]);
    const [newLog, setNewLog] = useState({
        date: "",
        liters: "",
        km: "",
        price: "",
        condition: "city",
        km_stand: "",
        ac: "false"
    });

    const [makes, setMakes] = useState([]);

    useEffect(() => {
        const foundCar = findById(id);
        setCar(foundCar || null);
        const sorted = (foundCar?.logs || [])
            .map((log, idx) => ({...log, _id: idx}))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        setLogs(sorted);

        const fetchMakes = async () => {
            try {
                const res = await fetch(`${VERCEL_BASE_URL}/api/makes`);
                const data = await res.json();
                setMakes(Array.isArray(data) ? data : data.data || []);
            } catch (err) {
                console.error(err);
                setMakes([]);
            }
        };
        fetchMakes();
    }, [id, cars, findById]);


    const { chartData, averageConsumption, consumptionByCondition, tableRows } = useMemo(() => {
        if (!logs || logs.length === 0) {
            return {
                chartData: [],
                averageConsumption: 0,
                consumptionByCondition: Object.fromEntries(conditions.map(c => [c, 0])),
                tableRows: [],
            };
        }

        let totalLiters = 0;
        let totalKm = 0;
        const condSums = Object.fromEntries(conditions.map(c => [c, { liters: 0, km: 0 }]));

        const chart = [];
        const rowsForTable = logs.map(l => {
            const liters = Number(l.liters);
            const distance = Number(l.km);

            if (!isFinite(distance) || distance <= 0 || !isFinite(liters) || liters <= 0) {
                return { ...l, consumption: null };
            }

            const consumption = (liters / distance) * 100;
            totalLiters += liters;
            totalKm += distance;

            if (condSums[l.condition]) {
                condSums[l.condition].liters += liters;
                condSums[l.condition].km += distance;
            }

            chart.push({
                date: l.date,
                ...Object.fromEntries(
                    conditions.map(c => [c, l.condition === c ? consumption : null])
                )
            });

            return { ...l, consumption };
        });

        const overallAvg = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;
        const condAvg = Object.fromEntries(
            conditions.map(c => {
                const { liters, km } = condSums[c];
                return [c, km > 0 ? (liters / km) * 100 : 0];
            })
        );

        return { chartData: chart, averageConsumption: overallAvg, consumptionByCondition: condAvg, tableRows: rowsForTable };
    }, [logs]);


    /*const {chartData, averageConsumption, consumptionByCondition, tableRows} =
        useMemo(() => {
            if (!logs || logs.length < 2) {
                return {
                    chartData: [],
                    averageConsumption: 0,
                    consumptionByCondition: Object.fromEntries(
                        conditions.map((c) => [c, 0])
                    ),
                    tableRows: logs.map((l) => ({...l, consumption: null})),
                };
            }

            const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
            let totalLiters = 0;
            let totalKm = 0;
            const condSums = Object.fromEntries(
                conditions.map((c) => [c, {liters: 0, km: 0}])
            );

            const chart = [];

            const rowsForTable = sorted.map((l) => {
                const liters = Number(l.liters);
                const distance = Number(l.km);

                if (!isFinite(distance) || distance <= 0 || !isFinite(liters) || liters <= 0) {
                    return {...l, consumption: null};
                }

                const consumption = (liters / distance) * 100;
                return {...l, consumption};
            });

            for (let i = 1; i < sorted.length; i++) {
                const prev = sorted[i - 1];
                const curr = sorted[i];

                const distance = Number(curr.km) - Number(prev.km);
                const liters = Number(curr.liters);

                if (!isFinite(distance) || distance <= 0 || !isFinite(liters) || liters <= 0)
                    continue;

                const consumption = (liters / distance) * 100;
                totalLiters += liters;
                totalKm += distance;

                if (condSums[curr.condition]) {
                    condSums[curr.condition].liters += liters;
                    condSums[curr.condition].km += distance;
                }

                rowsForTable[i].consumption = consumption;

                chart.push({
                    date: curr.date,
                    ...Object.fromEntries(
                        conditions.map((c) => [
                            c,
                            curr.condition === c ? consumption : null,
                        ])
                    ),
                });
            }

            const overallAvg = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;
            const condAvg = Object.fromEntries(
                conditions.map((c) => {
                    const {liters, km} = condSums[c];
                    return [c, km > 0 ? (liters / km) * 100 : 0];
                })
            );

            return {
                chartData: chart,
                averageConsumption: overallAvg,
                consumptionByCondition: condAvg,
                tableRows: rowsForTable,
            };
        }, [logs]);*/

    const makeName = car
        ? makes.find((m) => String(m.id) === String(car.make))?.name || car.make
        : "";

    const handleLogChange = (e) =>
        setNewLog((prev) => ({...prev, [e.target.name]: e.target.value}));

    const handleAddLog = () => {
        if (!newLog.date || !newLog.liters || !newLog.km) {
            alert("Please fill in date, liters, and km.");
            return;
        }

        const logEntry = {
            ...newLog,
            liters: parseFloat(newLog.liters),
            km: parseFloat(newLog.km),
            price: parseFloat(newLog.price || 0),
            _id: Date.now(),
        };

        const updated = [...logs, logEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
        setLogs(updated);
        if (car) onUpdate({...car, logs: updated}, car.id);

        setNewLog({date: "", liters: "", km: "", price: "", condition: "city", km_stand: "", ac: "false"});
    };

    const handleDeleteLog = (id) => {
        const updated = logs.filter((log) => log._id !== id);
        setLogs(updated);
        if (car) onUpdate({...car, logs: updated}, car.id);
    };

    if (!car) return <div style={{padding: "2rem"}}>Car not found</div>;

    return (
        <div style={{maxWidth: "900px", margin: "2rem auto", fontFamily: "'Inter', sans-serif"}}>
            <div style={{display: "flex", gap: "2rem", marginBottom: "2rem", flexWrap: "wrap"}}>
                {car.image && (
                    <img
                        src={car.image}
                        alt={`${car.model}`}
                        style={{width: "300px", height: "200px", objectFit: "cover", borderRadius: "12px"}}
                    />
                )}
                <div style={{flex: 1}}>
                    <h2>{makeName} {car.model} ({car.year})</h2>
                    <p><strong>Plate:</strong> {car.reg_plate}</p>
                    <p><strong>Fuel:</strong> {car.fuel}</p>
                    <p><strong>Horsepower: </strong> {car.hp} HP</p>
                    <div style={{
                        marginTop: "0.75rem",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "0.5rem"
                    }}>
                        <div style={{background: "#f8fafc", borderRadius: 8, padding: "8px 10px"}}>
                            <div style={{fontSize: 12, color: "#64748b"}}>Overall Avg</div>
                            <div style={{fontSize: 18, fontWeight: 600}}>{averageConsumption.toFixed(2)} L/100km</div>
                        </div>
                        {conditions.map((cond) => (
                            <div key={cond} style={{
                                background: "#f8fafc",
                                borderRadius: 8,
                                padding: "8px 10px",
                                borderLeft: `4px solid ${conditionColors[cond]}`
                            }}>
                                <div style={{fontSize: 12, color: "#64748b", textTransform: "capitalize"}}>{cond} Avg
                                </div>
                                <div style={{fontSize: 18, fontWeight: 600, color: conditionColors[cond]}}>
                                    {consumptionByCondition[cond].toFixed(2)} L/100km
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{marginBottom: "2rem", padding: "1rem"}}>
                <h3 style={{marginBottom: "1rem", fontWeight: 600}}>Fuel Consumption Over Time</h3>

                <div
                    style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem"}}>
                    {conditions.map((cond) => (
                        <div
                            key={cond}
                            style={{
                                background: "#fff",
                                borderRadius: "12px",
                                padding: "1rem",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            }}
                        >
                            <h4 style={{marginBottom: "0.5rem"}}>{cond}</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                                    <XAxis
                                        dataKey="date"
                                        tick={{fontSize: 12, fill: "#333"}}
                                        tickFormatter={(d) =>
                                            new Date(d).toLocaleDateString("en-US", {month: "short", day: "numeric"})
                                        }
                                    />
                                    <YAxis tick={{fontSize: 12, fill: "#333"}} unit=" L/100km"/>
                                    <Tooltip
                                        contentStyle={{background: "#fff", color: "#000", borderRadius: 6}}
                                        formatter={(val) => val.toFixed(2) + " L/100km"}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={cond}
                                        stroke={conditionColors[cond]} // make sure it's visible on white
                                        strokeWidth={3}
                                        dot={{r: 4}}
                                        activeDot={{r: 6}}
                                        connectNulls
                                        isAnimationActive={true}
                                    />
                                    <ReferenceLine
                                        y={averageConsumption}
                                        stroke="#ff5722"
                                        strokeDasharray="4 4"
                                        label={{
                                            value: `Avg: ${averageConsumption.toFixed(2)}`,
                                            position: "insideTopRight",
                                            fill: "#333",
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </div>


            {/* Logs Table */}
            <div style={{
                background: "#fff",
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}>
                <h3>Fuel Logs</h3>
                {tableRows.length === 0 ? (
                    <p>No logs yet.</p>
                ) : (
                    <table style={{width: "100%", borderCollapse: "collapse"}}>
                        <thead>
                        <tr style={{borderBottom: "1px solid #ddd"}}>
                            <th>Current kilometers</th>
                            <th>Liters</th>
                            <th>Trip in km</th>
                            <th>Price paid for fuel</th>
                            <th>Condition</th>
                            <th>A/C</th>
                            <th>Consumption</th>
                            <th>Date</th>
                            {car.userId === user.uid ?
                                <th>Action</th> : ""}
                        </tr>
                        </thead>
                        <tbody>
                        {tableRows.map((log) => (
                            <tr key={log._id} style={{borderBottom: "1px solid #f0f0f0"}}>
                                <td>{log.km_stand}</td>
                                <td>{log.liters}</td>
                                <td>{log.km}</td>
                                <td>{log.price}</td>
                                <td style={{color: conditionColors[log.condition]}}>{log.condition}</td>
                                <td>{log.ac ? "A/C" : "No A/C"}</td>
                                <td>{log.consumption != null ? log.consumption.toFixed(2) : "-"}</td>
                                <td>{log.date}</td>
                                <td>
                                    {car.userId === user.uid?
                                    <button
                                        onClick={() => handleDeleteLog(log._id)}
                                        style={{
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            backgroundColor: "#ef4444",
                                            color: "#fff",
                                            border: "none",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Delete
                                    </button> : ""}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>


            <div style={{
                marginTop: "2rem",
                background: "#fff",
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}>
                <h3>Add New Log</h3>
                <div style={{
                    display: "grid",
                    gap: "0.5rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
                }}>
                    <input type="number" name="km_stand" placeholder="Current kilometers" value={newLog.km_stand}
                           onChange={handleLogChange}/>
                    <input type="number" name="liters" placeholder="Liters" value={newLog.liters}
                           onChange={handleLogChange}/>
                    <input type="number" name="km" placeholder="Distance driven" value={newLog.km}
                           onChange={handleLogChange}/>
                    <input type="number" name="price" placeholder="Price paid for fuel" value={newLog.price}
                           onChange={handleLogChange}/>
                    <select name="condition" value={newLog.condition} onChange={handleLogChange}>
                        {conditions.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <input type="date" name="date" value={newLog.date} onChange={handleLogChange}/>
                    <select name="ac" value={newLog.ac} onChange={handleLogChange}>
                        <option value="true">
                            A/C
                        </option>
                        <option value="false">
                            No A/C
                        </option>
                    </select>
                </div>

                {car.userId === user.uid ?<button
                    onClick={handleAddLog}
                    style={{
                        marginTop: "1rem",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    Add Log
                </button> : ""}
            </div>
        </div>
    );
};

export default CarDetailsPage;
