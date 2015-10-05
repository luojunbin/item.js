# item.js 文档


## 目录
[TOC]

## 介绍
item.js 是一个表单验证辅助插件, 兼容IE8及以上浏览器, 其验证方式有三种: require属性, pattern属性和validate方法; 
其中require和pattern来自HTML5的validityState, 详情见[validityState文档](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState), 对于不支持validityState的浏览器做了兼容处理;

* required
	* HTML属性, boolean, 表示必填, 对应validityState里的valueMissing属性; 
	* 在填了require属性但值为空时 validity.vlaueMissing返回true, 否则返回true;
	* 除checkbox外都支持required属性, select在使用这个属性的时候最好默认option(即第一个option)的value设为空字符串, 否则不存在空的选项, 设置required就没什么意义了;
	* 原来浏览器对[type=hidden]的字段也不支持该属性, 但我对其做了特殊处理, 在value不为空时能正确返回valueMissing = false, 这点可能会坑到了解这个属性的人, 注意;
* pattern
	* HTML属性, string, 其内容表示用于匹配的正则, 对应validity里的patternMismatch, 在一般的输入框中都支持;
	* 通过匹配时patternMismatch返回false, 否则返回true, 但如果不填内容, patternMismatch会返回true, 所以如果要验证至少一位数字, 在pattern属性里填\d+是没用的, 应该再加上个require属性;
	* 浏览器自动会在你填的正则的基础上首尾加上\^和\$, 所以在填的时候不必重复,
* validate方法
	* 对应自定义的customMismatch属性, 如pattern一样, 值为空时返回false;
	* 在API介绍中会详细描述;


## 核心方法
### EForm工厂方法:


* item
	* 参数: (String name), 参数name表示表单字段的name属性, 因为对各个字段的操作几乎都要经过item方法, 所以取名item.js; item操作会在第一次生成一个Field(下面会有介绍)实例并缓存, 之后会去缓存中取;
* check
	* 参数: (), 验证所有的表单字段;
* data
	* 方法本身是去Eform实例中_data属性的操作, 可通过`var ef = new EForm('formId');ef._data;直接访问`, 每个字段对应的值是在执行验证操作时顺便存起来的, 所以不会有DOM操作就能拿到值, 除checkbox的值是一个数组外, 其余类型的表单的值是一个字符串; 
	* 参数: (), 返回所有字段的以name和value组成的键值对, 如`ef.data();// 将返回{userName: 'L', password: '123123', repeatPwd: '123123'}`;
	* 参数: (String name), 就是个getter, 对上面的例子, `ef.data('userName'); // 将返回'L'`
	* 参数: (String name, String value), 就是个setter, 能修改data中相应键的值; 如`ef.data('userName', 'N');`, 需要注意的是, 这个setter只是改变EForm实例中_data的一个属性的值, 并不会影响DOM中的value, 所以只适用于修正将要提交的数据或是填写不需要用户输入但需要的提交的数据, 要修改DOM中的value可以用下面介绍的val方法;
* success
	* 参数: (Funcion fn), 参数表示回调, 仅在整个表单状态由不通过验证变为通过时会触发该回调;
* fail
	* 参数: (Funtion fn), 参数表示回调, 仅在整个表单状态由通过验证变为不通过时会触发该回调;
* ele
	* 参数: (String name), 参数表示字段的name, 一般能获得相应的表单元素, type为radio或checkbox时获得nodelist
* isSucceed
	* 参数: (), 返回整个表单是否通过验证, `true`表示通过, `false`表示不通过;
* init
	* 参数: ([String eventType, [String eventType]]), 参数表示将要绑定的事件类型, 传入`'change'`表示只通过触发`change`事件来执行验证, 传入`'keydown'`表示只通过触发`keydown`事件来执行验证, 不传参表示将同时使用两个事件(有解决冲突问题), 不想使用我绑定的事件可以传个`'I do not want to bind any event, hahaha!'`之类的字符串进去;

### Field工厂方法

介绍API之前必须知道一个核心对象`state`, 在Field实例中为`this.validityState.state`:

```js
state = {
	valueMissing: 'Boolean, 取自validityState, 在HTML中设置了required属性才会有这个值, false表示值不为空, true表示值为空',
	patternMismatch: 'Boolean, 取自validityState, 在HTML中设置了pattern属性才会有这个值, false表示正则匹配通过, true表示不通过',
	customMismatch: 'Everytype, 下面将会介绍validate方法, 该值为validate方法所传入的回调执行后的返回值, 仅在false时表示验证通过, 其他值均表示验证失败'

}
```

* msg
	* 参数: (Everytype msg), 参数可以是任何类型的任何值, 将会存到Field实例中的_msg属性中, 并作为参数传入success和fail回调中, 下面会详细介绍;
* check
	* 参数: (), 验证当前表单字段, EForm实例check方法也是调用了各个Field实例的check方法;
* success
	* 添加验证通过的回调方法, 或调用已添加的回调;
	* 参数: (Funtion fn, [Boolean isRepeat:false]), 事件添加模式, 与EForm的方法类似, fn为该字段验证通过的回调, 不同的是:
	  1. fn接收一个参数msg(即上面所说msg方法传入的参数), fn的this指向正在验证的DOM元素;
	  2. 且多了`isRepeat`参数, 在`isRepeat`默认为`false`的情况下, 只有state发生变化才会触发, 设置该参数为`true`时, 在两次输入间state没有变化依然会触发该回调;
	* 参数: ([Everytype msg:this._msg]), 事件触发模式, 如果你的success回调依赖传参, 则你可以通过传入不同的参数让回调以不同的方式执行, 否则可以不传参, 其将会启用默认参数this._msg作为参数; 需要注意的是:
	  1. 这是EForm中的success方法所不具备的功能;
	  2. 执行完success的调用后, 会将state里的所有状态都置为已通过(即各个属性都置为false);
* fail
	* 添加验证失败的回调方法, 或调用已添加的回调;
	* 参数: (Funtion fn, [Boolean isRepeat:false]), 事件添加模式, 与EForm的方法类似, fn为该字段验证失败的回调, 不同的是:
	 1. fn接收一个state参数, 和一个参数msg(即上面所说msg方法传入的参数), fn的this指向正在验证的DOM元素;
	 2. 且多了`isRepeat`参数, 在`isRepeat`默认为`false`的情况下, 只有state发生变化才会触发, 设置该参数为`true`时, 在两次输入间state没有变化依然会触发该回调;
	* 参数: ([Object state:this.validityState.state, [Everytype msg:this._msg]]), fail回调是必定依赖state的, msg未必依赖; 传入这两个参数只是取代默认参数罢了; 需要注意的是:
	  1. 这是EForm中的fail方法所不具备的功能;
	  2. 执行完fail的调用后, 并不会对state有任何影响;
* validate
	* 参数: (Function fn), 参数表示回调, fn接收一个参数value, value为当前正在验证的字段的值, 除checkbox是个值组成的数组外, 其余类型的字段均返回字符串, fn的this同样指向正在验证的DOM元素;
* val
	* 参数: (String|Array value), jQuery有个同名的方法, 之所以还需要这个方法, 是因为直接调用其他库的方法没法触发我的一系列验证操作; 此外这个方法及整个插件都是用name来映射value, 不像jQuery是直接取一个DOM的value, 所以这个val方法不仅可以给input, select直接执行填值或选择操作, 还可以直接选择radio和checkbox(传一个数组为参), 个人认为好用多了;
	
### 结语
demo可能会比文档更好理解, 文档中有不明白的地方请联系作者邮箱<lqwcwsse@gmail.com>;
	

