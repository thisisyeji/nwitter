import React, { useState, useEffect, useRef } from 'react';
import { dbService, storageService } from 'fbase';
import {
	collection,
	addDoc,
	onSnapshot,
	query,
	orderBy,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Nweet from 'components/Nweet';

const Home = ({ userObj }) => {
	const [nweet, setNweet] = useState('');
	const [nweets, setNweets] = useState([]);
	const [attachment, setAttachment] = useState('');
	const fileInput = useRef();

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
		let attachmentUrl = '';
		if (attachment !== '') {
			const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
			const response = await uploadString(
				attachmentRef,
				attachment,
				'data_url'
			);
			attachmentUrl = await getDownloadURL(response.ref);
		}
		const nweetObj = {
			text: nweet,
			createdAt: Date.now(),
			creatorId: userObj.uid,
			attachmentUrl,
		};
		// 데이터 추가
		await addDoc(collection(dbService, 'nweets'), nweetObj);
		setNweet('');
		setAttachment('');
	};
	const onChange = (e) => {
		const {
			target: { value },
		} = e;
		setNweet(value);
	};

	const onFileChange = (e) => {
		const {
			target: { files },
		} = e;
		const theFile = files[0];
		const reader = new FileReader();
		reader.onloadend = (finishedEvent) => {
			const {
				currentTarget: { result },
			} = finishedEvent;
			setAttachment(result);
		};
		reader.readAsDataURL(theFile);
	};

	const onClearAttachment = () => {
		setAttachment('');
		fileInput.current.value = '';
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
				<input
					type='file'
					accept='image/*'
					onChange={onFileChange}
					ref={fileInput}
				/>
				<input type='submit' value='Nweet' />
				{attachment && (
					<div>
						<img src={attachment} width='50px' height='50px' />
						<button onClick={onClearAttachment}>Clear</button>
					</div>
				)}
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
