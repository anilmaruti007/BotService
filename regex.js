var someValue = function (data) {
    var reg1 = /\b(J?jan(uary)?|F?feb(ruary)?|M?mar(ch)?|A?apr(il)?|M?may|J?jun(e)?|J?jul(y)?|A?aug(ust)?|S?sep(tember)?|O?oct(ober)?|N?nov(ember)?|D?dec(ember)?)\s+(\D?\s?\d{4})?\b/g
    var reg2 = /\b(\d{1,4}(\/|\-)\d{2,4})\b/g; debugger;
    var res1 = data.match(reg1);
    var res2 = data.match(reg2); debugger;
    if (res1 !== null) {
        return res1.map((ele) => { var a = ele.split(" "); if (a[2] == "") { return ele + new Date().getFullYear() } else { return ele } });
    } else if (res2 !== null) {
        return res2.map((ele) => { var a = ele.split(" "); if (a[2] == "") { return ele + new Date().getFullYear() } else { return ele } });
    } 
    else {
        return "date not found";
    }
}

module.exports = someValue;