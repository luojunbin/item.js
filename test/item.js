/**
 * @file 表单验证辅助插件
 * @author luojunbin@baidu.com
 */

// 事件兼容模块
var E = {
    getEvent: function (event) {
        return event || window.event;
    },

    getTarget: function (e) {
        var event = E.getEvent(e);
        return event.target || event.srcElement;
    },

    on: function (ele, eventType, handler, bubble) {
        if (ele.addEventListener) {
            ele.addEventListener(eventType, handler, !!bubble);
        } else if (ele.attachEvent) {
            // IE 8- change兼容性问题
            if (eventType === 'change') {
                var tem = null;
                var cur = null;
                var temVal = '';
                var egField = /^INPUT|TEXTAREA|SELECT$/i;
                ele.attachEvent('onbeforeactivate', function (e) {
                    var target = cur = E.getTarget(e);
                    var tagName = target.tagName.toUpperCase();

                    if (tem && tem.value !== temVal) {
                        e = E.getEvent(e);
                        e.target = tem;
                        handler(e);
                        temVal = tem.value;
                    }

                    if (egField.test(tagName)) {
                        // 懒绑定
                        if ((target.type === 'checkbox' || target.type === 'radio') && !target.__lhasBind) {
                            target.__lhasBind = true;
                            E.on(target, 'propertychange', function (e) {
                                if (target.__lhasBind && e.propertyName === 'checked' && target === cur) {
                                    handler.call(target, e);
                                }
                            });
                        } else {
                            tem = target;
                            temVal = tem.value;
                        }
                    }
                });
                return;
            }

            ele.attachEvent('on' + eventType, handler);
        }
    }
};



var l = console.log.bind(console, 'lwss');

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

/**
 * 结果处理方法
 * @param {boolean} inverse 默认为 false,
 *                  false: __sum将用 &&方式计算;
 *                  true: __sum将用 ||方式计算;
 */
function Result(inverse, isStrict) {
    this.__sum = !inverse;
    this.inverse = !!inverse;
    this.isStrict = !!isStrict;
    this.state = {};
}

Result.prototype = {

    isSame: function (item1, item2) {
        // 值比较
        if (item1 === item2) {
            return true;
        }
        // 类型比较
        var type1 = typeof item1;
        var type2 = typeof item2;

        if (type1 !== type2) {
            return false;
        }
        // 同为对象比较 JSON
        if (type1 === 'object') {
            return JSON.stringify(item1) === JSON.stringify(item2);
        }
        // 这里未必不同, 深度遍历开销太大, 我就当你不同了,
        // 原因:
        // 只有customMismatch会走到这一步,
        // 而customMismatch必然是由方法生成,
        // 是只要是由方法生成的对象, 里面的的key必然有顺序,
        // key顺序相同则JSON相同, JSON不同就当你不同了
        return false;
    },
    // 严格转换, 除 false外, 全都是true
    toBool: function (item) {
        if (item === false) {
            return false;
        }
        return true;
    },
    // 用于更新 __sum
    add: function (item) {
        if (item === this.inverse || this.__sum !== this.inverse) {
            return this.setSum(item);
        }

        var iv = this.inverse;
        var sum = !iv;
        for (var key in this.state) {
            if (sum !== iv) {
                sum = this.toBool(this.state[key]);
            }
            // 模拟短路
            else {
                break;
            }
        }

        return this.setSum(sum);
    },
    // 更新__sum, 返回hasStrictChange
    setSum: function (item) {
        if (this.__sum !== item) {
            this.__sum = item;
            return true;
        }
        return false;
    },
    // 更新__sum, 返回hasStrictChange
    getSum: function () {
        return this.__sum;
    },
    // this.state setter, 返回hasChange
    set: function (key, value) {
        if (!this.isSame(this.state[key], value)) {
            this.state[key] = value;
            return true;
        }
        return false;
    },
    // 对外更新 __sum的唯一方法
    update: function (key, value) {
        var hasChange = this.set(key, value);
        var hasStrictChange = this.add(this.toBool(value));
        return this.isStrict ? hasStrictChange : hasChange;
    },
    // 强行通过验证
    forcePass: function () {
        var state = this.state;
        var value = !this.inverse;
        for (var key in state) {
            state.hasOwnProperty(key) && (state[key] = value);
        }
       return this.__sum = value;
    }
};

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

// 防止keydow 和change 冲突
function noConflict(target) {
    if (target === noConflict.target && target.value === noConflict.value && target.type !== 'checkbox') {
        return false;
    }
    noConflict.target = target;
    noConflict.value = target.value;
    return true;
}

// cahce, 从EForm实例中移出, 解除循环绑定, 先这样
var cache = (function () {
    var _cache = {};
    return function (nameSpace, key, value) {
        var ns = _cache[nameSpace] || (_cache[nameSpace] = {});
        switch (arguments.length) {
            case 1:
                return ns;

            case 2:
                return ns[key];

            case 3:
                return ns[key] || (ns[key] = value);
        }
    }
})();


/**
 * 对外所有的操作将通过其实例
 *
 * @param {string} formId form元素id
 */
function EForm(formId) {
    var form = document.getElementById(formId);

    this.id = formId;

    // 保存表单节点
    this.form = form;

    // 表单数据
    this._data = {};

    // success callback and fail callback
    this.callbacks = {};

    this.result = new Result(true, true);
}


// 版本
EForm.version = '2.6';

EForm.prototype = {
    // 新建表单元素实例并缓存
    item: function (fieldName) {
        return cache(this.id, fieldName, new Field(fieldName, this));
    },

    add: function (fieldName) {
        return cache(this.id, fieldName, new Field(fieldName, this), true);
    },

    // 一般能获得相应的表单元素, type为radio或checkbox时获得nodelist
    ele: function (fieldName) {
        return this.form.elements[fieldName];
    },

    // 表单数据操作, 三种模式
    data: function (fieldName, value) {
        switch (arguments.length) {
            // 返回整个 _data对象
            case 0:
                return this._data;
            // getter
            case 1:
                return this._data[fieldName];
            // setter
            case 2:
                this._data[fieldName] = value;
                return this;
        }
    },

    isSucceed: function () {
        return this.result.getSum() !== this.result.inverse;
    },
    // 不传参, return array
    // 表单验证, 两种模式
    check: function (field) {
        var type = typeof field;
        // 传一个DOM, 则验证该DOM
        if (type === 'object') {
            return this.item(field.name).check(field);
        }
        // 不传参, 验证所有表单
        if (arguments.length === 0) {
            var state = this.result.state;
            var failKeys = [];
            for (var key in state) {
                if (state.hasOwnProperty(key) && state[key]) {
                    this.item(key).fail();
                    failKeys.push(key);
                }
            }
            return failKeys;
        }
    },
    // 事件绑定
    bindEvt: function (eventName) {
        var timeout;
        var hasTrigger = false;
        var form = this;

        if (eventName === 'change') {
            var fieldRe = /INPUT|TEXTAREA|SELECT/i;
            E.on(this.form, 'change', function (e) {
                var target = E.getTarget(e);
                fieldRe.test(target.tagName) && noConflict(target) && form.check(target);
            });

        } else if (eventName === 'keydown') {
            var fieldRe = /INPUT|TEXTAREA/i;
            var typeRe = /radio|checkbox/i;
            E.on(this.form, 'keydown', function (e) {
                var target = E.getTarget(e);
                if (fieldRe.test(target.tagName) && !typeRe.test(target.type)) {
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        noConflict(target) && form.check(target);
                    }, 400);
                }
            });
        }
    },

    init: function () {
        var name;
        var oldName = '';
        var eles = this.form.elements;
        var field;
        var len = eles.length;
        // 逐个表单元素初始化
        while (len--) {
            field = eles[len];
            name = field.name;
            if (name && name !== oldName) {
                this.item(name).init();
                oldName = name;
            }
        }

        // 绑定事件
        var evts = arguments.length ? arguments : ['keydown', 'change'];
        len = evts.length;
        while (len--) {
            this.bindEvt(evts[len]);
        }
    },

    success: function (fn) {
        this.callbacks.success = fn;
        return this;
    },

    fail: function (fn) {
        this.callbacks.fail = fn;
        return this;
    },

    handle: function (name, isFailed) {
        if (!this.result.update(name, isFailed)) {
            return;
        }
        if (this.result.getSum() === false) {
            this.callbacks.success && this.callbacks.success();
            // 不给强制成功
            // this.result.forcePass();
        } else {
            this.callbacks.fail && this.callbacks.fail();
        }
    }
};

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
        !args.length && args[0] = null;

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
        !args.length && args[0] = null;

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

if ( typeof define === "function" && define.amd && define.amd.itemJs ) {
    define( "itemJs", [], function () { return EForm; } );
}


