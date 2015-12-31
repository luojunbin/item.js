/**
 * @fileOverview IE8- 下change方法兼容, 控制台输出的值将与chrome下保持一致;
 */

E.on(document.forms[0], 'change', function (e) {
    var target = E.getTarget(e);
    console.log(target.tagName, ' value is ', target.value);
});