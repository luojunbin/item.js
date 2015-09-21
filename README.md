# item.js 文档
## 1. 核心变量state
```javascript
state = {
    valueMissing: 'boolean, 在HTML字段中设置了required时, 该字段生效, false表示验证通过',
    patternMismatch: 'boolean, 在HTML字段中设置了pattern时, 该字段生效, false表示验证通过, value为空时返回true',
    customMismatch: 'anyType, validate方法传入回调的返回值, false表示验证通过, value为空时返回true'
}
```

## 2. 主要接口
- EForm - (表单ID) - 表单构造函数

- item - (表单字段名) - 字段构造函数

- msg - () - 仅用作保存变量, 并传入fail与success回调中

- validate - (fn: 自定义验证函数) - this为当前表单字段, fn将传入当前字段的value, type=checkbox时value表现为[1], [1,2], []; 当返回false时表示自定义验证成功, 否则表示失败, 且返回的值将直接放入state的customMismatch中;

- fail - (fn, isRepeat=false), (state, [msg]), ([state]) - 第一种定义回调, isRepeat为true时, state没有变化时也会触发回调, 第二三种以自定义参数调用回调,  视传参决定是否启用默认值this.validityState, this._msg;

- success - (fn, isRepeat), ([msg]) - 第一种定义回调, isRepeat为true时, state没有变化时也会触发回调,  第二种以自定义参数调用回调,  视传参决定是否启用默认值this._msg;

- init - () - 初始化EForm实例, 应在绑定完各种逻辑后执行;

- item.data - (), (name), (name, value) - 第一种获得整个表单的data, 第二种获得相应字段名的value, 第三种设置相应字段名的value, 并不会反映在DOM中, 如要修改值,验证并插入DOM中, 应用item.val方法

-item.val - (name, value) - 设置字段值, 并验证; // checkbox有BUG
