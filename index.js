import HtmlTemp from "./src/HtmlTemp";

export default function(temp,data,dom,filter){
  if(typeof temp==="object"){
    temp=temp.innerHTML;
  }else if(!/</.test(temp)){
    temp = temp.replace(/^#/, "");
    temp = document.getElementById(temp).innerHTML;
  }

  if (typeof data === "undefined") {
    return HtmlTemp.template(temp);
  }else{
    return HtmlTemp.template(temp)(data);
  }
}
