var Result = require('./result.js');
var fieldTool = require('./fieldtool.js');

// 本地 validityState属性的获取, 兼容方法
var mainVali = (function () {
    var validity;

    var tool = {
        customMismatch: function (field, value, callback) {
            return value === '' ? false : callback.call(field, value);
        }
    };

    // H5 原生获取属性, validityState相关内容见
    // https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
    if (fieldTool.support('validity')) {
        tool.valueMissing = function (field, value) {
            // 修正 type为 hidden情况下 原生 valueMissing不起作用的问题
            return field.type === 'hidden' ? !value : field.validity.valueMissing;
        };

        tool.patternMismatch = function (field, value) {
            return field.validity.patternMismatch;
        };
    }
    // IE8-
    else {
        tool.valueMissing = function (field, value) {
            return !value;
        };

        tool.patternMismatch = function (field, value) {
            var pattern = field.getAttribute('pattern');
            if (typeof pattern === 'string') {
                // 加上首尾
                var reg = new RegExp('^(?:' + pattern + ')$');
                // field.value为空时, 为true
                return value === '' ? false : !reg.test(value);
            }
        };
    }

    return function (field, value, result, callback) {

        var hasChange = false;
        var state = result.state;

        for (var key in state) {
            if (state.hasOwnProperty(key) && tool[key]) {
                hasChange = result.update(key, tool[key](field, value, callback)) || hasChange;
            }
        }

        return hasChange;
    };
})();


function Field(fieldName, parent, isVirtual) {
    this.parent = parent;
    this.name = fieldName;
    this._field = parent.form.elements[fieldName];
    if (!(isVirtual || this._field)) {
        throw Error('the field named ' + fieldName + ' does not exist')
    }
    this.validityState = new Result(true);
    this._msg = {};
    this.callbacks = {};
}

Field.prototype = {

    getField: function () {
        return this._field ? fieldTool.getField(this._field) : null;
    },

    getProp: function (propName) {
        if (propName === 'name') {
            return this.name;
        }
        return this._field && fieldTool.getProp(this._field, propName);
    },

    msg: function (obj) {
        this._msg = obj;
        return this;
    },

    val: function (value) {
        this._field && fieldTool.setValue(this._field, value);
        this.check(value);
        return this;
    },

    initState: function (field) {
        if (field) {
            // get required
            if (field.hasAttribute('required')) {
                this.validityState.set('valueMissing', '');
            }

            // get pattern
            var pattern = field.getAttribute('pattern');
            if (typeof pattern === 'string') {
                this.validityState.set('patternMismatch', '');
            }
        }

        // get customValidate
        if (this.callbacks.custom) {
            this.validityState.set('customMismatch', '');
        }
    },

    init: function (value) {
        this.hasInit = false;
        // 从DOM中获取配置
        this.initState(this.getField());

        this.check(value);
        this.hasInit = true;
        return this.validity;
    },

    check: function (element, value) {
        var ele = typeof element === 'object' && element.nodeType === 1 && element
                || typeof value === 'object' && value.nodeType === 1 && value
                || this.getField();

        var val = typeof value === 'string' && value
                || typeof element === 'string' && element
                || this.getProp('value')
                || '';

        var result = this.validityState;

        this.parent.data(this.name, val);

        var hasChange = mainVali(ele, val, result, this.callbacks.custom);

        if (this.hasInit) {
            this.handle(ele, hasChange);
        } else {
            this.parent.result.update(this.name, result.getSum());
        }
        return result;
    },

    validate: function (fn) {
        this.callbacks.custom = fn;
        return this;
    },

    success: function () {
        var args = Array.prototype.slice.call(arguments, 0);

        // args: ()
        !args.length && (args[0] = null);

        var mode = typeof args[0];

        // args: (ele, msg)
        if (this.callbacks.success && mode === 'object') {
            var ele = args[0] && args[0].nodeType === 1 ? args.shift() : this.getField();
            args[0] = args[0] || this._msg;

            this.callbacks.success.apply(ele, args);

            if (args[0] !== true) {
                this.validityState.forcePass();
            }
            
            this.parent.handle(this.getProp('name'), false);
        }
        // args: (fn, isRepeat)
        else if (mode === 'function') {
            args[0].isRepeat = !!args[1];
            this.callbacks.success = args[0];
        }

        return this;
    },

    fail: function () {
        var args = Array.prototype.slice.call(arguments, 0);

        // args: ()
        !args.length && (args[0] = null);

        var mode = typeof arguments[0];

        // args: (ele, state, msg)
        if (this.callbacks.fail && mode === 'object') {

            var ele = args[0] && args[0].nodeType === 1 ? args.shift() : this.getField();
            args[0] = args[0] || this.validityState.state;
            args[1] = args[1] || this._msg;

            this.callbacks.fail.apply(ele, args);

            this.parent.handle(this.getProp('name'), true);
        }
        // args: (fn, isRepeat)
        else if (mode === 'function') {
            args[0].isRepeat = !!args[1];
            this.callbacks.fail = args[0];
        }

        return this;
    },

    handle: function (ele, hasChange) {
        if (this.validityState.getSum() === true) {
            if (this.callbacks.fail && (this.callbacks.fail.isRepeat || hasChange)) {
                this.fail(ele);
            }
        } else {
            if (this.callbacks.success && (this.callbacks.success.isRepeat || hasChange)) {
                this.success(ele);
            }
        }
    }
};

module.exports = Field;