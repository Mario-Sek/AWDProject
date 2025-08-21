import React, {useState} from 'react';
import useComments from "../../hooks/useComments";
import useUsers from "../../hooks/useUsers";
import TestReplies from "./TestReplies";

const initialFormData = {
    "description": "",
    "downvotes": 0,
    "upvotes": 0,
    "image": null,
}

const TestComments = ({threadId}) => {  //treba da se destrukturira posto prakjam kako prop

    const {comments,onAdd,onDelete,onUpdate} = useComments(threadId)
    const {findUserById} = useUsers()

    const [formData, setFormData] = useState(initialFormData)
    const handleChange = (event) => {
        const {name, value} = event.target
        setFormData({...formData, [name]: value})
    }

    const handleSubmit = () => {
        onAdd({...formData, createdAt: new Date(),userId:"Pk4sB7ioqzMF7XxhMfjh"}) //ovie se za testiranje, inace ke bide toj shto e logiran
        setFormData(initialFormData)
    }


    return (

        <div>
            <p>Add a comment</p>
            Description: <textarea onChange={handleChange} name="description" value={formData.description}></textarea>
            Image: <input name="image" value={formData.image}/>
            <button onClick={handleSubmit}>Post</button>
            {
                comments.map(c => (
                    <li key={c.id}>
                        <h6>
                            {findUserById(c.userId).username}
                        </h6>
                        <p>{c.description}</p>
                        Upvotes: {c.upvotes} Downvotes: {c.downvotes}
                        <p>
                            Posted At:{c.createdAt.toDate().toString().split(" GMT")[0]}
                        </p>
                        <button onClick={()=>{
                            onDelete(c.id)
                        }}>Delete comment</button>

                        <TestReplies threadId={threadId} commentId={c.id}/>
                    </li>
                ))
            }

        </div>
    );
};

export default TestComments;