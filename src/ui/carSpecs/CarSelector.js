import React, { useEffect, useState } from "react";
import "./CarSelector.css";

const ENGINE_FIELDS = [
    "year","trim","engine_type","fuel_type","cylinders","size",
    "horsepower_hp","horsepower_rpm","torque_ft_lbs","torque_rpm",
    "valves","valve_timing","cam_type","drive_type","transmission"
];

const BODY_FIELDS = [
    "type","doors","length","width","seats","height","wheel_base",
    "ground_clearance","cargo_capacity","curb_weight"
];

const VERCEL_BASE_URL = "https://carapi2-0.vercel.app";

const CarSelector = () => {
    const [makes, setMakes] = useState([]);
    const [loadingMakes, setLoadingMakes] = useState(true);

    const defaultSelection = { make: "", model: "", submodel: "", trim: "" };
    const [car1, setCar1] = useState(defaultSelection);
    const [car2, setCar2] = useState(defaultSelection);

    const [models1, setModels1] = useState([]);
    const [models2, setModels2] = useState([]);
    const [submodels1, setSubmodels1] = useState([]);
    const [submodels2, setSubmodels2] = useState([]);
    const [trims1, setTrims1] = useState([]);
    const [trims2, setTrims2] = useState([]);

    const [engines1, setEngines1] = useState([]);
    const [engines2, setEngines2] = useState([]);
    const [bodies1, setBodies1] = useState([]);
    const [bodies2, setBodies2] = useState([]);

    const [showResults, setShowResults] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);
    const [compareMode, setCompareMode] = useState(false);

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
                setMakes([]);
            } finally {
                setLoadingMakes(false);
            }
        };
        loadMakes();
    }, []);

    const fetchModels = async (makeId, setter) => {
        if (!makeId) return setter([]);
        try {
            const res = await fetch(`${VERCEL_BASE_URL}/api/models?make_id=${makeId}`);
            const data = await res.json();
            setter(Array.isArray(data) ? data : []);
        } catch {
            setter([]);
        }
    };

    const fetchSubmodels = async (makeId, modelName, setter) => {
        if (!makeId || !modelName) return setter([]);
        try {
            const res = await fetch(`${VERCEL_BASE_URL}/api/submodels?make_id=${makeId}&model=${encodeURIComponent(modelName)}`);
            const data = await res.json();
            const arr = Array.isArray(data) ? data : [];
            const unique = Array.from(new Set(arr.map(s => s.submodel)))
                .map(sub => arr.find(d => d.submodel === sub));
            setter(unique);
        } catch {
            setter([]);
        }
    };

    const fetchTrims = async (submodelId, setter) => {
        if (!submodelId) return setter([]);
        try {
            const res = await fetch(`${VERCEL_BASE_URL}/api/trims?submodel_id=${submodelId}`);
            const data = await res.json();
            const arr = Array.isArray(data) ? data : [];
            const unique = Array.from(new Set(arr.map(t => t.trim)))
                .map(trim => arr.find(d => d.trim === trim));
            setter(unique);
        } catch {
            setter([]);
        }
    };

    const fetchDetails = async (trimId, setEngines, setBodies) => {
        if (!trimId) { setEngines([]); setBodies([]); return; }
        try {
            const [enginesRes, bodiesRes] = await Promise.all([
                fetch(`${VERCEL_BASE_URL}/api/engines?trim_id=${trimId}`),
                fetch(`${VERCEL_BASE_URL}/api/bodies?trim_id=${trimId}`)
            ]);
            const [enginesData, bodiesData] = await Promise.all([
                enginesRes.json(),
                bodiesRes.json()
            ]);
            setEngines(Array.isArray(enginesData) ? enginesData : []);
            setBodies(Array.isArray(bodiesData) ? bodiesData : []);
        } catch {
            setEngines([]); setBodies([]);
        }
    };

    const handleChange = (carNum, field, value) => {
        const [car, setCar, setModels, setSubmodels, setTrims, setEngines, setBodies] =
            carNum === 1
                ? [car1, setCar1, setModels1, setSubmodels1, setTrims1, setEngines1, setBodies1]
                : [car2, setCar2, setModels2, setSubmodels2, setTrims2, setEngines2, setBodies2];

        const updated = { ...car, [field]: value };
        setCar(updated);

        if (field === "make") { setModels([]); setSubmodels([]); setTrims([]); setEngines([]); setBodies([]); fetchModels(value, setModels); }
        if (field === "model") { setSubmodels([]); setTrims([]); setEngines([]); setBodies([]); fetchSubmodels(updated.make, value, setSubmodels); }
        if (field === "submodel") { setTrims([]); setEngines([]); setBodies([]); fetchTrims(value, setTrims); }
        if (field === "trim") { setEngines([]); setBodies([]); fetchDetails(value, setEngines, setBodies); }
    };

    const handleEnter = async () => {
        setShowResults(true);
        setLoadingResults(true);

        const handleCar = async (car, trims, setEngines, setBodies) => {
            if (car.trim) await fetchDetails(car.trim, setEngines, setBodies);
            else if (trims.length) await fetchDetails(trims[0].id, setEngines, setBodies);
            else { setEngines([]); setBodies([]); }
        };

        await Promise.all([
            handleCar(car1, trims1, setEngines1, setBodies1),
            compareMode ? handleCar(car2, trims2, setEngines2, setBodies2) : null
        ]);

        setLoadingResults(false);
    };

    const DropdownColumn = ({ car, carNum, models, submodels, trims, align }) => (
        <div className={`car-selector-column ${align}`}>
            <label className="car-selector-label">Марка:</label>
            <select className="car-selector-select" value={car.make} onChange={e => handleChange(carNum, "make", e.target.value)} disabled={loadingMakes}>
                {loadingMakes ? <option>Loading Makes...</option> : <>
                    <option value="">Избери марка</option>
                    {makes.map(make => <option key={make.id} value={make.id}>{make.name}</option>)}
                </>}
            </select>

            <label className="car-selector-label">Модел:</label>
            <select className="car-selector-select" value={car.model} onChange={e => handleChange(carNum, "model", e.target.value)} disabled={!models.length}>
                <option value="">Избери модел</option>
                {models.map(model => <option key={model.name} value={model.name}>{model.name}</option>)}
            </select>

            <label className="car-selector-label">Подмодел:</label>
            <select className="car-selector-select" value={car.submodel} onChange={e => handleChange(carNum, "submodel", e.target.value)} disabled={!submodels.length}>
                <option value="">Избери подмодел</option>
                {submodels.map(sub => <option key={sub.id} value={sub.id}>{sub.submodel}</option>)}
            </select>

            <label className="car-selector-label">Опрема:</label>
            <select className="car-selector-select" value={car.trim} onChange={e => handleChange(carNum, "trim", e.target.value)} disabled={!trims.length}>
                <option value="">Избери опрема</option>
                {trims.map(trim => <option key={trim.id} value={trim.id}>{trim.trim}</option>)}
            </select>
        </div>
    );

    const ResultColumn = ({ engines, bodies, align }) => {
        if (!showResults) return null;
        return (
            <div className={`car-selector-result-column ${align} ${showResults ? "show" : ""}`}>
            {engines.length ? <>
                    <h3>Engine Info:</h3>
                    <ul>
                        {engines.map((e, idx) => ENGINE_FIELDS.map(field => <li key={`${idx}-${field}`}><strong>{field}:</strong> {e[field] ?? "N/A"}</li>))}
                    </ul>
                </> : <p className="loading-text">No engine info</p>}

                {bodies.length ? <>
                    <h3>Body Info:</h3>
                    <ul>
                        {bodies.map((b, idx) => BODY_FIELDS.map(field => <li key={`${idx}-${field}`}><strong>{field}:</strong> {b[field] ?? "N/A"}</li>))}
                    </ul>
                </> : <p className="loading-text">No body info</p>}
            </div>
        );
    };

    return (
        <div className="car-selector-container">
            <h2 className="car-selector-title">Спецификации</h2>
            <div className="compare-toggle-container">
                <span>Спореди два автомобили</span>
                <label className="switch">
                    <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} />
                    <span className="slider round"></span>
                </label>
            </div>

            <div className="car-selector-compare">
                <DropdownColumn car={car1} carNum={1} models={models1} submodels={submodels1} trims={trims1} align="left" />
                {compareMode && <DropdownColumn car={car2} carNum={2} models={models2} submodels={submodels2} trims={trims2} align="right" />}
            </div>

            <div className="car-selector-actions">
                <button className="car-selector-button" onClick={handleEnter}>
                    {loadingResults ? "Loading..." : "Спореди"}
                </button>
            </div>

            <div className="car-selector-result">
                <ResultColumn engines={engines1} bodies={bodies1} align="left" />
                {compareMode && <ResultColumn engines={engines2} bodies={bodies2} align="right" />}
            </div>
        </div>
    );
};

export default CarSelector;
