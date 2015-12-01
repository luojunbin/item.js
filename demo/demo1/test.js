var l = console.log.bind(console, 'l');


// 找到输入框右边的div.hint, 把msg填进去
function writeHint(ele, msg) {
    $(ele).parents('dd').find('.hint').html(msg);
}

// 验证成功回调
function success(msg) {
    writeHint(this, msg.success);
}

// 验证失败回调
function fail(state, msg) {
    // 从state中获取错误类型, 从msg中获取类型相对的信息并填入div.hint
    for (var key in state) {
        if (state.hasOwnProperty(key) && state[key] !== false) {
            writeHint(this, msg[key]);
            break;
        }
    }
}

// 传入表单ID, 创建EForm实例
var rg = new EForm('register');

// 这些字段不需要validate方法就能完成验证, 给绑定相同的成功和失败回调
var fields = 'username gender phoneNum city'.split(/\s+/);

var commonMsg = {
    valueMissing: '该项不能为空',
    patternMismatch: '输入错误',
    success: '<i class="success"></i>'
};

$.map(fields, function (item, index) {
    rg.item(item)
        .msg(commonMsg)
        .success(success)
        .fail(fail);
});

// 密码
rg.item('password')
    .msg({
        valueMissing: '该项不能为空',
        patternMismatch: '输入错误',
        customMismatch: '两次密码不一致',
        success: '<i class="success"></i>'
    })
    // 如果'重复密码'没有填值就返回false表示验证通过, 有填值就验证是否相同, 相同返回false表示验证通过
    .validate(function (value) {
        if (rg.data('repeatPwd')) {
            return value !== rg.data('repeatPwd');
        }
        return false;
    })
    .success(function (msg) {
        // 先自己成功, this为当前正在验证的DOM
        success.call(this, msg);
        // 验证通过有两种可能, 一是'重复密码'没填值;
        // 二是'重复密码'填了值, 所以也触发'重复密码'字段的成功回调
        if (rg.data('repeatPwd')) {
            rg.item('repeatPwd').success();
        }
        // isRepeat设为true, 因为规则的关系, 自己理解;
    }, true)
    .fail(fail)

rg.item('repeatPwd')
    .msg({
        valueMissing: '该项不能为空',
        patternMismatch: '输入错误',
        customMismatch: '两次密码不一致',
        success: '<i class="success"></i>'
    })
    .validate(function (value) {
        // 值与上面填的密码是否相同
        return value !== rg.data('password');
    })
    .success(success)
    .fail(fail);

// 验证码
rg.item('code')
    .msg({
        valueMissing: '该项不能为空',
        patternMismatch: '输入错误',
        customMismatch: {
            loading: '<i class="loading"></i>',
            different: '验证码错误, 正确答案是123456',
        },
        success: '<i class="success"></i>'
    })
    .validate(function (value) {
        return 'loading';
    })
    .success(success)
    .fail(function (state, msg) {
        // 值为空, 或正则匹配不通过时, 直接失败
        if (state.valueMissing || state.patternMismatch) {
            return fail.call(this, state, msg);
        }
        // 值非空且通过正则时, 填入msg中customMismatch里的内容
        writeHint(this, msg.customMismatch[state.customMismatch]);

        // 如果state中customMismatch为'loading', 即是从validate回调中返回的值
        if (state.customMismatch === 'loading') {
            msg.ajax && msg.ajax.abort();
            msg.ajax = $.ajax({
                url: 'http://jsfiddle.net/echo/jsonp/',
                type: "GET",
                dataType: 'jsonp',
                data: {
                    result: rg.data('code') === '123456'
                }
            }).done(function (data) {
                if (data.result === 'true') {
                    rg.item('code').success();
                } else {
                    // 这里的功能相当于goto line103
                    rg.item('code').fail({
                        customMismatch: 'different'
                    });
                }
            });
        }
        // 因为state相同, 但还是要发请求, 所以isRepeat要设为true
    }, true);

// 
rg.item('hobby')
    .msg({
        customMismatch: {
            required: '必选一个',
            bad: '并不能吸毒'
        },
        success: '<i class="success"></i>'
    })
    .validate(function (value) {
        // value是一个数组
        if (value.length === 0) {
            return 'required';
        }
        if ($.inArray('3', value) > -1) {
            return 'bad';
        }
        return false;
    })
    .success(success)
    .fail(function (state, msg) {
        writeHint(this, msg.customMismatch[state.customMismatch]);
    });

var i = 0;

rg.virtual('test')
    .msg({
        aaa: 'aaaaaa'
    })
    .validate(function (value) {
        l(value);
        return value === '1' ? false : value;
    })
    .success(function (msg) {
        l(msg)
    })
    .fail(function (state, msg) {
        l(state, msg)
    })
    .init('0');


// 注册成功按钮在全部字段成功后变为红色
rg.success(function () {
        $('#submit').removeClass('disabled');
    })
    .fail(function () {
        $('#submit').addClass('disabled');
    });

rg.init();



$('#register').on('click', '.submit', function () {
    // 如果通过验证
    if (!rg.isSucceed()) {
        firstField = rg.check();
        return;
    }

    alert('你提交的数据为' + JSON.stringify(rg.data()))
});


var l = console.log.bind(console, 'lwss');



















