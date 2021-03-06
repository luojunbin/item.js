// 操作表单工具
var fieldTool = (function () {

    function isNode(field) {
        return field.nodeType === 1;
    }

    // 不能判断select元素
    function isNodeList(field) {
        return 'length' in field;
    }

    // 通过 form.elements[name]获取的 NodeList, 可通过本方法获得 value
    function getValue(field) {

        if (isNode(field)) {
            return field.value;
        }
        if (isNodeList(field)) {
            var len = field.length;
            var value = [];
            var isRadio = getProp(field, 'type') === 'radio';

            // IE8+ 版本浏览器的 radio NodeList可直接通过 value属性访问选中的值
            if (isRadio && 'value' in field) {
                return field.value;
            }
            for (var i = 0; i < len; i++) {
                if (field[i].checked) {
                    // 为 radio, 返回 checked的value
                    if (isRadio) {
                        return field[i].value;
                    }
                    // checkbox, 返回一个数组
                    value.push(field[i].value);
                }
            }
            return isRadio ? '' : value;
        }
    }

    function setValue(field, value) {
        // 元素节点, 直接返回
        if (isNode(field)) {
            return (field.value = value);
        }
        if (isNodeList(field)) {
            var len = field.length;
            var type = getProp(field, 'type');

            // 为''或[]时, reset
            if (value.length === 0) {
                return reset(field);
            }

            if (type === 'radio') {
                while (len--) {
                    if (field[len].value === value) {
                        field[len].checked = true;
                        break;
                    }
                }
            } else if (type === 'checkbox') {
                while (len--) {
                    for (var i = 0, l = value.length; i < l; i++) {
                        if (field[len].value === value[i]) {
                            field[len].checked = true;
                            value.splice(i, 1);
                        }
                    }
                    l === value.length && (field[len].checked = false);
                }
            }
            return value;
        }
    }

    function reset(field) {
        if (isNode(field)) {
            return (field.value = '');
        }

        for (var i = 0, len = field.length; i < len; i++) {
            field[i].checked = false;
        }
    }

    // 创建一个input元素, 判断是否含该属性, 用于兼容性判断
    function support(propName) {
        return propName in document.createElement('input');
    }

    // 属性获取
    function getProp(field, propName) {
        // 待获取的属性是 value的特殊处理
        if (propName === 'value') {
            return getValue(field, propName);
        }
        return propName in field ? field[propName] : field[0][propName];
    }

    // 获取通过
    function getField(field) {
        // 是 DOM元素, 直接返回
        if (isNode(field)) {
            return field;
        }
        // nodeList, 为 checkbox或 radio
        if (isNodeList(field)) {
            var len = field.length;
            // 返回第一个被选中的元素或第一个元素
            while (len--) {
                if (field[len].checked) {
                    return field[len];
                }
            }
            return field[0];
        }
        throw Error(field + 'is not a field');
    }

    return {
        getValue: getValue,
        setValue: setValue,
        reset: reset,
        support: support,
        getProp: getProp,
        getField: getField
    }
})();

// module.exports = fieldTool;