import React, { useState, useEffect } from 'react';
import AppRouter from 'components/Router';
import { authService } from 'fbase';

function App() {
	const [init, setInit] = useState(false);
	const [userObj, setUserObj] = useState(null);

	useEffect(() => {
		authService.onAuthStateChanged((user) => {
			if (user) {
				setUserObj(user);
				// displayName 받아올 수 있도록 수정
				if (user.displayName === null) {
					const name = user.email.split('@')[0];
					user.displayName = name;
				}
			}
			setInit(true);
		});
	}, []);
	const refreshUser = () => {
		const user = authService.currentUser;
		setUserObj({ ...user });
	};

	return (
		<>
			{init ? (
				<AppRouter
					refreshUser={refreshUser}
					isLoggedIn={Boolean(userObj)}
					userObj={userObj}
				/>
			) : (
				'Initializing...'
			)}
		</>
	);
}

export default App;
