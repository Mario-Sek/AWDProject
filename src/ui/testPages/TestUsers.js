//testing

import useUsers from '../../hooks/useUsers'

import React from 'react';

const TestUsers = () => {

    const {users} = useUsers()

    return (
        <div>
            <h2>Users Page</h2>
            {users.map(u=>(
                <li key={u.id}>
                    {u.name} {u.surname} {u.username} {u.email} {u.id}
                </li>
            ))}
        </div>
    );
};

export default TestUsers;