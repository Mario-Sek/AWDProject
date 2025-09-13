import React, {useEffect, useMemo, useState} from "react";
import {Link, useParams} from "react-router-dom";
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
import useUsers from "../../hooks/useUsers";

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
    const {users} = useUsers()
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

    const {chartData, averageConsumption, consumptionByCondition, tableRows} = useMemo(() => {
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
        const condSums = Object.fromEntries(conditions.map(c => [c, {liters: 0, km: 0}]));

        const chart = [];
        const rowsForTable = logs.map(l => {
            const liters = Number(l.liters);
            const distance = Number(l.km);

            if (!isFinite(distance) || distance <= 0 || !isFinite(liters) || liters <= 0) {
                return {...l, consumption: null};
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

            return {...l, consumption};
        });

        const overallAvg = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;
        const condAvg = Object.fromEntries(
            conditions.map(c => {
                const {liters, km} = condSums[c];
                return [c, km > 0 ? (liters / km) * 100 : 0];
            })
        );

        return {
            chartData: chart,
            averageConsumption: overallAvg,
            consumptionByCondition: condAvg,
            tableRows: rowsForTable
        };
    }, [logs]);

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

    if (!car) return (
        <div style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: "18px",
            color: "#64748b"
        }}>
            Car not found
        </div>
    );

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1.5rem 1rem",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            backgroundColor: "#fafafa",
            minHeight: "100vh"
        }}>
            {/* Car Details Header */}
            <div style={{
                display: "flex",
                gap: "2rem",
                marginBottom: "2rem",
                flexWrap: "wrap",
                background: "white",
                padding: "1.5rem",
                borderRadius: "16px",
                boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)"
            }}>
                {car.image && (
                    <img
                        src={car.image}
                        alt={`${car.model}`}
                        style={{
                            width: "280px",
                            height: "190px",
                            objectFit: "cover",
                            display: "block",
                            borderRadius: "12px",
                            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                            flexShrink: 0
                        }}
                    />
                )}
                <div style={{flex: 1, minWidth: "280px"}}>
                    <h1 style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        margin: "0 0 1rem 0",
                        color: "#1f2937",
                        letterSpacing: "-0.025em"
                    }}>
                        {makeName} {car.model} ({car.year})
                    </h1>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "0.75rem",
                        marginBottom: "1.5rem"
                    }}>
                        <div>
                            <p style={{margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: "500"}}>
                                Registration Plate
                            </p>
                            <p style={{margin: "0.25rem 0 0 0", fontSize: "1.125rem", fontWeight: "600", color: "#374151"}}>
                                {car.reg_plate}
                            </p>
                        </div>
                        <div>
                            <p style={{margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: "500"}}>
                                Fuel Type
                            </p>
                            <p style={{margin: "0.25rem 0 0 0", fontSize: "1.125rem", fontWeight: "600", color: "#374151"}}>
                                {car.fuel}
                            </p>
                        </div>
                        <div>
                            <p style={{margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: "500"}}>
                                Horsepower
                            </p>
                            <p style={{margin: "0.25rem 0 0 0", fontSize: "1.125rem", fontWeight: "600", color: "#374151"}}>
                                {car.hp} HP
                            </p>
                        </div>
                        <div>
                            <p style={{margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: "500"}}>
                                Owner
                            </p>
                            <Link
                                to={`/users/${users?.find(u => u.uid === car.userId).uid}`}
                                style={{
                                    margin: "0.25rem 0 0 0",
                                    fontSize: "1.125rem",
                                    fontWeight: "600",
                                    color: "#3b82f6",
                                    textDecoration: "none",
                                    display: "block"
                                }}
                            >
                                {users?.find(u => u.uid === car.userId).username}
                            </Link>
                        </div>
                    </div>

                    {/* Original Consumption Stats with proper spacing */}
                    <div style={{
                        marginTop: "1rem",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "0.75rem"
                    }}>
                        <div style={{
                            background: "#f8fafc",
                            borderRadius: "10px",
                            padding: "0.75rem 1rem"
                        }}>
                            <div style={{fontSize: "0.75rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em"}}>
                                Overall Avg
                            </div>
                            <div style={{fontSize: "1.25rem", fontWeight: "700", color: "#1f2937", margin: "0.25rem 0"}}>
                                {averageConsumption.toFixed(2)}
                            </div>
                            <div style={{fontSize: "0.875rem", color: "#64748b"}}>L/100km</div>
                        </div>
                        {conditions.map((cond) => (
                            <div key={cond} style={{
                                background: "#f8fafc",
                                borderRadius: "10px",
                                padding: "0.75rem 1rem",
                                borderLeft: `3px solid ${conditionColors[cond]}`
                            }}>
                                <div style={{
                                    fontSize: "0.75rem",
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                    fontWeight: "600",
                                    letterSpacing: "0.05em"
                                }}>
                                    {cond} Avg
                                </div>
                                <div style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "700",
                                    color: conditionColors[cond],
                                    margin: "0.25rem 0"
                                }}>
                                    {consumptionByCondition[cond].toFixed(2)}
                                </div>
                                <div style={{fontSize: "0.875rem", color: "#64748b"}}>L/100km</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Charts Section */}
            <div style={{marginBottom: "2rem"}}>
                <div style={{
                    textAlign: "center",
                    marginBottom: "2rem",
                    padding: "0 1rem"
                }}>
                    <h2 style={{
                        fontSize: "1.75rem",
                        fontWeight: "700",
                        color: "#1f2937",
                        margin: "0 0 0.75rem 0"
                    }}>
                        Fuel Consumption Analysis
                    </h2>
                    <p style={{
                        fontSize: "1rem",
                        color: "#6b7280",
                        margin: 0,
                        maxWidth: "600px",
                        marginLeft: "auto",
                        marginRight: "auto"
                    }}>
                        Track your vehicle's performance across different driving conditions
                    </p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
                    gap: "1.5rem"
                }}>
                    {conditions.map((cond) => (
                        <div key={cond} style={{
                            background: "white",
                            borderRadius: "16px",
                            padding: "1.5rem",
                            boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)",
                            border: "1px solid #f1f5f9",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            {/* Decorative element */}
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "3px",
                                background: `linear-gradient(90deg, ${conditionColors[cond]}, ${conditionColors[cond]}80)`
                            }}></div>

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "1.25rem"
                            }}>
                                <div style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
                                    <div style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        backgroundColor: conditionColors[cond]
                                    }}></div>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: "1.125rem",
                                        fontWeight: "600",
                                        textTransform: "capitalize",
                                        color: "#374151"
                                    }}>
                                        {cond} Driving
                                    </h3>
                                </div>
                                <div style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "700",
                                    color: conditionColors[cond]
                                }}>
                                    {consumptionByCondition[cond].toFixed(1)}L
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                                    <XAxis
                                        dataKey="date"
                                        tick={{fontSize: 11, fill: "#6b7280"}}
                                        tickFormatter={(d) =>
                                            new Date(d).toLocaleDateString("en-US", {month: "short", day: "numeric"})
                                        }
                                        stroke="#9ca3af"
                                    />
                                    <YAxis
                                        tick={{fontSize: 11, fill: "#6b7280"}}
                                        unit=" L/100km"
                                        stroke="#9ca3af"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "white",
                                            border: `2px solid ${conditionColors[cond]}`,
                                            borderRadius: "10px",
                                            boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08)"
                                        }}
                                        formatter={(val) => [val?.toFixed(2) + " L/100km", cond]}
                                        labelStyle={{color: "#374151", fontWeight: "600"}}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={cond}
                                        stroke={conditionColors[cond]}
                                        strokeWidth={3}
                                        dot={{fill: conditionColors[cond], r: 4, strokeWidth: 2, stroke: "white"}}
                                        activeDot={{r: 5, fill: conditionColors[cond], strokeWidth: 3, stroke: "white"}}
                                        connectNulls
                                        isAnimationActive={true}
                                    />
                                    <ReferenceLine
                                        y={averageConsumption}
                                        stroke="#6b7280"
                                        strokeDasharray="5 5"
                                        strokeWidth={2}
                                        label={{
                                            value: `Overall: ${averageConsumption.toFixed(1)}`,
                                            position: "insideTopRight",
                                            fill: "#6b7280",
                                            fontSize: 11
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Fuel Logs Table */}
            <div style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)",
                overflow: "hidden",
                marginBottom: "2rem",
                border: "1px solid #f1f5f9"
            }}>
                <div style={{
                    padding: "1.5rem 1.5rem 1.25rem 1.5rem",
                    borderBottom: "1px solid #f1f5f9",
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
                }}>
                    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem"}}>
                        <div>
                            <h3 style={{
                                margin: "0 0 0.5rem 0",
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                color: "#1f2937"
                            }}>
                                Fuel Consumption Logs
                            </h3>
                            <p style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                color: "#6b7280"
                            }}>
                                {tableRows.length} {tableRows.length === 1 ? 'record' : 'records'} • Detailed fuel tracking history
                            </p>
                        </div>
                        {tableRows.length > 0 && (
                            <div style={{
                                display: "flex",
                                gap: "1.25rem",
                                fontSize: "0.875rem",
                                color: "#6b7280"
                            }}>
                                <div style={{textAlign: "center"}}>
                                    <div style={{fontWeight: "600", color: "#1f2937", fontSize: "1.125rem"}}>
                                        {tableRows.reduce((sum, log) => sum + Number(log.liters || 0), 0).toFixed(1)}L
                                    </div>
                                    <div>Total Fuel</div>
                                </div>
                                <div style={{textAlign: "center"}}>
                                    <div style={{fontWeight: "600", color: "#1f2937", fontSize: "1.125rem"}}>
                                        {tableRows.reduce((sum, log) => sum + Number(log.km || 0), 0).toFixed(0)} km
                                    </div>
                                    <div>Total Distance</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {tableRows.length === 0 ? (
                    <div style={{
                        padding: "3rem 1.5rem",
                        textAlign: "center",
                        color: "#6b7280"
                    }}>
                        <div style={{
                            width: "70px",
                            height: "70px",
                            margin: "0 auto 1.25rem",
                            background: "#f1f5f9",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.75rem"
                        }}>
                            ⛽
                        </div>
                        <h4 style={{margin: "0 0 0.5rem 0", fontSize: "1.125rem", fontWeight: "600", color: "#374151"}}>
                            No fuel logs yet
                        </h4>
                        <p style={{margin: 0, fontSize: "0.95rem"}}>
                            Start tracking your fuel consumption by adding your first log entry
                        </p>
                    </div>
                ) : (
                    <div style={{overflowX: "auto"}}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.9rem"
                        }}>
                            <thead>
                            <tr style={{background: "#f8fafc"}}>
                                <th style={{
                                    padding: "1rem 0.75rem",
                                    textAlign: "left",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "2px solid #e5e7eb"
                                }}>Date</th>
                                <th style={{
                                    padding: "1rem 0.75rem",
                                    textAlign: "left",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "2px solid #e5e7eb"
                                }}>Odometer</th>
                                <th style={{
                                    padding: "1rem 0.75rem",
                                    textAlign: "left",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "2px solid #e5e7eb"
                                }}>Fuel</th>
                                <th style={{
                                    padding: "1rem 0.75rem",
                                    textAlign: "left",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "2px solid #e5e7eb"
                                }}>Distance</th>
                                <th style={{
                                    padding: "1rem 0.75rem",
                                    textAlign: "left",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "2px solid #e5e7eb"
                                }}>Cost</th>
                                <th style={{
                                    padding: "1rem 0.75rem",
                                    textAlign: "left",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "2px solid #e5e7eb"
                                }}>Condition</th>
                                <th style={{
                                    padding: "1rem 0.75rem",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "2px solid #e5e7eb"
                                }}>A/C</th>
                                <th style={{
                                    padding: "1rem 0.75rem",
                                    textAlign: "left",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.875rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderBottom: "2px solid #e5e7eb"
                                }}>Consumption</th>
                                {user && car.userId === user.uid && (
                                    <th style={{
                                        padding: "1rem 0.75rem",
                                        textAlign: "center",
                                        fontWeight: "600",
                                        color: "#374151",
                                        fontSize: "0.875rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        borderBottom: "2px solid #e5e7eb"
                                    }}>Actions</th>
                                )}
                            </tr>
                            </thead>
                            <tbody>
                            {tableRows.map((log, index) => (
                                <tr key={log._id} style={{
                                    borderBottom: "1px solid #f1f5f9",
                                    backgroundColor: index % 2 === 0 ? "white" : "#fafbfc",
                                    transition: "background-color 0.2s ease"
                                }}>
                                    <td style={{
                                        padding: "1rem 0.75rem",
                                        color: "#374151",
                                        fontWeight: "500"
                                    }}>
                                        {new Date(log.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td style={{padding: "1rem 0.75rem", color: "#374151", fontFamily: "monospace"}}>
                                        {Number(log.km_stand).toLocaleString()} km
                                    </td>
                                    <td style={{padding: "1rem 0.75rem", color: "#374151", fontWeight: "500"}}>
                                        {log.liters}L
                                    </td>
                                    <td style={{padding: "1rem 0.75rem", color: "#374151"}}>
                                        {log.km} km
                                    </td>
                                    <td style={{padding: "1rem 0.75rem", color: "#374151", fontWeight: "500"}}>
                                        €{Number(log.price).toFixed(2)}
                                    </td>
                                    <td style={{padding: "1rem 0.75rem"}}>
                                            <span style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "9999px",
                                                fontSize: "0.75rem",
                                                fontWeight: "600",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                backgroundColor: `${conditionColors[log.condition]}20`,
                                                color: conditionColors[log.condition],
                                                border: `1px solid ${conditionColors[log.condition]}40`
                                            }}>
                                                {log.condition}
                                            </span>
                                    </td>
                                    <td style={{padding: "1rem 0.75rem", textAlign: "center"}}>
                                            <span style={{
                                                fontSize: "1rem",
                                                color: log.ac === "true" ? "#10b981" : "#6b7280"
                                            }}>
                                                {log.ac === "true" ? "❄️" : "🌡️"}
                                            </span>
                                    </td>
                                    <td style={{padding: "1rem 0.75rem"}}>
                                        {log.consumption != null ? (
                                            <span style={{
                                                fontWeight: "600",
                                                fontSize: "0.95rem",
                                                color: "#1f2937",
                                                background: "#f0f9ff",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "6px",
                                                display: "inline-block"
                                            }}>
                                                    {log.consumption.toFixed(2)} L/100km
                                                </span>
                                        ) : (
                                            <span style={{color: "#9ca3af", fontSize: "0.875rem"}}>
                                                    —
                                                </span>
                                        )}
                                    </td>
                                    {user && car.userId === user.uid && (
                                        <td style={{padding: "1rem 0.75rem", textAlign: "center"}}>
                                            <button
                                                onClick={() => handleDeleteLog(log._id)}
                                                style={{
                                                    padding: "0.375rem 0.625rem",
                                                    borderRadius: "6px",
                                                    backgroundColor: "#fee2e2",
                                                    color: "#dc2626",
                                                    border: "1px solid #fecaca",
                                                    cursor: "pointer",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "500",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.backgroundColor = "#dc2626";
                                                    e.target.style.color = "white";
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = "#fee2e2";
                                                    e.target.style.color = "#dc2626";
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Enhanced Add New Log Form */}
            {user && car.userId === user.uid && (
                <div style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "2rem",
                    boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)",
                    border: "1px solid #f1f5f9"
                }}>
                    <div style={{
                        marginBottom: "1.75rem",
                        textAlign: "center"
                    }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#1f2937",
                            margin: "0 0 0.5rem 0"
                        }}>
                            Add New Fuel Log
                        </h3>
                        <p style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            color: "#6b7280"
                        }}>
                            Record your latest fuel consumption data
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gap: "1.25rem",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        marginBottom: "2rem"
                    }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                Current Kilometers
                            </label>
                            <input
                                type="number"
                                name="km_stand"
                                placeholder="Current odometer reading"
                                value={newLog.km_stand}
                                onChange={handleLogChange}
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "10px",
                                    fontSize: "1rem",
                                    transition: "all 0.2s ease",
                                    boxSizing: "border-box",
                                    backgroundColor: "#fafbfc"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.backgroundColor = "#fafbfc";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                Fuel Amount
                            </label>
                            <input
                                type="number"
                                name="liters"
                                placeholder="Liters filled"
                                value={newLog.liters}
                                onChange={handleLogChange}
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "10px",
                                    fontSize: "1rem",
                                    transition: "all 0.2s ease",
                                    boxSizing: "border-box",
                                    backgroundColor: "#fafbfc"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.backgroundColor = "#fafbfc";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                Distance Driven
                            </label>
                            <input
                                type="number"
                                name="km"
                                placeholder="Trip distance in km"
                                value={newLog.km}
                                onChange={handleLogChange}
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "10px",
                                    fontSize: "1rem",
                                    transition: "all 0.2s ease",
                                    boxSizing: "border-box",
                                    backgroundColor: "#fafbfc"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.backgroundColor = "#fafbfc";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                Fuel Cost
                            </label>
                            <input
                                type="number"
                                name="price"
                                placeholder="Total amount paid"
                                value={newLog.price}
                                onChange={handleLogChange}
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "10px",
                                    fontSize: "1rem",
                                    transition: "all 0.2s ease",
                                    boxSizing: "border-box",
                                    backgroundColor: "#fafbfc"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.backgroundColor = "#fafbfc";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                Driving Condition
                            </label>
                            <select
                                name="condition"
                                value={newLog.condition}
                                onChange={handleLogChange}
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "10px",
                                    fontSize: "1rem",
                                    backgroundColor: "#fafbfc",
                                    boxSizing: "border-box",
                                    cursor: "pointer"
                                }}
                            >
                                {conditions.map((c) => (
                                    <option key={c} value={c}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)} Driving
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={newLog.date}
                                onChange={handleLogChange}
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "10px",
                                    fontSize: "1rem",
                                    transition: "all 0.2s ease",
                                    boxSizing: "border-box",
                                    backgroundColor: "#fafbfc"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.backgroundColor = "#fafbfc";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                Air Conditioning
                            </label>
                            <select
                                name="ac"
                                value={newLog.ac}
                                onChange={handleLogChange}
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "10px",
                                    fontSize: "1rem",
                                    backgroundColor: "#fafbfc",
                                    boxSizing: "border-box",
                                    cursor: "pointer"
                                }}
                            >
                                <option value="true">❄️ A/C On</option>
                                <option value="false">🌡️ A/C Off</option>
                            </select>
                        </div>
                    </div>

                    <div style={{textAlign: "center"}}>
                        <button
                            onClick={handleAddLog}
                            style={{
                                padding: "0.6rem 1.2rem",
                                backgroundColor: "rgb(79, 70, 229)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontWeight: "600",
                                cursor: "pointer",
                                fontSize: "1rem",
                                transition: "background-color 0.3s"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = "rgb(67, 56, 202)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = "rgb(79, 70, 229)";
                            }}
                        >
                            Add Fuel Log Entry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarDetailsPage;
