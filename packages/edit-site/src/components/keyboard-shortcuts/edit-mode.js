/**
 * WordPress dependencies
 */
import { useShortcut } from '@wordpress/keyboard-shortcuts';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as interfaceStore } from '@wordpress/interface';
import { createBlock } from '@wordpress/blocks';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';
import { SIDEBAR_BLOCK } from '../sidebar-edit-mode/constants';
import { STORE_NAME } from '../../store/constants';

function KeyboardShortcutsEditMode() {
	const { getEditorMode } = useSelect( editorStore );
	const isBlockInspectorOpen = useSelect(
		( select ) =>
			select( interfaceStore ).getActiveComplementaryArea(
				editSiteStore.name
			) === SIDEBAR_BLOCK,
		[]
	);
	const { switchEditorMode, toggleDistractionFree } =
		useDispatch( editorStore );
	const { enableComplementaryArea, disableComplementaryArea } =
		useDispatch( interfaceStore );
	const { replaceBlocks } = useDispatch( blockEditorStore );
	const { getBlockName, getSelectedBlockClientId, getBlockAttributes } =
		useSelect( blockEditorStore );

	const handleTextLevelShortcut = ( event, level ) => {
		event.preventDefault();
		const destinationBlockName =
			level === 0 ? 'core/paragraph' : 'core/heading';
		const currentClientId = getSelectedBlockClientId();
		if ( currentClientId === null ) {
			return;
		}
		const blockName = getBlockName( currentClientId );
		if ( blockName !== 'core/paragraph' && blockName !== 'core/heading' ) {
			return;
		}
		const attributes = getBlockAttributes( currentClientId );
		const textAlign =
			blockName === 'core/paragraph' ? 'align' : 'textAlign';
		const destinationTextAlign =
			destinationBlockName === 'core/paragraph' ? 'align' : 'textAlign';

		replaceBlocks(
			currentClientId,
			createBlock( destinationBlockName, {
				level,
				content: attributes.content,
				...{ [ destinationTextAlign ]: attributes[ textAlign ] },
			} )
		);
	};

	useShortcut( 'core/edit-site/toggle-block-settings-sidebar', ( event ) => {
		// This shortcut has no known clashes, but use preventDefault to prevent any
		// obscure shortcuts from triggering.
		event.preventDefault();

		if ( isBlockInspectorOpen ) {
			disableComplementaryArea( STORE_NAME );
		} else {
			enableComplementaryArea( STORE_NAME, SIDEBAR_BLOCK );
		}
	} );

	useShortcut( 'core/edit-site/toggle-mode', () => {
		switchEditorMode( getEditorMode() === 'visual' ? 'text' : 'visual' );
	} );

	useShortcut( 'core/edit-site/transform-heading-to-paragraph', ( event ) =>
		handleTextLevelShortcut( event, 0 )
	);

	[ 1, 2, 3, 4, 5, 6 ].forEach( ( level ) => {
		//the loop is based off on a constant therefore
		//the hook will execute the same way every time
		//eslint-disable-next-line react-hooks/rules-of-hooks
		useShortcut(
			`core/edit-site/transform-paragraph-to-heading-${ level }`,
			( event ) => handleTextLevelShortcut( event, level )
		);
	} );

	useShortcut( 'core/edit-site/toggle-distraction-free', () => {
		toggleDistractionFree();
	} );

	return null;
}

export default KeyboardShortcutsEditMode;
