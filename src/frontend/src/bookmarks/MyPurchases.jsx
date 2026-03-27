import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@auth/AuthContext";

import { GenericTable } from "@danneschs/libnik-ui";
import EditPurchaseDialog from "@dialogs/EditPurchaseDialog.jsx";
import getPurchaseColumns from "@columns/getPurchaseColumns.jsx";
import NotLogged from "@bookmarks/NotLogged.jsx";
import { getMyPurchasesService } from "@api/purchases";
import { showPurchaseDetails } from "@api/wrappers/showPurchaseDetails";
import { addPurchaseService } from "@api/purchases";
import { removePurchaseService } from "@api/purchases";
import { getAllUsersService } from "@api/users";
import { updatePurchaseService } from "@api/purchases";
import PurchaseMapper from "@mappers/purchaseMapper.js";
import { ConfigContext } from "@config/ConfigContext";
import { ToastBar } from "@danneschs/libnik-ui";

/**
 * Component for displaying user's purchases
 * Bookmark component
 * @returns
 */
function MyPurchases() {
	const [showAdd, setShowAdd] = useState(false);
	const [showDetail, setShowDetail] = useState(false);

	const { currentUser } = useContext(AuthContext);
	const [allUsers, setAllUsers] = useState([]);
	const [clickedPurchase, setClickedPurchase] = useState({});
	const [myPurchases, setMyPurchases] = useState([]);
	const [toastBarSettings, setToastBarSettings] = useState(null);

	const { currencyFormat } = useContext(ConfigContext);

	const token = localStorage.getItem("jwtToken");
	useEffect(() => {
		// Fetch my purchases from the server when the component mounts
		const getMyPurchases = async () => {
			try {
				const fetchedPurchases = await getMyPurchasesService(token);
				setMyPurchases(fetchedPurchases);
			} catch (error) {
				console.error("Error fetching my purchases:", error);
			}
		};

		const fetchData = async () => {
			try {
				await getMyPurchases();
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

	const setSuccessToastBar = (message) => {
		setToastBarSettings({
			message: message,
			type: "success",
			onClose: () => setToastBarSettings(null),
		});
	};

	const setErrorToastBar = (message) => {
		setToastBarSettings({
			message: message,
			type: "error",
			onClose: () => setToastBarSettings(null),
		});
	};

	const handleActionButtonClick = async (row) => {
		showPurchaseDetails(row, token, setAllUsers, setClickedPurchase, setShowDetail);
	};

	const columns = getPurchaseColumns(handleActionButtonClick, "Upravit", currencyFormat);

	const handleAddPurchase = async (newPurchase) => {
		try {
			const postPurchase = PurchaseMapper.fromEditToPost(newPurchase, currentUser.id, 0);
			const getPurchase = await addPurchaseService(postPurchase, token);
			if (getPurchase.id) {
				setMyPurchases((prevPurchases) => [...prevPurchases, { ...getPurchase, id: getPurchase.id }]);
				setSuccessToastBar("Nákup byl úspěšně přidán.");
			} else {
				console.error("Error adding purchase:", getPurchase);
				setErrorToastBar("Došlo k neočekáváné chybě při přidávání nákupu.");
			}
		} catch (error) {
			setErrorToastBar("Došlo k neočekáváné chybě při přidávání nákupu.");
			console.error("Error adding purchase:", error);
		}
	};

	const handleUpdatePurchase = async (updatedPurchase) => {
		try {
			const postPurchase = PurchaseMapper.fromEditToPost(updatedPurchase, currentUser.id, updatedPurchase.id);

			const getPurchase = await updatePurchaseService(postPurchase, token);

			if (getPurchase.id) {
				setMyPurchases((prevPurchases) =>
					prevPurchases.map((purchase) =>
						purchase.id === getPurchase.id ? { ...purchase, ...getPurchase } : purchase
					)
				);
				setSuccessToastBar("Nákup byl úspěšně upraven.");
			} else {
				console.error("Error updating purchase:", getPurchase);
				setErrorToastBar("Došlo k neočekáváné chybě při úpravě nákupu.");
			}
		} catch (error) {
			setErrorToastBar("Došlo k neočekáváné chybě při úpravě nákupu.");
			console.error("Error updating purchase:", error);
		}
	};

	const handleDeletePurchase = async (purchaseIdToRemove) => {
		try {
			await removePurchaseService(purchaseIdToRemove, token);
			setMyPurchases((prevPurchases) => prevPurchases.filter((purchase) => purchase.id !== purchaseIdToRemove));
		} catch (error) {
			console.error(`Error removing purchase with id ${purchaseIdToRemove}:`, error);
		}
	};

	const handleClickAdd = () => async () => {
		setShowAdd(true);
		const allUsers = await getAllUsersService(token);
		setAllUsers(allUsers || []);
	};

	return (
		<>
			<GenericTable rows={myPurchases} columns={columns} toolbarActions={{ handleAddItem: handleClickAdd() }} />
			{showAdd && (
				<EditPurchaseDialog
					title="Přidat nákup"
					editMode="add"
					onClose={() => setShowAdd(false)}
					allUsers={allUsers}
					currentUserId={currentUser.id}
					thisPurchase={null}
					addPurchase={handleAddPurchase}
				/>
			)}
			{showDetail && (
				<EditPurchaseDialog
					editMode="edit"
					title="Upravit nákup"
					onClose={() => setShowDetail(false)}
					allUsers={allUsers}
					currentUserId={currentUser.id}
					thisPurchase={clickedPurchase}
					addPurchase={handleAddPurchase}
					updatePurchase={handleUpdatePurchase}
					deletePurchase={handleDeletePurchase}
				/>
			)}
			{toastBarSettings && <ToastBar {...toastBarSettings} />}
		</>
	);
}

export default MyPurchases;
