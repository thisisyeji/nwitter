import { authService, dbService } from 'fbase';
import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const Profile = ({ refreshUser, userObj }) => {
	const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
	const [myTweets, setMyTweets] = useState([]);

	const history = useHistory();
	const onLogOutClick = () => {
		authService.signOut();
		history.push('/');
	};

	const getMyNweets = useCallback(async () => {
		const q = query(
			collection(dbService, 'nweets'),
			where('creatorId', '==', `${userObj.uid}`),
			orderBy('createdAt', 'desc')
		);

		const querySnapshot = await getDocs(q);
		const newTweets = querySnapshot.docs.map((doc) => ({
			// console.log(doc.id, '=>', doc.data());
			...doc.data(),
		}));
		setMyTweets(newTweets);
	}, [userObj.uid]);

	const onChange = (e) => {
		const {
			target: { value },
		} = e;
		setNewDisplayName(value);
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		if (userObj.displayName !== newDisplayName) {
			await updateProfile(authService.currentUser, {
				displayName: newDisplayName,
			});
			refreshUser();
		}
	};

	useEffect(() => {
		getMyNweets();
	}, [getMyNweets]);

	return (
		<>
			<form onSubmit={onSubmit}>
				<input
					type='text'
					placeholder='Display name'
					onChange={onChange}
					value={newDisplayName}
				/>
				<input type='submit' value='Update Profile' />
			</form>
			<button onClick={onLogOutClick}>Log Out</button>

			<div>
				{myTweets.map((tw, idx) => (
					<div key={idx}>
						<h4>{tw.text}</h4>
					</div>
				))}
			</div>
		</>
	);
};

export default Profile;
