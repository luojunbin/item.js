// 操作表单工具
var fieldTool = {

    // 通过 form.elements[name]获取的 NodeList, 可通过本方法获得 value
    getValue: function (field, propName) {
        // 元素节点, 直接返回
        if (field.nodeType === 1) {
            return field.value;
        }
        // 上面排除 select元素, 有 length属性为 NodeList;
        if ('length' in field) {
            var len = field.length;
            var value = [];
            var isRadio = field[0].type === 'radio';

            // IE8+ 版本浏览器的 radio NOdeList可直接通过 value属性访问选中的值
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
    },

    setValue: function (field, value) {
        // 元素节点, 直接返回
        if (field.nodeType === 1) {
            field.value = value;
        }
        else if ('length' in field) {
            var len = field.length;
            var type = field[0].type;

            // 为''或[]时, reset
            if (value.length === 0) {
                return fieldTool.reset(field);
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
        }
        return value;
    },

    reset: function (field) {
        if (field.nodeType === 1) {
            field.value = '';
            return ;
        }

        for (var i = 0, len = field.length; i < len; i++) {
            field[i].checked = false;
        }
    },

    // 创建一个input元素, 判断是否含该属性, 用于兼容性判断
    support: function (propName) {
        return propName in document.createElement('input');
    },

    // 属性获取
    getProp: function (field, propName) {
        // 待获取的属性是 value的特殊处理
        if (propName === 'value') {
            return fieldTool.getValue(field, propName);
        }
        return propName in field ? field[propName] : field[0][propName];
    },

    // 获取通过
    getField: function (field) {
        // 是 DOM元素, 直接返回
        if (field.nodeType === 1) {
            return field;
        }
        // nodeList, 为 checkbox或 radio
        if ('length' in field) {
            var len = field.length;
            // 返回第一个被选中的元素或第一个元素
            while (len--) {
                if (field[len].checked) {
                    return field[len];
                }
            }
            return field[0];
        }
        return null;
    }
};

module.exports = fieldTool;