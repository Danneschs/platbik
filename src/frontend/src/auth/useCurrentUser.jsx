import { useState, useEffect } from "react";

/**
 * Custom hook to fetch and return the current user
 * @returns {Object} - { user: Object, loading: boolean }
 */
export function useCurrentUser() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem("token");
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const res = await fetch("/api/me", {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (res.ok) {
					const data = await res.json();
					setUser(data);
				}
			} catch (err) {
				console.error("Chyba při načítání uživatele:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	return { user, loading };
}
