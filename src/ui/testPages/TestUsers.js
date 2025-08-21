import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import useUsers from '../../hooks/useUsers';

const TestUsers = () => {
    const { users, onUpdate } = useUsers();
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', surname: '', username: '' });

    useEffect(() => {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;

        if (firebaseUser && users.length > 0) {
            const firestoreUser = users.find(u => u.uid === firebaseUser.uid);
            if (firestoreUser) {
                setCurrentUser(firestoreUser);
                setEditData({
                    name: firestoreUser.name || '',
                    surname: firestoreUser.surname || '',
                    username: firestoreUser.username || ''
                });
            }
        }
    }, [users]);

    const handleChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

    const handleSave = () => {
        if (!currentUser || !currentUser.docId) {
            alert('Cannot update profile: Firestore document ID not found');
            return;
        }
        onUpdate(currentUser.docId, editData);
        setCurrentUser({ ...currentUser, ...editData });
        setIsEditing(false);
    };

    if (!currentUser) return <div style={{ padding: '2rem', fontSize: '1.2rem' }}>Loading profile...</div>;

    return (
        <div style={{
            maxWidth: '600px',
            margin: '2rem auto',
            padding: '2rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>My Profile</h2>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
                {/* Profile Photo */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '2px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    backgroundColor: '#f0f0f0'
                }}>
                    Photo
                </div>

                {/* Profile Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {isEditing ? (
                        <>
                            <input
                                name="name"
                                value={editData.name}
                                onChange={handleChange}
                                placeholder="Name"
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <input
                                name="surname"
                                value={editData.surname}
                                onChange={handleChange}
                                placeholder="Surname"
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <input
                                name="username"
                                value={editData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{currentUser.name} {currentUser.surname}</div>
                            <div style={{ color: '#555' }}>Username: {currentUser.username}</div>
                        </>
                    )}

                    <div style={{ color: '#555' }}>Email: {currentUser.email}</div>
                    <div style={{ color: '#555' }}>Points: {currentUser.points || 0}</div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#45a049'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#4CAF50'}
                        >
                            {isEditing ? 'Save' : 'Edit Profile'}
                        </button>

                        {isEditing && (
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditData({
                                        name: currentUser.name || '',
                                        surname: currentUser.surname || '',
                                        username: currentUser.username || ''
                                    });
                                }}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestUsers;
