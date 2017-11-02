let htmlTemp = {
    templateSettings: {
      evaluate: /\<\%([\s\S]+?(\}?)+)\%\>/g,
      interpolate: /\<\%=([\s\S]+?)\%\>/g,
      encode: /\<\%!([\s\S]+?)\%\>/g,
      use: /\<\%#([\s\S]+?)\%\>/g,
      useParams: /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
      define: /\<\%##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\%\>/g,
      defineParams: /^\s*([\w$]+):([\s\S]+)/,
      conditional: /\<\%\?(\?)?\s*([\s\S]*?)\s*\%\>/g,
      iterate: /\<\%~\s*(?:\%\>|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\%\>)/g,
      varname: "data",
      strip: true,
      append: true,
      selfcontained: false,
      doNotSkipEncoded: false
    },
    filters: {},
    template: undefined,
    compile: undefined,
    render: undefined,
    log: true,
    cache: {}
  },
  _globals;

htmlTemp.encodeHTMLSource = function(doNotSkipEncoded) {
  let encodeHTMLRules = {
      "&": "&#38;",
      "<": "&#60;",
      ">": "&#62;",
      '"': "&#34;",
      "'": "&#39;",
      "/": "&#47;"
    },
    matchHTML = doNotSkipEncoded
      ? /[&<>"'\/]/g
      : /&(?!#?\w+;)|<|>|"|'|\//g;
  return function(code) {
    return code
      ? code.toString().replace(matchHTML, function(m) {
        return encodeHTMLRules[m] || m;
      })
      : "";
  };
};

_globals = (function() {
  return this || (0, eval)("this");
}());

let startend = {
    append: {
      start: "'+(",
      end: ")+'",
      startencode: "'+encodeHTML("
    },
    split: {
      start: "';out+=(",
      end: ");out+='",
      startencode: "';out+=encodeHTML("
    }
  },
  skip = /$^/;

function resolveDefs(c, block, def) {
  return ((typeof block === "string")
    ? block
    : block.toString()).replace(c.define || skip, function(m, code, assign, value) {
    if (code.indexOf("def.") === 0) {
      code = code.substring(4);
    }
    if (!(code in def)) {
      if (assign === ":") {
        if (c.defineParams) {
          value.replace(c.defineParams, function(m, param, v) {
            def[code] = {
              arg: param,
              text: v
            };
          });
        }
        if (!(code in def)) { def[code] = value; }
        } else {
        new Function("def", "def['" + code + "']=" + value)(def);
      }
    }
    return "";
  }).replace(c.use || skip, function(m, code) {
    if (c.useParams) {
      code = code.replace(c.useParams, function(m, s, d, param) {
        if (def[d] && def[d].arg && param) {
          let rw = (d + ":" + param).replace(/'|\\/g, "_");
          def.__exp = def.__exp || {};
          def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
          return s + "def.__exp['" + rw + "']";
        }
      });
    }
    let v = new Function("def", "return " + code)(def);
    return v
      ? resolveDefs(c, v, def)
      : v;
  });
}

function unescape(code) {
  return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
}

function filter(codes){
  let code=codes[0];
  for(let i =1; i<codes.length; i++){
    if(/\(/.test(codes[i])){
      let _code=codes[i].split("(");
      if(!htmlTemp.filters[_code[0]]){
        throw new Error("过滤器"+_code[0]+"不存在");
      }
      code="filters['"+_code[0]+"']("+code+","+_code[1];
    }else{
      if(!htmlTemp.filters[codes[i]]){
        throw new Error("过滤器"+codes[i]+"不存在");
      }
      code="filters['"+codes[i]+"']("+code+")";
    }
  }
  return code;
}

htmlTemp.template = function(tmpl, c, def) {
  c = c || htmlTemp.templateSettings;
  let cse = c.append
      ? startend.append
      : startend.split,
    needhtmlencode,
    sid = 0,
    indv,
    str = (c.use || c.define)
      ? resolveDefs(c, tmpl, def || {})
      : tmpl;

  str = ("var out='" + (c.strip
    ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ").replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "")
    : str).replace(/'|\\/g, "\\$&").replace(c.interpolate || skip, function(m, code) {
    if(/\|/.test(code)){
      let codeArr=code.split('|');
      code =filter(codeArr);
    }
    return cse.start + unescape(code) + cse.end;
  }).replace(c.encode || skip, function(m, code) {
    needhtmlencode = true;
    return cse.startencode + unescape(code) + cse.end;
  }).replace(c.conditional || skip, function(m, elsecase, code) {
    return elsecase
      ? (code
        ? "';}else if(" + unescape(code) + "){out+='"
        : "';}else{out+='")
      : (code
        ? "';if(" + unescape(code) + "){out+='"
        : "';}out+='");
  }).replace(c.iterate || skip, function(m, iterate, vname, iname) {
    if (!iterate) { return "';} } out+='"; }
    sid += 1;
    indv = iname || "i" + sid;
    iterate = unescape(iterate);
    return "';var arr" + sid + "=" + iterate + ";if(arr" + sid + "){var " + vname + "," + indv + "=-1,l" + sid + "=arr" + sid + ".length-1;while(" + indv + "<l" + sid + "){" + vname + "=arr" + sid + "[" + indv + "+=1];out+='";
  }).replace(c.evaluate || skip, function(m, code) {
    return "';" + unescape(code) + "out+='";
  }) + "';return out;").replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r").replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");

  if (needhtmlencode) {
    if (!c.selfcontained && _globals && !_globals._encodeHTML) { _globals._encodeHTML = htmlTemp.encodeHTMLSource(c.doNotSkipEncoded); }
    str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : (" + htmlTemp.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));" + str;
  }
  try {
    return new Function(c.varname,"filters", str);
  } catch (e) {
    if (typeof console !== "undefined") { console.log("无法创建这个模板函数: " + str); }
    throw e;
  }
};

htmlTemp.render=function(tmpl,data,def,id){
  if(typeof def!=='object'){
    def=null;
    id=def;
  }
  return htmlTemp.compile(tmpl,def,id)(data,htmlTemp.filters);
};
htmlTemp.renderDom=function(dom,tmpl,data,def,id){
  if(typeof dom!=='object'||!dom.tagName){
    dom=document.getElementById(dom.replace(/^#/, ""));
  }
  dom.innerHTML=htmlTemp.render(tmpl,data,def,id);
};

htmlTemp.compile = function(tmpl,def,id) {
  if(typeof def!=='object'){
    def=null;
    id=def;
  }
  let template;
  if(htmlTemp.cache[id]){
    template=htmlTemp.cache[id];
  }else{
    if(typeof tmpl==="object"&&tmpl.tagName){
      tmpl=tmpl.innerHTML;
    }else if(typeof tmpl==="string"&&!/</.test(tmpl)){
      tmpl=document.getElementById(tmpl.replace(/^#/, ""));
      tmpl=tmpl?tmpl.innerHTML:"";
    }
    template=htmlTemp.template(tmpl, null,def);
    if(id){
      htmlTemp.cache[id]=template;
    }
  }
  return template;
};

export default htmlTemp;
