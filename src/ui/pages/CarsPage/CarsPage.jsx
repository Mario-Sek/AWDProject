import React, {useState, useEffect} from "react";
import useCars from "../../../hooks/useCars";
import {Link} from "react-router-dom";
import default_car from "../../../images/default-car.png";
import useUsers from "../../../hooks/useUsers";

const VERCEL_BASE_URL = "https://carapi-zeta.vercel.app";
const CarsPage = () => {
    const {cars} = useCars();
    const {findUserById} = useUsers()

    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");
    const [makeFilter, setMakeFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [fuelFilter, setFuelFilter] = useState("");
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [loadingMakes, setLoadingMakes] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);

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
                // Испрати make_id, не name
                const makeObj = makes.find(m => m.name === makeFilter);
                if (!makeObj) return setModels([]);
                const res = await fetch(`${VERCEL_BASE_URL}/api/models?make_id=${makeObj.id}`);
                const data = await res.json();
                if (Array.isArray(data)) setModels(data.map(m => m.name));
                else if (Array.isArray(data.data)) setModels(data.data.map(m => m.name));
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


    // --- Apply filters ---
    const filteredCars = cars
        .filter(car => {
            const year = parseInt(car.year);
            const from = yearFrom ? parseInt(yearFrom) : -Infinity;
            const to = yearTo ? parseInt(yearTo) : Infinity;
            const matchesYear = year >= from && year <= to;
            const matchesMake = makeFilter ? car.make === makeFilter : true;
            const matchesModel = modelFilter ? car.model === modelFilter : true;
            const matchesFuel = fuelFilter ? car.fuel === fuelFilter : true;
            const matchesSearch = search
                ? car.make.toLowerCase().includes(search.toLowerCase()) ||
                car.model.toLowerCase().includes(search.toLowerCase())
                : true;
            return matchesYear && matchesMake && matchesModel && matchesFuel && matchesSearch;
        })
        .sort((a, b) => {
            const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
            const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();

            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });



    return (
        <div style={{display: "flex", gap: "2rem", marginTop: "2rem", marginLeft: "3.5rem"}}>
            {/* ===== Filters Panel ===== */}
            <div style={{
                flex: "0 0 20%",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "1rem",
                backgroundColor: "rgba(236,236,231,0.47)",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                height: "29rem",
            }}>
                <h3 style={{marginBottom: "0.5rem", color: "#333"}}>Filters</h3>
                <select
                    value={makeFilter}
                    onChange={e => setMakeFilter(e.target.value)}
                    style={{
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        outline: "none",
                        transition: "border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#1d4ed8"}
                    onBlur={e => e.target.style.borderColor = "#ccc"}
                >
                    <option value="">Select make</option>
                    {loadingMakes ? <option>Loading...</option> : makes.map(make => (
                        <option key={make.id} value={make.name}>{make.name}</option>
                    ))}
                </select>

                <select
                    value={modelFilter}
                    onChange={e => setModelFilter(e.target.value)}
                    disabled={!models.length}
                    style={{
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        outline: "none",
                        transition: "border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#1d4ed8"}
                    onBlur={e => e.target.style.borderColor = "#ccc"}
                >
                    <option value="">Select model</option>
                    {models.map(model => <option key={model} value={model}>{model}</option>)}
                </select>



                <select
                    value={fuelFilter}
                    onChange={e => setFuelFilter(e.target.value)}
                    style={{
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        outline: "none",
                        transition: "border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#1d4ed8"}
                    onBlur={e => e.target.style.borderColor = "#ccc"}
                >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="TNG">TNG</option>
                    <option value="CNG">CNG</option>
                </select>


                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                        type="number"
                        placeholder="Year from"
                        value={yearFrom}
                        onChange={e => setYearFrom(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "0.6rem",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            outline: "none",
                            transition: "border 0.2s"
                        }}
                        onFocus={e => e.target.style.borderColor = "#1d4ed8"}
                        onBlur={e => e.target.style.borderColor = "#ccc"}
                    />
                    <input
                        type="number"
                        placeholder="Year to"
                        value={yearTo}
                        onChange={e => setYearTo(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "0.6rem",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            outline: "none",
                            transition: "border 0.2s"
                        }}
                        onFocus={e => e.target.style.borderColor = "#1d4ed8"}
                        onBlur={e => e.target.style.borderColor = "#ccc"}
                    />
                </div>



                <select
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    style={{
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        outline: "none",
                        transition: "border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#1d4ed8"}
                    onBlur={e => e.target.style.borderColor = "#ccc"}
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>

                <input
                    type="text"
                    placeholder="Search make or model"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        outline: "none",
                        transition: "border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#1d4ed8"}
                    onBlur={e => e.target.style.borderColor = "#ccc"}
                />
            </div>

            {/* ===== Cars List Panel ===== */}
            <div style={{flex: 1, display: "flex", flexDirection: "column", gap: "1rem"}}>
                <h3 style={{
                    textAlign: "center", width: "94%", fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                    fontSize: "1.8rem",
                    color: "#1f2937",
                    letterSpacing: "0.5px"
                }}>Our users' cars</h3>
                <p style={{
                    textAlign: "center",
                    width: "94%",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "400",
                    fontSize: "1.1rem",
                    color: "#4b5563",
                    lineHeight: "1.6",
                    letterSpacing: "0.3px",
                    marginTop: "0.5rem"
                }}>Feel free to check out a specific model you're interested
                    about or simply add a car and start tracking your logs today!</p>
                {filteredCars.map(car => (
                    <div key={car.id} style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "1rem",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        //cursor: "pointer",
                        width: "91%"
                    }}
                    >
                        <img src={car.image || default_car} alt={car.make} style={{
                            width: "120px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginRight: "1rem"
                        }}/>
                        <div style={{width:"100%"}}>
                            <Link to={`/cars/${car.id}`} style={{fontWeight: "600", color: "#1d4ed8"}}>
                                {car.make} {car.model} ({car.year})
                            </Link>
                            <div style={{fontSize: "0.9rem", color: "#555"}}>Fuel: {car.fuel || "N/A"}</div>
                            <div style={{fontSize: "0.9rem", color: "#555", display: "flex", justifyContent:"space-between", alignItems:"center"}}>
                                <div>
                                    Horsepower: {car.hp || "N/A"}
                                </div>
                                <div>Owner: <Link
                                    to={`/users/${car.userId}`}>
                                    {findUserById(car.userId)?.username}
                                </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredCars.length === 0 && <p>No cars found for your criteria!</p>}
            </div>
        </div>


    );
};

export default CarsPage;
