
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

// module.exports = E;
