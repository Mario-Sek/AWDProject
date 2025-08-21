import React, {useState} from 'react';
import useReplies from "../../hooks/useReplies";
import useUsers from "../../hooks/useUsers";

const initialFormData={
    "description":"",
    "upvotes":0,
    "downvotes":0
}

const TestReplies = ({threadId, commentId}) => {

    const {replies,onAdd,onDelete,onUpdate} = useReplies(threadId, commentId)
    const {findUserById} = useUsers()

    const [formData, setFormData] = useState(initialFormData)
    const handleChange = (event) => {
        const {name, value} = event.target
        setFormData({...formData, [name]: value})
    }

    const handleSubmit = () => {
        onAdd({...formData, createdAt: new Date(),userId:"kq8midnwqcq36blYeyBT"}) //ovie se za testiranje, inace ke bide toj shto e logiran
        setFormData(initialFormData)
    }

    return (
        <div>
            <p>Add a reply:</p>
            Description: <textarea onChange={handleChange} name="description" value={formData.description}></textarea>
            <button onClick={handleSubmit}>Reply</button>
            <h6>Replies: </h6>
            {replies.map(r => (
                <li key={r.id}>
                    <h6>
                        {findUserById(r.userId).username}
                    </h6>
                    <p>{r.description}</p>
                    Upvotes: {r.upvotes} Downvotes: {r.downvotes}
                    <p>
                        Posted At:{r.createdAt.toDate().toString().split(" GMT")[0]}
                    </p>
                    <button onClick={()=>{
                        onDelete(r.id)
                    }}>Delete reply</button>
                </li>
            ))}
        </div>
    );
};

export default TestReplies;