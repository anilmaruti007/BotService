module.exports = (querries,Mldata,object, callback) => {
    var query = querries[Mldata];
    if(Mldata !== ("A3B" && "AI")){
        Object.keys(object).forEach((data) => {
            query = query.replace('"" = ""', data + " = " + `'${object[data]}'`);
        });
        callback(query);
    } else if(Mldata === "A3B"){
        Object.keys(object).forEach((data) => {
            if(data === 'yearmonth')
            query = query.replace(`"" between "" and ""`, `${data} between  '${object[data][0]}' and '${object[data][1]}'`);
            else
            query = query.replace('"" = ""', data + " = " + `'${object[data]}'`);
        });
        callback(query);
    } else if(Mldata === "AI") {
        Object.keys(object).forEach((data) => {
            query = query.replace(`"" in ("", "", "")`, `${data} in ('${object[data][0]}', '${object[data][1]}', '${object[data][2]}')`)
        })
        callback(query)
    } else {
        return 'Data Not found!'
    }
}