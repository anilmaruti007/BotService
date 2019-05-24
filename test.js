var a1 = `select count(*) from nlptosql.file1 where "" = ""`,
a2 = `select count(*) from nlptosql.file1 where "" = "" and "" = "" and "" = ""`;

var o1 = {"A":1},
o2 = {"A":1,"b":2,"C":3}
require('./util')(a2,o2,(data)=>{
console.log(data)
});