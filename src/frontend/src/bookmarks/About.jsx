import { GenericDialog, GenericButton } from "@danneschs/libnik-ui";

/**
 * About dialog component
 * @param {*} props (onClose)
 * @returns
 */
function About(props) {
	const { onClose } = props;

	return (
		<GenericDialog
			sxSize="small"
			onClose={onClose}
			dialogTitle="O aplikaci"
			dialogContent={<></>}
			dialogActions={<GenericButton triggerOnEnter={true} onClick={onClose} name="OK" />}
		/>
	);
}

export default About;
