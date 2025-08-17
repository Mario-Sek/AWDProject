//testing

import useUsers from './hooks/useUsers'

import React from 'react';

const HomePage = () => {

    const {users} = useUsers()

    return (
        <div>
            {users.map(u=>(
                <li key={u.id}>
                    {u.name} {u.surname}
                </li>
            ))}
        </div>
    );
};

export default HomePage;