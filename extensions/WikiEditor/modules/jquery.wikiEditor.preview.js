/* Preview module for wikiEditor */
( function ( $, mw ) {
/*jshint onevar:false */
$.wikiEditor.modules.preview = {

/**
 * Compatability map
 */
browsers: {
	// Left-to-right languages
	ltr: {
		msie: [['>=', 7]],
		firefox: [['>=', 3]],
		opera: [['>=', 9.6]],
		safari: [['>=', 4]]
	},
	// Right-to-left languages
	rtl: {
		msie: [['>=', 8]],
		firefox: [['>=', 3]],
		opera: [['>=', 9.6]],
		safari: [['>=', 4]]
	}
},

/**
 * Internally used functions
 */
fn: {
	/**
	 * Creates a preview module within a wikiEditor
	 * @param context Context object of editor to create module in
	 * @param config Configuration object to create module from
	 */
	create: function ( context ) {
		if ( 'initialized' in context.modules.preview ) {
			return;
		}
		context.modules.preview = {
			'initialized': true,
			'previewText': null,
			'changesText': null
		};
		context.modules.preview.$preview = context.fn.addView( {
			'name': 'preview',
			'titleMsg': 'wikieditor-preview-tab',
			'init': function ( context ) {
				// Gets the latest copy of the wikitext
				var wikitext = context.$textarea.textSelection( 'getContents' );
				// Aborts when nothing has changed since the last preview
				if ( context.modules.preview.previewText === wikitext ) {
					return;
				}
				context.modules.preview.$preview.find( '.wikiEditor-preview-contents' ).empty();
				context.modules.preview.$preview.find( '.wikiEditor-preview-loading' ).show();
				$.ajax( {
					url: mw.util.wikiScript( 'api' ),
					type: 'POST',
					dataType: 'json',
					data: {
						format: 'json',
						action: 'parse',
						title: mw.config.get( 'wgPageName' ),
						text: wikitext,
						prop: 'text|modules',
						pst: ''
					}
				} ).done( function ( data ) {
					if ( !data.parse || !data.parse.text || data.parse.text['*'] === undefined ) {
						return;
					}

					context.modules.preview.previewText = wikitext;
					context.modules.preview.$preview.find( '.wikiEditor-preview-loading' ).hide();
					context.modules.preview.$preview.find( '.wikiEditor-preview-contents' )
						.html( data.parse.text['*'] )
						.find( 'a:not([href^=#])' )
							.click( false );

					var loadmodules = data.parse.modules.concat(
						data.parse.modulescripts,
						data.parse.modulestyles,
						data.parse.modulemessages
					);
					mw.loader.load( loadmodules );
				} );
			}
		} );

		context.$changesTab = context.fn.addView( {
			'name': 'changes',
			'titleMsg': 'wikieditor-preview-changes-tab',
			'init': function ( context ) {
				// Gets the latest copy of the wikitext
				var wikitext = context.$textarea.textSelection( 'getContents' );
				// Aborts when nothing has changed since the last time
				if ( context.modules.preview.changesText === wikitext ) {
					return;
				}
				context.$changesTab.find( 'table.diff tbody' ).empty();
				context.$changesTab.find( '.wikiEditor-preview-loading' ).show();

				// Call the API. First PST the input, then diff it
				$.ajax( {
					url: mw.util.wikiScript( 'api' ),
					type: 'POST',
					dataType: 'json',
					data: {
						format: 'json',
						action: 'parse',
						title: mw.config.get( 'wgPageName' ),
						onlypst: '',
						text: wikitext
					}
				} ).done( function ( data ) {
					try {
						var postdata2 = {
							format: 'json',
							action: 'query',
							indexpageids: '',
							prop: 'revisions',
							titles: mw.config.get( 'wgPageName' ),
							rvdifftotext: data.parse.text['*'],
							rvprop: ''
						};
						var section = $( '[name="wpSection"]' ).val();
						if ( section !== '' ) {
							postdata2.rvsection = section;
						}

						$.ajax( {
							url: mw.util.wikiScript( 'api' ),
							type: 'POST',
							dataType: 'json',
							data: postdata2
						} ).done( function ( data ) {
							// Add diff CSS
							mw.loader.load( 'mediawiki.action.history.diff' );
							try {
								var diff = data.query.pages[data.query.pageids[0]]
									.revisions[0].diff['*'];

								context.$changesTab.find( 'table.diff tbody' ).html( diff );
								context.modules.preview.changesText = wikitext;
							} catch ( e ) {
								// "data.blah is undefined" error, ignore
							}
							context.$changesTab.find( '.wikiEditor-preview-loading' ).hide();
						} );
					} catch ( e ) {
						// "data.blah is undefined" error, ignore
					}
				} );
			}
		} );

		var loadingMsg = mw.msg( 'wikieditor-preview-loading' );
		context.modules.preview.$preview
			.add( context.$changesTab )
			.append( $( '<div>' )
				.addClass( 'wikiEditor-preview-loading' )
				.append( $( '<img>' )
					.addClass( 'wikiEditor-preview-spinner' )
					.attr( {
						'src': $.wikiEditor.imgPath + 'dialogs/loading.gif',
						'valign': 'absmiddle',
						'alt': loadingMsg,
						'title': loadingMsg
					} )
				)
				.append(
					$( '<span>' ).text( loadingMsg )
				)
			)
			.append( $( '<div>' )
				.addClass( 'wikiEditor-preview-contents' )
			);
		context.$changesTab.find( '.wikiEditor-preview-contents' )
			.html( '<table class="diff"><col class="diff-marker"/><col class="diff-content"/>' +
				'<col class="diff-marker"/><col class="diff-content"/><tbody/></table>' );
	}
}

};

}( jQuery, mediaWiki ) );
