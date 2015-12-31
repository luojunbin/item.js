var Result = require('./result.js');
var E = require('./event.js');
var Field = require('./field.js');
var fieldTool = require('./fieldtool.js')


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
                return (ns[key] = value);
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
        return cache(this.id, fieldName) || cache(this.id, fieldName, new Field(fieldName, this));
    },

    virtual: function (fieldName) {
        return cache(this.id, fieldName) || cache(this.id, fieldName, new Field(fieldName, this, true));
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

    state: function (fieldName, value) {
        switch (arguments.length) {
            // 返回整个 _data对象
            case 0:
                return this.result.state;
            // getter
            case 1:
                return this.result.get(fieldNam);
            // setter
            case 2:
                this.result.set(fieldName, value);
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
            var state = this.state();
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

module.exports = EForm;
