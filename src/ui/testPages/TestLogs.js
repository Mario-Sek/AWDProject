import React, {useState} from 'react';
import useLogs from "../../hooks/useLogs";
import useCars from "../../hooks/useCars";


const initialFormData = {
    "ac":"",
    "average_fuel":"",
    "fuel_liters":"",
    "fuel_price":"",
    "km_stand":"",
    "road_condition":"",
    "road_type":"",
    "distance_traveled":""
}

const TestLogs = ({carId}) => {

    const {logs, onDelete,onAdd} = useLogs(carId)
    const {findById} = useCars()

    const [formData,setFormData] = useState(initialFormData)

    const handleChange=(event)=>{
        const {name,value} = event.target
        setFormData({...formData,[name]:value})
    }

    const handleSubmit=()=>{
        onAdd(formData)
        setFormData(initialFormData)
    }

    //TODO: Toggle kopche za da ne se prikazuvaat za sekoja 10000 input polinja
    return (
        <div>
            Kilometers: <input type="number" name="km_stand" value={formData.km_stand} onChange={handleChange}/> <br/>
            Fuel liters: <input type="number" name="fuel_liters" value={formData.fuel_liters} onChange={handleChange}/> <br/>
            Fuel price: <input type="number" name="fuel_price" value={formData.fuel_price} onChange={handleChange}/> <br/>
            Distance traveled: <input type="number" name="distance_traveled" value={formData.distance_traveled}/> <br/>
            Average consumption: <input type="number" name="average_fuel" value={formData.average_fuel} onChange={handleChange}/> <br/>
            Road condition: <select name="road_condition" onChange={handleChange}>
                <option value="">Select an option</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Snow">Snow</option>
                <option value="Ice">Ice</option>
                <option value="Fog">Fog</option>
                <option value="Rain">Rain</option>
            </select><br/>
            Road type: <select name="road_type" onChange={handleChange}>
                <option value="">Select an option</option>
                <option value="City">City</option>
                <option value="Open Road">Open Road</option>
                <option value="Highway">Highway</option>
                <option value="Combined">Combined</option>
            </select><br/>
            A/C: <select name="ac" onChange={handleChange}>
                <option value="">Select an option</option>
                <option value="true">A/C</option>
                <option value="false">No A/C</option>
            </select><br/>
            <button onClick={handleSubmit}>Add log</button>
            {logs.map(l => (
                <p key={l.id}>
                    {l.km_stand}km {l.fuel_liters}l {l.fuel_price}$ {l.average_fuel}l/100 {l.ac ? "A/C" : "no A/C"} {l.road_condition}
                    <button onClick={() => onDelete(l.id)}>
                        Delete this log
                    </button>
                </p>
            ))}
        </div>
    );
};

export default TestLogs;