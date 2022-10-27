import React, { useState, useEffect } from 'react';
import { dbService } from 'fbase';
import {
	collection,
	addDoc,
	onSnapshot,
	query,
	orderBy,
} from 'firebase/firestore';
import Nweet from 'components/Nweet';

const Home = ({ userObj }) => {
	const [nweet, setNweet] = useState('');
	const [nweets, setNweets] = useState([]);

	/*
	// 데이터 불러오기 - 이전 데이터를 가져오는 방식
	const getNweets = async () => {
		const dbnweets = await getDocs(collection(dbService, 'nweets'));
		dbnweets.forEach((document) => {
			const nweetObject = {
				...document.data(),
				id: document.id,
			};
			setNweets((prev) => [nweetObject, ...prev]);
		});
	};
  */
	useEffect(() => {
		const q = query(
			collection(dbService, 'nweets'),
			orderBy('createdAt', 'desc')
		);
		onSnapshot(q, (snapshot) => {
			const nweetArray = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setNweets(nweetArray);
		});
	}, []);

	const onSubmit = async (e) => {
		e.preventDefault();
		// 데이터 추가
		await addDoc(collection(dbService, 'nweets'), {
			text: nweet,
			createdAt: Date.now(),
			creatorId: userObj.uid,
		});
		setNweet('');
	};
	const onChange = (e) => {
		const {
			target: { value },
		} = e;
		setNweet(value);
	};

	return (
		<div>
			<form onSubmit={onSubmit}>
				<input
					type='text'
					placeholder="What's on your mind?"
					maxLength={120}
					value={nweet}
					onChange={onChange}
				/>
				<input type='submit' value='Nweet' />
			</form>
			<div>
				{nweets.map((nweet) => (
					<Nweet
						key={nweet.id}
						nweetObj={nweet}
						isOwner={nweet.creatorId === userObj.uid}
					/>
				))}
			</div>
		</div>
	);
};

export default Home;
