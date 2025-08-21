import React, {useState} from 'react';
import useThreads from "../../hooks/useThreads";
import TestComments from "./TestComments";


const initialFormData = {
    "title": "",
    "description": "",
    "image": null,
    "upvotes":0,
    "downvotes":0,
}

const TestThreads = () => {

    const {threads, onAdd, onDelete, onUpdate} = useThreads()

    const [formData, setFormData] = useState(initialFormData)

    const handleChange = (event) => {
        const {name, value} = event.target
        setFormData({...formData, [name]: value})
    }

    const handleSubmit = () => {
        onAdd({...formData,createdAt: new Date()})
        setFormData(initialFormData)
    }

    //TODO: ovozmozuvanje slika

    return (


        <div>
            <h2>Threads</h2>
            <p>Add a new thread</p>
            Title: <input onChange={handleChange} name="title" value={formData.title}/>
            Description: <textarea onChange={handleChange} name="description" value={formData.description}></textarea>
            Image: <input name="image" value={formData.image}/>
            <button onClick={handleSubmit}>Post</button>
            {threads.map(thread => (
                <li key={thread.id}>
                    <h3>{thread.title}</h3>
                    <p>{thread.description}</p>
                    {/* Kopcinjata ne rabotat ke se pravat zaedno so update*/}
                    Upvotes: {thread.upvotes}
                    <button>Upvote</button>
                    Downvotes: {thread.downvotes}
                    <button>Downvote</button>
                    <p>
                        Posted At:{thread.createdAt.toDate().toString().split(" GMT")[0]}
                    </p>
                    <button onClick={() => {
                        onDelete(thread.id)
                    }}>Delete Thread
                    </button>
                    <h5>Comments for this thread:</h5>
                    <TestComments threadId={thread.id}/>
                </li>
            ))}
        </div>
    );
};

export default TestThreads;