import React, { useState, useRef } from 'react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storageService, dbService } from 'fbase';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc } from 'firebase/firestore';

const NweetFactory = ({ userObj }) => {
	const [nweet, setNweet] = useState('');
	const [attachment, setAttachment] = useState('');
	const fileInput = useRef();

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
	);
};

export default NweetFactory;
