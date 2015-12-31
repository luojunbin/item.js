/**
 * @fileOverview fieldTool工具方法测试
 */

var l = console.log.bind(console);

var nameInput = document.getElementById('nameInput');
var valueInput = document.getElementById('valueInput');

var formInput = document.forms[0];

E.on(formInput, 'keyup', function (e) {
    var name = nameInput.value;
    var value = valueInput.value;

    var fileds = formTest.elements[name];

    if (fileds) {
        // checkbox要传一个数组
        if (fieldTool.getProp(fileds, 'type') === 'checkbox') {
            value = value.split(',');
        }
        // setValue测试, value为''或[]即reset测试
        fieldTool.setValue(fileds, value);
    }

});






var formTest = document.forms[1];

E.on(formTest, 'change', function (e) {
    var name = E.getTarget(e).name;
    var fileds = formTest.elements[name];

    nameInput.value = fieldTool.getProp(fileds, 'name');
    valueInput.value = fieldTool.getValue(fileds);
});

E.on(formTest, 'keyup', function (e) {
    var name = E.getTarget(e).name;
    var fileds = formTest.elements[name];

    // getProp测试
    nameInput.value = fieldTool.getProp(fileds, 'name');

    // getValue测试
    valueInput.value = fieldTool.getValue(fileds);
});