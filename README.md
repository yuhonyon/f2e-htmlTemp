# 模板引擎 [![Build Status](https://travis-ci.org/yuhonyon/f2e-htmlTemp.svg?branch=master)](https://travis-ci.org/yuhonyon/f2e-htmlTemp) [![npm](https://img.shields.io/npm/v/@fastweb/html-temp.svg)](https://www.npmjs.com/package/@fastweb/html-temp)


## 安装
```bash
yarn add @fastweb/http-temp
```

## 用法
```html
<html>
<div id="app"></div>
<script id="app-temp" type="text/temp">
  <div><%=data.title%></div>
  <ul>
  <%for(var i=0;i<data.list.length;i++){%>
    <li><%=data.list[i]%></li>
  <%}%>
  </ul>
</script>
</html>
```
```js
import htmlTemp from "@fastweb/http-temp";
let mydata={
  title:'题目',
  list:[1,2,3,4,5]
}
htmlTemp.renderDom('app','app-temp',mydata)
```

## 方法

### renderDom  渲染模板插入dom
`htmlTemp.renderDom(dom,tmpl,data,def,id)`
参数:
* dom(string|dom)-被插入渲染结果的dom
* tmpl(string)-模板
* data(object)-数据
* def(object)(可选)-模板片段
* id(number|string)(可选)-唯一id(提高渲染速度)

### render 渲染模板返回html
`htmlTemp.renderDom(tmpl,data,def,id)`
参数同renderDom

### compile 返回模板函数
htmlTemp.compile(tmpl,def,id)
参数同renderDom

```
htmlTemp.renderDom(dom,tmpl,data)
//等同
dom.innerHTML=htmlTemp.render(tmpl,data)
//等同
dom.innerHTML=htmlTemp.compile(tmpl)(data)
```

## 过滤器 |
```js
  htmlTemp.filters={
    sex:function(str){
      if(str==0){
        return "男人"
      }else if(str==1){
        return "女人"
      }
      return "妖人"
    },
    describe:function(str){
      if(/男/.test(str)){
        return '帅气的'+str
      }else if(/女/.test(str)){
        return '漂亮的'+str
      }
      return str
    },
    age:function(str){
      if(srt>18){
        return "成年"
      }
      return "未成年"
    }
  }
  let tmpl=`<div><%=data.name%>是一个<%=data.age|age%><%=data.sex|sex|describe%></div>`;
  let data={
    name:'老王',
    age:'40',
    sex:0
  }
  htmlTemp.render(tmpl,data);
  //<div>老王是一个成年帅气的男人</div>

```

## 模板语法
同ejs,常用`<%%>`,`<%=%>`
