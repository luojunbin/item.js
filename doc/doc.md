# item.js 文档


## 目录


## 介绍
item.js 是一个表单验证辅助插件, 兼容IE8及以上浏览器, 其验证方式有三种: require属性, pattern属性和validate方法; 
其中require和pattern来自HTML5的validityState, 详情见[validityState文档](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState), 对于不支持validityState的浏览器做了兼容处理;

### required
1. HTML属性, boolean, 表示必填, 对应validityState里的valueMissing属性; 
2. 在填了require属性但值为空时 validity.vlaueMissing返回true, 否则返回true;
3. 除checkbox外都支持required属性, select在使用这个属性的时候最好默认option(即第一个option)的value设为空字符串, 否则不存在空的选项, 设置required就没什么意义了;
4. 原来浏览器对[type=hidden]的字段也不支持该属性, 但我对其做了特殊处理, 在value不为空时能正确返回valueMissing = false, 这点可能会坑到了解这个属性的人, 注意;

### pattern
1. HTML属性, string, 其内容表示用于匹配的正则, 对应validity里的patternMismatch, 在一般的输入框中都支持;
2. 通过匹配时patternMismatch返回false, 否则返回true, 但如果不填内容, patternMismatch会返回true, 所以如果要验证至少一位数字, 在pattern属性里填\d+是没用的, 应该再加上个require属性;
3. 浏览器自动会在你填的正则的基础上首尾加上\^和\$, 所以在填的时候不必重复,

### validate方法
1. 对应自定义的customMismatch属性, 如pattern一样, 值为空时返回false;
2. 在API介绍中会详细描述;


## EForm方法:

### init
参数: ([String eventType, [String eventType]]), 参数表示将要绑定的事件类型, 传入`'change'`表示只通过触发`change`事件来执行验证, 传入`'keydown'`表示只通过触发`keydown`事件来执行验证, 不传参表示将同时使用两个事件(有解决冲突问题), 不想使用我绑定的事件可以传个别的字符串进去;
注意: 在完成所有字段的配置时应调用一下该方法以完成整个表单的初始化;

```js
示例: 整个表单验证通过时将提交按钮设置为可点击状态
   form.init(); // 绑定change和keydown事件
   form.init('change'); // 只绑定change事件
   form.init('do not bind'); // 不绑定事件
```

### item
参数: (String name), 参数name表示表单字段的name属性, item操作会在第一次生成一个Field(下面会有介绍)实例并缓存, 之后会去缓存中取;

```js
示例
   form.item('fieldName')
        .validate()
        .success()
        .fail();
```

### check
参数: (), 验证所有的表单字段, 返回一个由验证失败的字段名组成的数组;

```js
示例
   form.check(); // ['userName', 'password']
```

### data
1. 方法本身是去Eform实例中\_data属性的操作, 不建议直接访问_data, 每个字段对应的值是在执行验证操作时顺便存起来的, 所以不会有DOM操作就能拿到值; 且未使用item方法绑定事件的字段, 其值也能通过此方法获得; 除checkbox的值是一个数组外, 其余类型的表单的值是一个字符串; 
2. 参数: (), 返回所有字段的以name和value组成的键值对, 如
3. 参数: (String name), 就是个getter;
4. 参数: (String name, String value), 就是个setter; 需要注意的是, 这个setter只是改变EForm实例中\_data的一个属性的值, 并不会影响DOM中的value, 所以只适用于修正将要提交的数据或是填写不需要用户输入但需要的提交的数据, 要修改DOM中的value可以用下面介绍的 val 方法;

```js
示例
    form.data(); // {userName: 'L', password: '123123', repeatPwd: '123123'}
    form.data('userName'); // L
    form.data('userName', 'N'); // {userName: 'N', password: '123123', repeatPwd: '123123'};
```

### success
参数: (Funcion fn), 参数表示回调, 仅在整个表单状态由不通过验证变为通过时会触发该回调;

### fail
参数: (Funtion fn), 参数表示回调, 仅在整个表单状态由通过验证变为不通过时会触发该回调;

```js
示例: 整个表单验证通过时将提交按钮设置为可点击状态
   form.success(function () {
        $('#submit').removeClass('disabled');
    })
    .fail(function () {
        $('#submit').addClass('disabled');
    });
```

### ele
参数: (String name), 参数表示字段的name, 一般能获得相应的表单元素, type为radio或checkbox时获得nodelist;

```js
示例: 整个表单验证通过时将提交按钮设置为可点击状态
   form.ele('userName'); // 
```

### isSucceed
参数: (), 返回整个表单是否通过验证, `true`表示通过, `false`表示不通过;

```js
示例: 整个表单验证通过时将提交按钮设置为可点击状态
   form.isSucceed(); // true or false
```

### add
参数: (String virtualFieldName),参数表示虚拟字段名; 这个方法用于扩展一些非原生表单的字段, 比如我们经常会用自定义的下拉框来代替原生的select和option的组合, 这时可以使用这个方法来添加一个不存在的字段; 生成的虚拟字段有以下使用限制:
        1. 由于这个字段的表单中并不存在, 所以required和pattern属性均不可用, 这时只能使用万能的validate方法来完成所有验证逻辑;
        2. 同样的原因, 只能使用val方法来给该字段赋值;
        3. EForm实例的init方法只能初始化表单中的字段, 所以在配置完后需要调用init方法;
        4. 可用的方法item, validate, success, fail, val, init

```js
示例
    form.add('virtualField');
    form.item('virtualField')
        .validate()
        .success()
        .fail()
        .init('0');
```

## Field方法

介绍API之前必须知道一个核心对象`state`, 在Field实例中为`this.validityState.state`:

```js
state = {
    valueMissing: 'Boolean, 取自validityState, 在HTML中设置了required属性才会有这个值, false表示值不为空, true表示值为空',
    patternMismatch: 'Boolean, 取自validityState, 在HTML中设置了pattern属性才会有这个值, false表示正则匹配通过, true表示不通过',
    customMismatch: 'Everytype, 下面将会介绍validate方法, 该值为validate方法所传入的回调执行后的返回值, 仅在false时表示验证通过, 其他值均表示验证失败'

}
```


### init
参数: ([String value]), 参数可选, 表示表单初始化时的值, 不传则直接从DOM中取值, 一般通过调用EForm实例中的init方法来间接调用这个方法, 所以这个方法更多地用在虚拟的表单中;
    
```js
示例
    form.item('test').init('0'); // 初始值为'0'
    form.item('test').init();    // 初始值为DOM中的元素
```


### msg
参数: (Everytype msg), 参数可以是任何类型的任何值, 将会存到Field实例中的_msg属性中, 并作为参数传入success和fail回调中, 下面会详细介绍;

```js
示例
   form.item('test')
        .msg({
            a: 1
        })
        .success(function (msg) {
            console.log(msg.a);
        })
        .fail(function (state, msg) {
            console.log(msg.a);
        });
```

### check
参数: (), 验证当前表单字段, EForm实例check方法也是调用了各个Field实例的check方法;

### success
1. 添加验证通过的回调方法, 或调用已添加的回调;
2. 参数: (Funtion fn, [Boolean isRepeat:false]), 事件添加模式, 与EForm的方法类似, fn为该字段验证通过的回调, 不同的是:
      1. fn接收一个参数msg(即上面所说msg方法传入的参数), fn的this指向正在验证的DOM元素;
      2. 且多了`isRepeat`参数, 在`isRepeat`默认为`false`的情况下, 只有state发生变化才会触发, 设置该参数为`true`时, 在两次输入间state没有变化依然会触发该回调;
3. 参数: ([Everytype msg:this.\_msg]), 事件触发模式, 如果你的success回调依赖传参, 则你可以通过传入不同的参数让回调以不同的方式执行, 否则可以不传参, 其将会启用默认参数this._msg作为参数; 需要注意的是:
      1. 这是EForm中的success方法所不具备的功能;
      2. 执行完success的调用后, 会将state里的所有状态都置为已通过(即各个属性都置为false);

### fail
1. 添加验证失败的回调方法, 或调用已添加的回调;
2. 参数: (Funtion fn, [Boolean isRepeat:false]), 事件添加模式, 与EForm的方法类似, fn为该字段验证失败的回调, 不同的是:
     1. fn接收一个state参数, 和一个参数msg(即上面所说msg方法传入的参数), fn的this指向正在验证的DOM元素;
     2. 且多了`isRepeat`参数, 在`isRepeat`默认为`false`的情况下, 只有state发生变化才会触发, 设置该参数为`true`时, 在两次输入间state没有变化依然会触发该回调;
3. 参数: ([Object state:this.validityState.state, [Everytype msg:this._msg]]), fail回调是必定依赖state的, msg未必依赖; 传入这两个参数只是取代默认参数罢了; 需要注意的是:
      1. 这是EForm中的fail方法所不具备的功能;
      2. 执行完fail的调用后, 并不会对state有任何影响;

```js
示例: 回调配置
    form.item('test')
        .msg({
            valueMissing: '不能为空',
            patternMismatch: '正则匹配不通过',
            success: '验证成功'
        })
        .success(function (msg) {
            console.log(msg.success);
            console.log(this); // this指向当前dom元素
        })
        .fail(function (state, msg) {
            if (state.valueMissing) {
                console.log(msg.valueMissing);
            } else if (state.patternMismatch) {
                console.log(msg.patternMismatch);
            }
            console.log(this); // this指向当前dom元素
        });


示例: 回调调用
    form.item('test').success(); // 以默认的msg参数触发回调, 输出'验证通过'
    form.item('test').success({success: 'pass'}); // 以新的msg参数触发回调, 输出'pass'

    form.item('test').fail(); // 以默认的state和msg参数触发回调
    form.item('test').fail({valueMissing: true}); // 以新的state和默认的msg参数触发回调, 输出'不能为空'
    form.item('test').fail({valueMissing: true}, {valueMissing: 'value required'}); // 以新的state和新的msg参数触发回调, 输出'value required'
```

### validate
参数: (Function fn), 参数表示回调, fn接收一个参数value, value为当前正在验证的字段的值, 除checkbox是个值组成的数组外, 其余类型的字段均返回字符串, fn的this同样指向正在验证的DOM元素;

```js
示例
    form.item('fieldName1')
        .validate(function (value) {
            console.log(this);  // 正在验证的当前字段的DOM元素
            console.log(value); // 返回当前字段的值, 如果是checkbox将返回一个数组;
            // 返回false以外的值都表示验证失败, 所返回的值将存在state中的customMismatch中;
            return value === 1 ? false : 'something';
        })
        .fail(function (state, msg) {
            console.log(state.customMismatch); // 'something'
        });
```

### val
参数: (String|Array value), jQuery有个同名的方法, 之所以还需要这个方法, 是因为直接调用其他库的方法没法触发我的一系列验证操作; 此外这个方法及整个插件都是用name来映射value, 不像jQuery是直接取一个DOM的value, 所以这个val方法不仅可以给input, select直接执行填值或选择操作, 还可以直接选择radio和checkbox(传一个数组为参), 个人认为好用多了;
    
```js
示例
    form.item('fieldName1').val('text');        //普通输入框
    form.item('fieldName2').val('optionValue'); //select下拉框
    form.item('fieldName3').val('1');           //type=radio
    form.item('fieldName4').val([1,2,3]);       //type=checkbox
```


    
## 结语
demo可能会比文档更好理解, 文档中有不明白的地方请联系作者邮箱<lqwcwsse@gmail.com>;

