import htmlTemp from './../index.js';
const expect = require('chai').expect;

let temp="<div><%=data.id%></div>";

describe('编译模板', () => {
    it('\n模板:<div><%=data.id%></div>\n数据:{id:1}\n结果:<div>1</div>', (next) => {
        expect(htmlTemp(temp,{id: 1})).to.equal("<div>1</div>");
        next();
    });
});
