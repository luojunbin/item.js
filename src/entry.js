var EForm = require('./eform.js');
window.EForm = EForm;
if ( typeof define === "function" && define.amd && define.amd.itemJs ) {
    define( "itemJs", [], function () { return EForm; } );
}
