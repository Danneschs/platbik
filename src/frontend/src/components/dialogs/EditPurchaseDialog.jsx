import { useState, useContext } from "react";

import getItemColumns from "@columns/getItemColumns.jsx";
import { GenericButton, ConfirmationDialog, GenericSelect, GenericDialog, GenericTable } from '@danneschs/libnik-ui';

import { TextField, Box, FormControlLabel, Switch, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";

import { EditPurchase } from "@objects/EditPurchase.js";
import { Item } from "@objects/Item.js";
import { ItemDto } from "@objects/ItemDto.js";
import { textFieldSx } from "@danneschs/libnik-ui";
import { ConfigContext } from "@config/ConfigContext";
import { v4 as uuidv4 } from "uuid";


/**
 * Data class for managing selectable user in the co-payers select
 */
class SelectedUser {
	constructor(id, name) {
		this.key = id;
		this.value = name;
	}

	toString() {
		return this.value;
	}
}

/**
 * Data class for managing purchase data in the dialog
 */
class Data {
	constructor(thisPurchase) {
		this.purchaseId = thisPurchase?.id || "";
		this.name = thisPurchase?.name || "";
		this.coPayers = thisPurchase?.coPayers || [];
		this.shopName = thisPurchase?.shopName || "";
		this.items =
			thisPurchase?.items?.length > 0
				? thisPurchase?.items.map(
						(itemDto) => new Item(itemDto.id, itemDto.name, itemDto.quantity, itemDto.priceInCents / 100)
				  )
				: [];
		this.buyerPays = thisPurchase ? thisPurchase.buyerPays : true;
	}
}

/**
 * Dialog for adding/editing/showing purchase details
 * @param {*} onClose -- function to close the dialog
 * @param {*} title -- title of the dialog
 * @param {*} editMode -- mode of the dialog (add/edit/readOnly)
 * @param {*} thisPurchase -- purchase to edit/show details
 * @param {*} allUsers -- list of all users for selecting co-payers
 * @param {*} currentUserId -- id of the current user
 * @param {*} addPurchase -- function to add a new purchase
 * @param {*} updatePurchase -- function to update an existing purchase
 * @param {*} deletePurchase -- function to delete a purchase
 * @returns
 */
function EditPurchaseDialog({
	onClose,
	title,
	editMode,
	thisPurchase,
	allUsers,
	currentUserId,
	addPurchase,
	updatePurchase,
	deletePurchase,
}) {
	const theme = useTheme();
	const [data, setData] = useState(new Data(thisPurchase));
	const [errors, setErrors] = useState({
		name: "",
		coPayers: "",
		shopName: "",
		items: "",
	});

	const { currencyFormat } = useContext(ConfigContext);

	const [confirmDialog, setConfirmDialog] = useState(null);
	const updateData = (field, value) => {
		setData((prev) => ({ ...prev, [field]: value }));
		// clear related error
		setErrors((prev) => ({ ...prev, [field]: "" }));
	};
	/**
	 * Validate the form data
	 * @returns true if there are errors in the form, false otherwise
	 */
	const validateForm = () => {
		const newErrors = {};

		if (!data.name.trim()) newErrors.name = "Zadejte jméno nákupu";
		if (data.coPayers.length <= 0) newErrors.coPayerIds = "Vyberte spoluplatitele";
		if (!data.shopName.trim()) newErrors.shop = "Zadejte název obchodu";
		if (data.items.length <= 0) newErrors.items = "Přidejte alespoň jeden předmět";
		if (data.items.some((item) => item.name.trim() === "" || item.quantity === 0 || item.priceInCents === 0)) {
			newErrors.items = "Vyplňte všechny údaje v položkách";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length > 0;
	};

	/**
	 * Confirms the purchase and adds/updates it
	 */
	const handleSubmitPurchase = () => {
		const priceInCrowns = data.items.reduce((acc, item) => acc + item.priceInCrowns * item.quantity, 0);
		const newPurchase = new EditPurchase(
			data.purchaseId || 0,
			data.name,
			data.coPayers,
			new Date().toISOString(),
			data.shopName,
			priceInCrowns,
			data.items.map((item) => new ItemDto(0, item.name, item.quantity, Math.round(item.priceInCrowns * 100))),
			data.buyerPays
		);

		if (editMode === "edit") {
			updatePurchase(newPurchase);
		} else if (editMode === "add") {
			addPurchase(newPurchase);
		}

		onClose(true);
	};

	/**
	 * Close the confirm dialog if user cancels
	 */
	const handleConfirmDialogClose = () => {
		setConfirmDialog(null);
	};

	/**
	 * Show confirm dialog for adding/updating the purchase
	 */
	const handleConfrirmSubmitPurchase = () => {
		if (validateForm()) return;
		setConfirmDialog({
			title: editMode === "edit" ? "Upravit nákup" : "Přidat nákup",
			content: editMode === "edit" ? "Oprvdu chcete upravit tento nákup?" : "Oprvdu chcete přidat tento nákup?",
			handler: handleSubmitPurchase,
		});
	};

	/**
	 * Delete the purchase
	 */
	const handleDeletePurchase = () => {
		deletePurchase(thisPurchase.id);
		onClose(true);
	};

	/**
	 * Show confirm dialog for deleting the purchase
	 */
	const handleConfirmDeletePurchase = () => {
		setConfirmDialog({
			title: "Smazat nákup",
			content: "Oprvdu chcete smazat tento nákup?",
			handler: handleDeletePurchase,
		});
	};

	/**
	 * Chooses co-payers from the list of users
	 * @param {*} selectedIds -- array of selected user ids to show in the select
	 */
	const handleChooseCoPayer = (selectedIds) => {
		const payers = selectedIds.map((id) => {
			const user = allUsers.find((u) => u.id === id);
			return user;
		});
		updateData("coPayers", payers);
	};

	/**
	 * Adds a new item to the purchase
	 * @param {*} newItem -- new item to add
	 */
	const handleAddItem = () => {
		const newItem = new Item(uuidv4(), "", "", "");
		updateData("items", [...data.items, newItem]);
	};

	/**
	 * Deletes an item from the purchase
	 * @param {*} id -- id of the item to delete
	 */
	const handleDeleteItem = (id) => {
		updateData(
			"items",
			data.items.filter((item) => item.id !== id)
		);
	};

	/**
	 * Updates an item in the item table
	 * @param {*} newRow -- new row data
	 * @returns updated row data
	 */
	const handleRowUpdate = (newRow) => {
		const updatedItem = new Item(newRow.id, newRow.name, Number(newRow.quantity), Number(newRow.priceInCrowns));
		const updatedItems = data.items.map((item) => (item.id === newRow.id ? updatedItem : item));
		updateData("items", updatedItems);
		return { ...newRow, isNew: false };
	};

	// Creates a list of selectable users for the co-payers select
	const selectionList = allUsers
		.filter((user) => user.id !== currentUserId)
		.map((user) => new SelectedUser(user.id, `${user.name} ${user.surname}`));

	// Sets the default selection for the co-payers select, if editMode is not 'add'
	const defaultSelection =
		editMode !== "add" && thisPurchase && thisPurchase.coPayers
			? thisPurchase.coPayers
					.map((cp) => {
						const user = allUsers.find((u) => u.id === cp.id);
						return user ? new SelectedUser(user.id, `${user.name} ${user.surname}`) : null;
					})
					.filter(Boolean)
			: [];

	/**
	 * Switch for setting, if the purchase price should be split just between co-payers or buyer and co-payers
	 * @param {*} event -- event from the switch
	 */
	const handleChangeBuyerPays = (event) => {
		"handleChangeBuyerPays", event.target.checked;
		setData({ ...data, buyerPays: event.target.checked });
	};

	const CustomSwitch = styled(Switch)(({ theme }) => ({
		"& .MuiSwitch-switchBase.Mui-checked": {
			color: theme.palette.primary.main,
			"& + .MuiSwitch-track": {
				backgroundColor: theme.palette.primary.main,
			},
		},
	}));

	return (
		<GenericDialog
			onClose={onClose}
			dialogTitle={title}
			dialogContent={
				<>
					{/* For styling the grid */}
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							gap: 2,
							width: "100%",
							mb: 2,
							marginTop: "10px",
						}}
					>
						<TextField
							slotProps={{
								htmlInput: {
									readOnly: editMode === "readOnly",
								},
							}}
							error={Boolean(errors.name)}
							helperText={errors.name}
							sx={{
								...textFieldSx,
								flex: { md: 1 },
							}}
							label="Název nákupu"
							value={data.name}
							onChange={(e) => updateData("name", e.target.value)}
							fullWidth
						/>
						{/* For styling the grid */}
						<Box
							sx={{
								flex: { md: 1 },
								minWidth: { md: "200px" },
							}}
						>
							<GenericSelect
								readOnly={editMode === "readOnly"}
								error={Boolean(errors.coPayers)}
								helperText={errors.coPayers}
								name="Spoluplatitelé"
								selectOptions={selectionList}
								defaultSelection={defaultSelection.map((u) => u.key)}
								onChange={handleChooseCoPayer}
							/>
						</Box>
						<TextField
							slotProps={{
								htmlInput: {
									readOnly: editMode === "readOnly",
								},
							}}
							error={Boolean(errors.shop)}
							helperText={errors.shop}
							sx={{
								...textFieldSx,
								flex: { md: 1 },
							}}
							label="Název obchodu"
							value={data.shopName}
							onChange={(e) => updateData("shopName", e.target.value)}
							fullWidth
						/>
					</Box>
					<GenericTable
						small={true}
						helperText={errors.items}
						rows={data.items}
						checkForErrors={true}
						columns={getItemColumns(
							handleDeleteItem,
							editMode === "readOnly" ? false : true,
							currencyFormat,
							theme.palette.error.main
						)}
						updateActions={editMode === "readOnly" ? null : { handleRowUpdate }}
						toolbarActions={editMode === "readOnly" ? null : { handleAddItem }}
					/>
				</>
			}
			dialogActions={
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", sm: "row" },
						gap: 1,
						width: "100%",
						justifyContent: "flex-end",
					}}
				>
					<FormControlLabel
						control={
							<CustomSwitch
								checked={data.buyerPays}
								onChange={editMode !== "readOnly" ? handleChangeBuyerPays : () => {}}
							/>
						}
						labelPlacement="start"
						label={data.buyerPays ? "Platí kupující" : "Neplatí kupující"}
					/>
					<GenericButton
						triggerOnEnter={editMode === "readOnly" ? true : false}
						onClick={onClose}
						name="Zavřít"
					/>
					{editMode === "edit" && (
						<GenericButton
							onClick={handleConfirmDeletePurchase}
							name="Smazat nákup"
							color={theme.palette.error.main}
						/>
					)}
					{editMode !== "readOnly" && (
						<GenericButton
							triggerOnEnter={true}
							onClick={handleConfrirmSubmitPurchase}
							name={editMode === "edit" ? "Uložit nákup" : "Přidat nákup"}
						/>
					)}
					{confirmDialog && (
						<ConfirmationDialog
							title={confirmDialog.title}
							content={confirmDialog.content}
							onCancel={handleConfirmDialogClose}
							onConfirm={confirmDialog.handler}
						/>
					)}
				</Box>
			}
		/>
	);
}

export default EditPurchaseDialog;
