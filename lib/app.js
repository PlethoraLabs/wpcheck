'use strict';


require( 'app-module-path' ).addPath( __dirname );
require( 'helpers' );


const
    app = {},
    fs = require( 'fs' ),
    path = require( 'path' ),
    rtrim = require( 'rtrim' ),
    request = require( 'request' ),
    validUrl = require( 'valid-url' );

const
    config = require( 'config' ),
    message = require( 'message' );


/**
 * Initiator method
 *
 * @param   {Object}  data  Initial data
 * @return  void
 */

app.fire = function( data ) {

    // Init
    var siteURL = rtrim( data.siteURL, '/' );

    // Site url validation
    if ( ! validUrl.isWebUri( siteURL ) ) {
        siteURL = siteURL.prepend( 'http://' );
    }

    // Retry site url validation
    if ( ! validUrl.isWebUri( siteURL ) ) {
        message.die( 'Invalid site URL' );
    }

    // Save site url global
    data.siteURL = data.wpURL = siteURL;

    // Lookup for siteURL
    app.lookupSiteURL( data );

};


/**
 * Lookup for the site URL
 *
 * @param   {Object}  data  Working data
 * @return  void
 */

app.lookupSiteURL = function( data ) {

    // Init
    const
        siteURL = data.siteURL,
        silent = data.silent;

    // HEAD request
    request.head( siteURL, function( error, response ) {

        // Handle errors
        if ( error || response.statusCode !== 200 ) {
            return message.die( 'Can not resolve ' + siteURL );
        }

        // Override siteURL
        if ( response.hasRedirects() ) {
            const finalURL = rtrim( response.redirectURL(), '/' );

            if ( validUrl.isWebUri( finalURL ) ) {
                data.siteURL = data.wpURL = finalURL;

                message.info( 'New site URL: ' + siteURL + ' \u2192 ' + data.siteURL, silent );
            }
        }

        // Lookup for wpURL
        app.lookupWpURL( data );

    } );

};


/**
 * Lookup for the WordPress URL
 *
 * @param   {Object}  data  Working data
 * @return  void
 */

app.lookupWpURL = function( data ) {

    // Init
    const
        wpURL = data.wpURL,
        siteURL = data.siteURL,
        silent = data.silent;

    // HEAD request
    request.head( config.testFile.prepend( siteURL ), function( error, response ) {

        // Handle errors
        if ( error || response.statusCode !== 200 ) {
            return app.extractWpURL( data );
        }

        // Override wpURL
        if ( response.hasRedirects() ) {
            const finalURL = rtrim( response.redirectURL(), '/' );

            if ( validUrl.isWebUri( finalURL ) ) {
                data.wpURL = finalURL;

                // Small talk
                message.info( 'New WordPress URL: ' + wpURL + ' \u2192 ' + data.wpURL, silent );
            }
        }

        // Load all rules
        return app.loadRules( data );

    } );

};


/**
 * Extract WordPress URL from page content
 *
 * @param   {Object}  data  Working data
 * @return  void
 */

app.extractWpURL = function( data ) {

    // Init
    const
        wpURL = data.wpURL,
        siteURL = data.siteURL,
        silent = data.silent;

    // GET request
    request( wpURL, function ( error, response, body ) {

        // Handle errors
        if ( error || response.statusCode !== 200 ) {
            return message.die( siteURL + ' is not using WordPress (1)' );
        }

        // Identifier not found
        if ( body.indexOf('/wp-') === -1 ) {
            return message.die( siteURL + ' is not using WordPress (2)' );
        }

        // Regexp discovery
        body.match( new RegExp( '["\'](https?[^"\']+)\/wp-(?:content|includes)' ) );

        // Unescape matches
        const parsedURL = RegExp.$1.unescape();

        // Validate URL
        if ( ! validUrl.isWebUri( parsedURL ) ) {
            return message.die( siteURL + ' is not using WordPress (3)' );
        }

        // Override wpURL
        data.wpURL = parsedURL;

        // Small talk
        message.info( 'New WordPress URL: ' + wpURL + ' \u2192 ' + data.wpURL, silent );

        // Load all rules
        return app.loadRules( data );

    } );

};


/**
 * Load module rules from rules folder
 *
 * @param   {Object}  data  Working data
 * @return  void
 */

app.loadRules = function( data ) {

    // Init rules dirs
    var dirs = [ path.join( __dirname, config.rulesDir ) ];

    // Handle custom rules dir
    if ( data.rulesDir ) {
        if ( ! path.isAbsolute( data.rulesDir ) ) {
            data.rulesDir = path.join( __dirname, data.rulesDir );
        }

        dirs.push( data.rulesDir );
    }

    // Normalize paths
    dirs.map( function( dir ) {
        return path.normalize( dir );
    } );

    // Loop available paths
    dirs.forEach( function( dir ) {

        fs.readdir( dir, function( error, files ) {

            if ( error ) {
                return message.die( error );
            }

            files.map( function( file ) {

                return path.join( dir, file );

            } ).filter( function( file ) {

                return fs.statSync( file ).isFile() && path.extname( file ) === '.js';

            } ).forEach( function( file ) {

                // Require & start rule
                try {
                    require( file ).fire( data );
                } catch( error ) {
                    return message.die( error );
                }

            } );

        } );

    } );

};

module.exports = app;