/**
 * @fileOverview Result测试
 */

function createResult() {
    return [new Result(), new Result(true), new Result(false, true), new Result(true, true)];
}

describe('.isSame()', function () {
    it('should return true if argument1 equal to argument2, if arg1 and arg2, will compare their json, so it is not absolutely correct.', function () {

        expect(Result.isSame(1, 1)).to.be.ok;

        expect(Result.isSame(0, false)).to.not.be.ok;

        expect(Result.isSame({
            a: 1,
            b: 2
        }, {
            a: 1,
            b: 2
        })).to.be.ok;
        expect(Result.isSame({
            a: 1,
            b: 1
        }, {
            a: 1,
            b: 2
        })).to.be.not.ok;
    });
});

describe('.toBool()', function () {
    it('should return true except false', function () {

        expect(Result.toBool('')).to.be.ok;
        expect(Result.toBool(undefined)).to.be.ok;
        expect(Result.toBool(null)).to.be.ok;
        expect(Result.toBool(true)).to.be.ok;

        expect(Result.toBool(false)).to.be.not.ok;
    });
});

describe('.setSum() & .getSum()', function () {
    it('.getSum() should return the value that pass to .setSum(); .setSum() should return true if the value is different to the old valule.', function () {
        // __sum的值为result的第一个参数取反, 这里为true
        var rs = new Result();
        expect(rs.getSum()).to.be.ok;

        // __sum的值为result的第一个参数取反, 这里为false
        var rs2 = new Result(true);
        expect(rs2.getSum()).to.be.not.ok;

        // 未改变, return false
        expect(rs.setSum(true)).to.be.not.ok;
        expect(rs.getSum()).to.be.ok;

        // 改变, return true
        expect(rs.setSum(false)).to.be.ok;
        expect(rs.getSum()).to.be.not.ok;

        // 未改变, return false
        expect(rs.setSum(false)).to.be.not.ok;
        expect(rs.getSum()).to.be.not.ok;

        // 改变, return true
        expect(rs.setSum(true)).to.be.ok;
        expect(rs.getSum()).to.be.ok;

    });
});


describe('.add(), should return strict hasChange', function () {
    it('.add()', function () {
        // && result, init true
        var re1 = new Result();
        // || result, init false
        var re2 = new Result(true);

        // (resultInstance, input, addOutput, getSumOutput)
        function add(re, input, result, sum) {
            expect(re.add(input)).to.be.equal(result);
            expect(re.getSum()).to.be.equal(sum);
        }

        add(re1, true, false, true);
        add(re1, false, true, false);
        add(re1, false, false, false);
        add(re1, true, false, false);
        add(re1, true, false, false);

        add(re2, false, false, false);
        add(re2, true, true, true);
        add(re2, true, false, true);
        add(re2, false, false, true);
        add(re2, false, false, true);

    });
});

describe('.set() && .get()', function () {
    it('should return hasChange, dependence isSame', function () {
        var re = new Result();

        expect(re.set('a', '1')).to.be.ok;
        expect(re.get('a')).to.be.equal('1');

        expect(re.set('a', '1')).to.be.not.ok;

        expect(re.set('a', '2')).to.be.ok;
        expect(re.get('a')).to.be.equal('2');
    });
});

describe('.update()', function () {
    it('should return hasChange or hasStrictChange', function () {

        // not strict result
        var re1 = new Result();
        // strict result
        var re2 = new Result(false, true);

        expect(re1.update('a', false)).to.be.ok;
        expect(re1.update('b', false)).to.be.ok;
        expect(re1.update('c', false)).to.be.ok;

        expect(re2.update('a', false)).to.be.ok;
        expect(re2.update('b', false)).to.be.not.ok;
        expect(re2.update('c', false)).to.be.not.ok;

    });
});

describe('.forcePass()', function () {
    it('should reset state', function () {

        function forcePass(flag) {
            var re = new Result(flag);

            re.update('a', flag);
            re.update('b', flag);
            re.update('c', flag);

            expect(re.forcePass()).to.be.equal(!flag);
            expect(re.state).to.be.deep.equal({
                a: !flag,
                b: !flag,
                c: !flag
            });
        }

        forcePass(false);
        forcePass(true);
    });
});