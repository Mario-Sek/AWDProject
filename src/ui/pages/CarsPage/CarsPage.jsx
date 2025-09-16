import React, {useEffect, useState} from "react";
import useCars from "../../../hooks/useCars";
import {Link} from "react-router-dom";
import default_car from "../../../images/default-car.png";
import useUsers from "../../../hooks/useUsers";

const VERCEL_BASE_URL = "https://carapi-zeta.vercel.app";

const CarsPage = () => {
    const {cars} = useCars();
    const {findUserById} = useUsers();

    // --- Filter states ---
    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");
    const [makeFilter, setMakeFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [fuelFilter, setFuelFilter] = useState("");
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    // --- Makes & Models ---
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [loadingMakes, setLoadingMakes] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);

    // --- Pagination states ---
    const [currentPage, setCurrentPage] = useState(1); // current page
    const carsPerPage = 6; // number of cars per page

    // --- Load Makes ---
    useEffect(() => {
        const loadMakes = async () => {
            try {
                setLoadingMakes(true);
                const res = await fetch(`${VERCEL_BASE_URL}/api/makes`);
                const data = await res.json();
                if (Array.isArray(data)) setMakes(data);
                else if (Array.isArray(data.data)) setMakes(data.data);
                else setMakes([]);
            } catch (err) {
                console.error("Error loading makes:", err);
                setMakes([]);
            } finally {
                setLoadingMakes(false);
            }
        };
        loadMakes();
    }, []);

    // --- Load Models when Make changes ---
    useEffect(() => {
        const loadModels = async () => {
            if (!makeFilter) {
                setModels([]);
                setLoadingModels(false);
                return;
            }
            setLoadingModels(true);
            try {
                const makeObj = makes.find((m) => m.id.toString() === makeFilter);
                if (!makeObj) return setModels([]);
                const res = await fetch(
                    `${VERCEL_BASE_URL}/api/models?make_id=${makeObj.id}`
                );
                const data = await res.json();
                if (Array.isArray(data)) setModels(data.map((m) => m.name));
                else if (Array.isArray(data.data)) setModels(data.data.map((m) => m.name));
                else setModels([]);
            } catch (err) {
                console.error(err);
                setModels([]);
            } finally {
                setLoadingModels(false);
            }
        };
        loadModels();
    }, [makeFilter, makes]);

    // --- Apply filters & sorting ---
    const filteredCars = cars
        .filter((car) => {
            const year = parseInt(car.year);
            const from = yearFrom ? parseInt(yearFrom) : -Infinity;
            const to = yearTo ? parseInt(yearTo) : Infinity;
            const matchesYear = year >= from && year <= to;
            const matchesMake = makeFilter ? car.make === makeFilter : true;
            const matchesModel = modelFilter ? car.model === modelFilter : true;
            const matchesFuel = fuelFilter ? car.fuel === fuelFilter : true;
            const matchesSearch = search
                ? makes.find(c=>c.id.toString() === car.make.toString())?.name.toLowerCase().includes(search.toLowerCase()) ||
                car.model.toLowerCase().includes(search.toLowerCase())
                : true;
            return matchesYear && matchesMake && matchesModel && matchesFuel && matchesSearch;
        })
        .sort((a, b) => {
            const dateA = a.createdAt?.seconds
                ? a.createdAt.seconds * 1000
                : new Date(a.createdAt).getTime();
            const dateB = b.createdAt?.seconds
                ? b.createdAt.seconds * 1000
                : new Date(b.createdAt).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

    // --- Reset to page 1 whenever filters/search change ---
    useEffect(() => {
        setCurrentPage(1);
    }, [yearFrom, yearTo, makeFilter, modelFilter, fuelFilter, search]);

    // --- Pagination calculations ---
    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);

    // --- Input/Select base style ---
    const inputStyle = {
        width: "100%",
        padding: "0.875rem 1rem",
        border: "2px solid #e5e7eb",
        borderRadius: "10px",
        fontSize: "1rem",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
        backgroundColor: "#fafbfc",
        outline: "none"
    };

    const handleInputFocus = (e) => {
        e.target.style.borderColor = "#3b82f6";
        e.target.style.backgroundColor = "white";
        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
    };

    const handleInputBlur = (e) => {
        e.target.style.borderColor = "#e5e7eb";
        e.target.style.backgroundColor = "#fafbfc";
        e.target.style.boxShadow = "none";
    };

    // --- Pagination button style ---
    const paginationButtonStyle = {
        padding: "0.6rem 1.2rem",
        backgroundColor: "rgb(79, 70, 229)",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "1rem",
        transition: "background-color 0.3s"
    };

    const paginationButtonInactiveStyle = {
        padding: "0.6rem 1.2rem",
        backgroundColor: "white",
        color: "rgb(79, 70, 229)",
        border: "2px solid #e5e7eb",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "1rem",
        transition: "all 0.3s"
    };

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1.5rem 1rem",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            backgroundColor: "#fafafa",
            minHeight: "100vh"
        }}>
            <div style={{display: "flex", gap: "1.5rem"}}>

                {/* ===== Filters Panel ===== */}
                <div style={{
                    flex: "0 0 280px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                    padding: "1.5rem",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)",
                    border: "1px solid #f1f5f9",
                    height: "fit-content",
                    position: "sticky",
                    top: "1.5rem"
                }}>
                    <h3 style={{
                        margin: "0 0 1rem 0",
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#1f2937"
                    }}>Filters</h3>

                    {/* --- Make filter --- */}
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
                            Make
                        </label>
                        <select
                            value={makeFilter}
                            onChange={e => setMakeFilter(e.target.value)}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="">Select make</option>
                            {loadingMakes ? <option>Loading...</option> : makes.map(make => (
                                <option key={make.id} value={make.id}>{make.name}</option>
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
                            Model
                        </label>
                        <select
                            value={modelFilter}
                            onChange={e => setModelFilter(e.target.value)}
                            disabled={!models.length}
                            style={{
                                ...inputStyle,
                                opacity: !models.length ? 0.6 : 1,
                                cursor: !models.length ? "not-allowed" : "pointer"
                            }}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="">Select model</option>
                            {models.map(model => <option key={model} value={model}>{model}</option>)}
                        </select>
                    </div>

                    {/* --- Fuel filter --- */}
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
                            Fuel Type
                        </label>
                        <select
                            value={fuelFilter}
                            onChange={e => setFuelFilter(e.target.value)}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="">Select fuel type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="TNG">TNG</option>
                            <option value="CNG">CNG</option>
                        </select>
                    </div>

                    {/* --- Year filters --- */}
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
                            Year Range
                        </label>
                        <div style={{display: "flex", gap: "0.5rem"}}>
                            <input
                                type="number"
                                placeholder="From"
                                value={yearFrom}
                                onChange={e => setYearFrom(e.target.value)}
                                style={{...inputStyle, flex: 1}}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                            <input
                                type="number"
                                placeholder="To"
                                value={yearTo}
                                onChange={e => setYearTo(e.target.value)}
                                style={{...inputStyle, flex: 1}}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </div>
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
                            Sort Order
                        </label>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value)}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                    </div>

                    {/* --- Search input --- */}
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
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search make or model"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={inputStyle}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>
                </div>

                {/* ===== Cars List Panel ===== */}
                <div style={{flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem"}}>
                    {/* Header Section */}
                    <div style={{
                        textAlign: "center",
                        marginBottom: "1.5rem"
                    }}>
                        <h1 style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "#1f2937",
                            margin: "0 0 0.75rem 0",
                            letterSpacing: "-0.025em"
                        }}>
                            Our Users' Cars
                        </h1>
                        <p style={{
                            fontSize: "1rem",
                            color: "#6b7280",
                            margin: 0,
                            maxWidth: "600px",
                            marginLeft: "auto",
                            marginRight: "auto",
                            lineHeight: "1.6"
                        }}>
                            Feel free to check out a specific model you're interested about or simply add a car and start
                            tracking your logs today!
                        </p>
                    </div>

                    {/* Cars Grid */}
                    <div style={{
                        display: "grid",
                        gap: "1.5rem"
                    }}>
                        {currentCars.map(car => (

                            <div key={car.id} style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "1.5rem",
                                backgroundColor: "white",
                                borderRadius: "16px",
                                boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)",
                                border: "1px solid #f1f5f9",
                                transition: "all 0.2s ease"
                            }}>
                                <img
                                    src={car.image || default_car}
                                    alt={car.make}
                                    style={{
                                        width: "120px",
                                        height: "90px",
                                        objectFit: "cover",
                                        borderRadius: "12px",
                                        marginRight: "1.5rem",
                                        flexShrink: 0,
                                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                                    }}
                                />
                                <div style={{flex: 1}}>
                                    <Link
                                        to={`/cars/${car.id}`}
                                        style={{
                                            fontSize: "1.25rem",
                                            fontWeight: "700",
                                            color: "#3b82f6",
                                            textDecoration: "none",
                                            display: "block",
                                            marginBottom: "0.5rem"
                                        }}
                                    >
                                        {makes.find(c=>c.id==car.make)?.name || car.make} {car.model} ({car.year})
                                    </Link>

                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap: "0.75rem",
                                        marginTop: "0.75rem"
                                    }}>
                                        <div style={{
                                            background: "#f8fafc",
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "8px"
                                        }}>
                                            <span style={{
                                                fontSize: "0.875rem",
                                                color: "#6b7280",
                                                fontWeight: "500"
                                            }}>
                                                Fuel:
                                            </span>
                                            <span style={{
                                                fontSize: "0.875rem",
                                                color: "#374151",
                                                fontWeight: "600",
                                                marginLeft: "0.5rem"
                                            }}>
                                                {car.fuel || "N/A"}
                                            </span>
                                        </div>

                                        <div style={{
                                            background: "#f8fafc",
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "8px"
                                        }}>
                                            <span style={{
                                                fontSize: "0.875rem",
                                                color: "#6b7280",
                                                fontWeight: "500"
                                            }}>
                                                Horsepower:
                                            </span>
                                            <span style={{
                                                fontSize: "0.875rem",
                                                color: "#374151",
                                                fontWeight: "600",
                                                marginLeft: "0.5rem"
                                            }}>
                                                {car.hp || "N/A"} HP
                                            </span>
                                        </div>

                                        <div style={{
                                            background: "#f8fafc",
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "8px"
                                        }}>
                                            <span style={{
                                                fontSize: "0.875rem",
                                                color: "#6b7280",
                                                fontWeight: "500"
                                            }}>
                                                Owner:
                                            </span>
                                            <Link
                                                to={`/users/${car.userId}`}
                                                style={{
                                                    fontSize: "0.875rem",
                                                    color: "#3b82f6",
                                                    fontWeight: "600",
                                                    marginLeft: "0.5rem",
                                                    textDecoration: "none"
                                                }}
                                            >
                                                {findUserById(car.userId)?.username || "Unknown"}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredCars.length === 0 && (
                        <div style={{
                            textAlign: "center",
                            padding: "4rem 2rem",
                            backgroundColor: "white",
                            borderRadius: "16px",
                            border: "1px solid #f1f5f9"
                        }}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                margin: "0 auto 1.5rem",
                                background: "#f1f5f9",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2rem"
                            }}>
                                🚗
                            </div>
                            <h4 style={{
                                margin: "0 0 0.5rem 0",
                                fontSize: "1.25rem",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                No cars found
                            </h4>
                            <p style={{
                                margin: 0,
                                fontSize: "1rem",
                                color: "#6b7280"
                            }}>
                                Try adjusting your filters to find more cars
                            </p>
                        </div>
                    )}

                    {/* --- Pagination Controls --- */}
                    {totalPages > 1 && (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.5rem",
                            marginTop: "2rem",
                            flexWrap: "wrap"
                        }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    ...paginationButtonInactiveStyle,
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                    cursor: currentPage === 1 ? "not-allowed" : "pointer"
                                }}
                                onMouseOver={(e) => {
                                    if (currentPage !== 1) {
                                        e.target.style.backgroundColor = "#f3f4f6";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (currentPage !== 1) {
                                        e.target.style.backgroundColor = "white";
                                    }
                                }}
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    style={currentPage === i + 1 ? paginationButtonStyle : paginationButtonInactiveStyle}
                                    onMouseOver={(e) => {
                                        if (currentPage !== i + 1) {
                                            e.target.style.backgroundColor = "#f3f4f6";
                                        } else {
                                            e.target.style.backgroundColor = "rgb(67, 56, 202)";
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (currentPage !== i + 1) {
                                            e.target.style.backgroundColor = "white";
                                        } else {
                                            e.target.style.backgroundColor = "rgb(79, 70, 229)";
                                        }
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    ...paginationButtonInactiveStyle,
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                    cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                                }}
                                onMouseOver={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.target.style.backgroundColor = "#f3f4f6";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.target.style.backgroundColor = "white";
                                    }
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarsPage;
