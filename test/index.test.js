import htmlTemp from './../index.js';
const expect = require('chai').expect;

let temp="<div><%=data.id%></div>";
let temp2="<div><%=data.sex|sex|describe%></div>";
htmlTemp.filters={
  sex: function(src){
    if(src===1){
      return "男";
    }else{
      return "女";
    }
  },
  describe: function(src){
    if(src==="男"){
      return '好帅的'+src+'神';
    }else{
      return '好漂亮的'+src+'神';
    }
  }
};

describe('编译模板', () => {
    it('\n模板:<div><%=data.id%></div>\n数据:{id:1}\n结果:<div>1</div>', (next) => {
        expect(htmlTemp.render(temp,{id: 1})).to.equal("<div>1</div>");
        next();
    });
});


describe('模板过滤器', () => {
    it('\n模板:<div><%=data.sex|sex|describe%></div>\n数据:{sex:1}\n结果:<div>好帅的男神</div>', (next) => {
        expect(htmlTemp.render(temp2,{sex: 1}),11).to.equal("<div>好帅的男神</div>");
        next();
    });
    it('\n模板:<div><%=data.sex|sex|describe%></div>\n数据:{sex:0}\n结果:<div>好漂亮的女神</div>', (next) => {
        expect(htmlTemp.render(temp2,{sex: 0}),11).to.equal("<div>好漂亮的女神</div>");
        next();
    });
});
