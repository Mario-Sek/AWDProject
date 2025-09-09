import React, {useEffect, useState} from "react";
import useCars from "../../hooks/useCars";
import useUsers from "../../hooks/useUsers";
import TestLogs from "./TestLogs";
import {storage} from "../../config/firebase";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";

const FUEL_TYPES = ["Diesel", "Gas", "Hybrid", "Electric"];
const API_BASE_URL = "https://carapi-zeta.vercel.app";

const TestCars = () => {
    const {cars, onAdd, onDelete} = useCars();
    const {findUserById} = useUsers();

    const initialForm = {make: "", model: "", reg_plate: "", year: "", fuel: "", image: "", preview: ""};
    const [formData, setFormData] = useState(initialForm);

    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [loadingMakes, setLoadingMakes] = useState(true);
    const [loadingModels, setLoadingModels] = useState(false);

    useEffect(() => {
        const fetchMakes = async () => {
            setLoadingMakes(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/makes`);
                const data = await res.json();
                setMakes(Array.isArray(data) ? data : data.data || []);
            } catch (err) {
                console.error(err);
                setMakes([]);
            } finally {
                setLoadingMakes(false);
            }
        };
        fetchMakes();
    }, []);

    useEffect(() => {
        if (!formData.make) return setModels([]);
        const fetchModels = async () => {
            setLoadingModels(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/models?make_id=${formData.make}`);
                const data = await res.json();
                setModels(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setModels([]);
            } finally {
                setLoadingModels(false);
            }
        };
        fetchModels();
    }, [formData.make]);

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file){
            const previewUrl = URL.createObjectURL(file)
            setFormData({...formData,image:file,preview: previewUrl})
        }
    }

    const handleAddCar = async () => {
        if (!formData.make || !formData.model || !formData.reg_plate) return;

        let imageUrl = "";

        if (formData.image instanceof File) {
            const imageRef = ref(storage, `cars/${Date.now()}-${formData.image.name}`);
            await uploadBytes(imageRef, formData.image);
            imageUrl = await getDownloadURL(imageRef);
        }

        await onAdd({
            ...formData,
            image: imageUrl, //se cuva url, vo fb si vlece od toj storage
            preview: "",
            createdAt: new Date(),
            userId: "" //da dodadam userId od momentalno logiran
        });

        setFormData(initialForm);
    };


    return (
        <div style={{maxWidth: "800px", margin: "2rem auto", fontFamily: "Arial, sans-serif"}}>
            <h2>Add a Car</h2>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem"}}>
                <div>
                    <label>Make:</label>
                    <select name="make" value={formData.make} onChange={handleChange} disabled={loadingMakes}>
                        {loadingMakes ? <option>Loading Makes...</option> : <>
                            <option value="">Select Make</option>
                            {makes.map(m => <option key={m.id} value={m.make}>{m.name}</option>)}
                        </>}
                    </select>
                </div>

                <div>
                    <label>Model:</label>
                    <select name="model" value={formData.model} onChange={handleChange}
                            disabled={!models.length || loadingModels}>
                        {loadingModels ? <option>Loading Models...</option> : <>
                            <option value="">Select Model</option>
                            {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </>}
                    </select>
                </div>

                <div>
                    <label>Year:</label>
                    <input type="number" name="year" value={formData.year} onChange={handleChange}/>
                </div>

                <div>
                    <label>Registration:</label>
                    <input type="text" name="reg_plate" value={formData.reg_plate} onChange={handleChange}/>
                </div>

                <div>
                    <label>Fuel Type:</label>
                    <select name="fuel" value={formData.fuel} onChange={handleChange}>
                        <option value="">Select Fuel</option>
                        {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                <div>
                    <label>Image</label>
                    <input type="file"
                           accept="image/*"
                           onChange={handleImageChange}/>
                    {
                        formData.preview && (
                            <img src={formData.preview} alt="preview" style={{ maxWidth: "150px", marginTop: "0.5rem" }}/>
                        )
                    }
                </div>
            </div>

            <button onClick={handleAddCar} style={{padding: "0.5rem 1rem", marginBottom: "2rem"}}>Add Car</button>

            <h3>Your Cars</h3>
            <ul style={{listStyle: "none", padding: 0}}>
                {cars.map(car => (
                    <li key={car.id}
                        style={{border: "1px solid #eee", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                        <div><strong>{car.make} {car.model}</strong> ({car.year})</div>
                        <div>Registration: {car.reg_plate}</div>
                        <div>Fuel: {car.fuel}</div>
                        {car.image && <img src={car.image} alt="car"
                                           style={{maxWidth: "150px", borderRadius: "6px", marginTop: "0.5rem"}}/>}
                        <div>Owner: {findUserById(car.userId)?.name || "Unknown"}</div>

                        <TestLogs carId={car.id}/>

                        <button onClick={() => onDelete(car.id)} style={{
                            marginTop: "0.5rem",
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "4px"
                        }}>
                            Delete Car
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TestCars;
