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

Result.isSame = function (item1, item2) {
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
};

// 严格转换, 除 false外, 全都是true
Result.toBool = function (item) {
    if (item === false) {
        return false;
    }
    return true;
};

Result.prototype = {


    // 返回__sum
    getSum: function () {
        return this.__sum;
    },
    // 更新__sum, 返回hasStrictChange
    setSum: function (item) {
        if (this.__sum !== item) {
            this.__sum = item;
            return true;
        }
        return false;
    },
    // 用于更新 __sum
    add: function (item) {
        if (item === this.inverse || this.__sum === this.inverse) {
            return this.setSum(this.inverse);
        }

        var iv = this.inverse;
        var sum = !iv;
        for (var key in this.state) {
            if (sum !== iv) {
                sum = Result.toBool(this.state[key]);
            }
            // 模拟短路
            else {
                break;
            }
        }

        return this.setSum(sum);
    },
    // this.state setter, 返回hasChange
    set: function (key, value) {
        if (!Result.isSame(this.state[key], value)) {
            this.state[key] = value;
            return true;
        }
        return false;
    },
    // this.state getter
    get: function (key) {
        return this.state[key];
    },
    // 对外更新 __sum的唯一方法
    update: function (key, value) {
        var hasChange = this.set(key, value);
        var hasStrictChange = this.add(Result.toBool(value));
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

// module.exports = Result;