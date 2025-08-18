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

const VERCEL_BASE_URL = "https://carapi-zeta.vercel.app";

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
    const [loadingCompare, setLoadingCompare] = useState(false);

    useEffect(() => {
        setLoadingMakes(true);
        fetch(`${VERCEL_BASE_URL}/api/makes`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMakes(data);
                else if (Array.isArray(data.data)) setMakes(data.data);
                else setMakes([]);
            })
            .catch(err => { console.error(err); setMakes([]); })
            .finally(() => setLoadingMakes(false));
    }, []);

    const fetchModels = (makeId, setter) => {
        if (!makeId) return setter([]);
        fetch(`${VERCEL_BASE_URL}/api/models?make_id=${makeId}`)
            .then(res => res.json())
            .then(data => setter(Array.isArray(data) ? data : []))
            .catch(err => { console.error(err); setter([]); });
    };

    const fetchSubmodels = (makeId, modelName, setter) => {
        if (!makeId || !modelName) return setter([]);
        fetch(`${VERCEL_BASE_URL}/api/submodels?make_id=${makeId}&model=${encodeURIComponent(modelName)}`)
            .then(res => res.json())
            .then(data => {
                const arr = Array.isArray(data) ? data : [];
                const unique = Array.from(new Set(arr.map(s => s.submodel)))
                    .map(sub => arr.find(d => d.submodel === sub));
                setter(unique);
            })
            .catch(err => { console.error(err); setter([]); });
    };

    const fetchTrims = (submodelId, setter) => {
        if (!submodelId) return setter([]);
        fetch(`${VERCEL_BASE_URL}/api/trims?submodel_id=${submodelId}`)
            .then(res => res.json())
            .then(data => {
                const arr = Array.isArray(data) ? data : [];
                const unique = Array.from(new Set(arr.map(t => t.trim)))
                    .map(trim => arr.find(d => d.trim === trim));
                setter(unique);
            })
            .catch(err => { console.error(err); setter([]); });
    };

    const fetchDetails = (trimId, setEngines, setBodies) => {
        if (!trimId) { setEngines([]); setBodies([]); return; }
        fetch(`${VERCEL_BASE_URL}/api/engines?trim_id=${trimId}`)
            .then(res => res.json())
            .then(data => setEngines(Array.isArray(data) ? data : []))
            .catch(err => { console.error(err); setEngines([]); });

        fetch(`${VERCEL_BASE_URL}/api/bodies?trim_id=${trimId}`)
            .then(res => res.json())
            .then(data => setBodies(Array.isArray(data) ? data : []))
            .catch(err => { console.error(err); setBodies([]); });
    };

    const handleChange = (carNum, field, value) => {
        if (carNum === 1) {
            const updated = { ...car1, [field]: value };
            setCar1(updated);
            if (field === "make") { setModels1([]); setSubmodels1([]); setTrims1([]); setEngines1([]); setBodies1([]); fetchModels(value, setModels1); }
            if (field === "model") { setSubmodels1([]); setTrims1([]); setEngines1([]); setBodies1([]); fetchSubmodels(car1.make, value, setSubmodels1); }
            if (field === "submodel") { setTrims1([]); setEngines1([]); setBodies1([]); fetchTrims(value, setTrims1); }
            if (field === "trim") { setEngines1([]); setBodies1([]); fetchDetails(value, setEngines1, setBodies1); }
        } else {
            const updated = { ...car2, [field]: value };
            setCar2(updated);
            if (field === "make") { setModels2([]); setSubmodels2([]); setTrims2([]); setEngines2([]); setBodies2([]); fetchModels(value, setModels2); }
            if (field === "model") { setSubmodels2([]); setTrims2([]); setEngines2([]); setBodies2([]); fetchSubmodels(car2.make, value, setSubmodels2); }
            if (field === "submodel") { setTrims2([]); setEngines2([]); setBodies2([]); fetchTrims(value, setTrims2); }
            if (field === "trim") { setEngines2([]); setBodies2([]); fetchDetails(value, setEngines2, setBodies2); }
        }
    };

    const handleCompare = () => {
        setShowResults(true);
        setLoadingCompare(true);
        setTimeout(() => setLoadingCompare(false), 300);
    };

    const DropdownColumn = ({ car, carNum, models, submodels, trims, align }) => (
        <div className={`car-selector-column ${align}`}>
            <label className="car-selector-label">Make:</label>
            <select className="car-selector-select" value={car.make} onChange={e => handleChange(carNum, "make", e.target.value)} disabled={loadingMakes}>
                {loadingMakes ? <option>Loading Makes...</option> : <>
                    <option value="">Select Make</option>
                    {makes.map(make => <option key={make.id} value={make.id}>{make.name}</option>)}
                </>}
            </select>

            <label className="car-selector-label">Model:</label>
            <select className="car-selector-select" value={car.model} onChange={e => handleChange(carNum, "model", e.target.value)} disabled={!models.length}>
                <option value="">Select Model</option>
                {models.map(model => <option key={model.name} value={model.name}>{model.name}</option>)}
            </select>

            <label className="car-selector-label">Submodel:</label>
            <select className="car-selector-select" value={car.submodel} onChange={e => handleChange(carNum, "submodel", e.target.value)} disabled={!submodels.length}>
                <option value="">Select Submodel</option>
                {submodels.map(sub => <option key={sub.id} value={sub.id}>{sub.submodel}</option>)}
            </select>

            <label className="car-selector-label">Trim:</label>
            <select className="car-selector-select" value={car.trim} onChange={e => handleChange(carNum, "trim", e.target.value)} disabled={!trims.length}>
                <option value="">Select Trim</option>
                {trims.map(trim => <option key={trim.id} value={trim.id}>{trim.trim}</option>)}
            </select>
        </div>
    );

    const ResultColumn = ({ engines, bodies, align }) => {
        if (!showResults) return null;

        return (
            <div className={`car-selector-result-column ${align}`}>
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
            <h2 className="car-selector-title">Car Comparison</h2>

            <div className="car-selector-compare">
                <DropdownColumn car={car1} carNum={1} models={models1} submodels={submodels1} trims={trims1} align="left" />
                <DropdownColumn car={car2} carNum={2} models={models2} submodels={submodels2} trims={trims2} align="right" />
            </div>

            <button className="car-selector-button" onClick={handleCompare}>
                {loadingCompare ? "Comparing..." : "Compare"}
            </button>

            <div className="car-selector-result">
                <ResultColumn engines={engines1} bodies={bodies1} align="left" />
                <ResultColumn engines={engines2} bodies={bodies2} align="right" />
            </div>
        </div>
    );
};

export default CarSelector;
