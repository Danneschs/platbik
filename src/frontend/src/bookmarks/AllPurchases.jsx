import { useState, useContext } from "react";

import { GenericTable } from "@danneschs/libnik-ui";
import getPurchaseColumns from "@columns/getPurchaseColumns.jsx";
import EditPurchaseDialog from "@dialogs/EditPurchaseDialog.jsx";
import { getAllPurchasesService } from "@api/purchases";
import { useEffect } from "react";
import { showPurchaseDetails } from "@api/wrappers/showPurchaseDetails";
import { AuthContext } from "@auth/AuthContext";
import NotLogged from "@bookmarks/NotLogged.jsx";
import { ConfigContext } from "@config/ConfigContext";

/**
 * Component for displaying all purchases
 * Main bookmark
 * @returns
 */
function AllPurchases() {
	const [showDetail, setShowDetail] = useState(false);
	const [allPurchases, setAllPurchases] = useState([]);
	const [clickedPurchase, setClickedPurchase] = useState({});

	const { currentUser } = useContext(AuthContext);

	const [allUsers, setAllUsers] = useState([]);
	const { currencyFormat } = useContext(ConfigContext);
	// Fetch all purchases from the server when the component mounts
	const token = localStorage.getItem("jwtToken");
	useEffect(() => {
		// Fetch all purchases from the server when the component mounts
		const getAllPurchases = async () => {
			try {
				const fetchedPurchases = await getAllPurchasesService(token);
				setAllPurchases(fetchedPurchases);
			} catch (error) {
				console.error("Error fetching all purchases:", error);
			}
		};

		const fetchData = async () => {
			try {
				await getAllPurchases();
			} catch (error) {
				console.error("Error fetching all users:", error);
			}
		};
		if (!currentUser) return;
		fetchData();
	}, [token, currentUser]);

	if (!currentUser) {
		return <NotLogged />;
	}

	const handleActionButtonClick = async (row) => {
		showPurchaseDetails(row, localStorage.getItem("jwtToken"), setAllUsers, setClickedPurchase, setShowDetail);
	};

	const columns = getPurchaseColumns(handleActionButtonClick, null, currencyFormat);

	return (
		<>
			<GenericTable rows={allPurchases} columns={columns} />
			{showDetail && (
				<EditPurchaseDialog
					editMode="readOnly"
					title="Detail nákupu"
					allUsers={allUsers}
					currentUserId={currentUser.id}
					thisPurchase={clickedPurchase}
					onClose={() => setShowDetail(false)}
				/>
			)}
		</>
	);
}
export default AllPurchases;
