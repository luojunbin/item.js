/**
 * @fileOverview IE8- 下change方法兼容;
 */

E.on(document.forms[0], 'change', function (e) {
    var target = E.getTarget(e);
    console.log(target.tagName, ' value is ', target.value);
});