import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCars from "../../hooks/useCars";
import default_car from "../../images/default-car.png"
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../config/firebase";

const fuelOptions = ["Petrol", "Diesel", "Electric", "Hybrid"];
const yearOptions = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

const VERCEL_BASE_URL = "https://carapi-zeta.vercel.app";

const CarEditPage = () => {
    const { id } = useParams();
    const { findById, onUpdate } = useCars();
    const navigate = useNavigate();

    const [car, setCar] = useState(null);
    const [formData, setFormData] = useState({
        make: "",
        model: "",
        year: "",
        reg_plate: "",
        fuel: "",
        image: "",
        hp:"",
        preview:""
    });

    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);

    // Load car and fetch makes
    useEffect(() => {
        const foundCar = findById(id);
        if (foundCar) {
            setCar(foundCar);
            setFormData({
                make: foundCar.make || "",
                model: foundCar.model || "",
                year: foundCar.year || "",
                reg_plate: foundCar.reg_plate || "",
                fuel: foundCar.fuel || "",
                image: foundCar.image || "",
                hp: foundCar.hp || "",
                preview: foundCar.image || default_car
            });
        }

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
    }, [id, findById]);

    // Fetch models when make changes
    useEffect(() => {
        if (!formData.make) return setModels([]);
        const fetchModels = async () => {
            try {
                const res = await fetch(`${VERCEL_BASE_URL}/api/models?make_id=${formData.make}`);
                const data = await res.json();
                setModels(Array.isArray(data) ? data : []);
            } catch {
                setModels([]);
            }
        };
        fetchModels();
    }, [formData.make]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "make") setFormData((prev) => ({ ...prev, model: "" }));
    };

    const handleSave = async () => {
        if (!formData.make || !formData.model || !formData.year) {
            alert("Please fill in make, model, and year.");
            return;
        }
        let imageUrl = ""
        if (formData.image instanceof File) {
            const imageRef = ref(storage, `cars/${formData.image.name}`);
            await uploadBytes(imageRef, formData.image);
            imageUrl = await getDownloadURL(imageRef);
        }

        onUpdate({...car, ...formData,image:imageUrl}, car.id);
        navigate(`/cars/${car.id}`);
    };

    if (!car) return <div style={{ padding: "2rem" }}>Car not found</div>;

    const containerStyle = {
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
        background: "#fff",
        fontFamily: "'Inter', sans-serif",
    };

    const labelStyle = { display: "block", marginBottom: "0.25rem", fontWeight: 500, marginTop: "1rem" };
    const inputStyle = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" };
    const buttonStyle = { padding: "0.5rem 1rem", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer", backgroundColor: "#1d4ed8", color: "#fff" };
    const cancelButtonStyle = { ...buttonStyle, backgroundColor: "#ef4444", marginLeft: "0.5rem" };

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const previewUrl = URL.createObjectURL(file)
            setFormData({...formData, image: file, preview: previewUrl})
        }
    }

    return (
        <div style={containerStyle}>
            <h2 style={{ marginBottom: "1rem" }}>Edit Car</h2>

            <label style={labelStyle}>Make:</label>
            <select style={inputStyle} value={formData.make} onChange={(e) => handleChange("make", e.target.value)}>
                <option value="">Select Make</option>
                {makes.map((make) => <option key={make.id} value={make.id}>{make.name}</option>)}
            </select>

            <label style={labelStyle}>Model:</label>
            <select style={inputStyle} value={formData.model} onChange={(e) => handleChange("model", e.target.value)} disabled={!models.length}>
                <option value="">Select Model</option>
                {models.map((model) => <option key={model.name} value={model.name}>{model.name}</option>)}
            </select>

            <label style={labelStyle}>Year:</label>
            <select style={inputStyle} value={formData.year} onChange={(e) => handleChange("year", e.target.value)}>
                <option value="">Select Year</option>
                {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>

            <label style={labelStyle}>Fuel:</label>
            <select style={inputStyle} value={formData.fuel} onChange={(e) => handleChange("fuel", e.target.value)}>
                <option value="">Select Fuel</option>
                {fuelOptions.map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
            </select>

            <label style={labelStyle}>HP:</label>
            <input type="text" style={inputStyle} value={formData.hp} onChange={(e) => handleChange("hp", e.target.value)} placeholder="Horsepower" />

            <label style={labelStyle}>Plate:</label>
            <input type="text" style={inputStyle} value={formData.reg_plate} onChange={(e) => handleChange("reg_plate", e.target.value)} placeholder="Plate" />

            <div style={{marginBottom: "2rem"}}>
                <label style={labelStyle}>
                    Car Image
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
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
                />
                {formData.preview && (
                    <div style={{marginTop: "1rem"}}>
                        <img
                            src={formData.preview || default_car}
                            alt="Car preview"
                            style={{
                                maxWidth: "200px",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                            }}
                        />
                    </div>

                )}
            </div>
            <div style={{ marginTop: "1.5rem" }}>
                <button style={buttonStyle} onClick={handleSave}>Save</button>
                <button style={cancelButtonStyle} onClick={() => navigate(`/cars/${car.id}`)}>Cancel</button>
            </div>
        </div>
    );
};

export default CarEditPage;
