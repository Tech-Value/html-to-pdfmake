(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.htmlToPdfmake=f()}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r}()({1:[function(require,module,exports){module.exports=function(htmlText,options){var wndw=options&&options.window?options.window:window;var defaultStyles={b:{bold:true},strong:{bold:true},u:{decoration:"underline"},s:{decoration:"lineThrough"},em:{italics:true},i:{italics:true},h1:{fontSize:24,bold:true,marginBottom:5},h2:{fontSize:22,bold:true,marginBottom:5},h3:{fontSize:20,bold:true,marginBottom:5},h4:{fontSize:18,bold:true,marginBottom:5},h5:{fontSize:16,bold:true,marginBottom:5},h6:{fontSize:14,bold:true,marginBottom:5},a:{color:"blue",decoration:"underline"},strike:{decoration:"lineThrough"},p:{margin:[0,5,0,10]},ul:{marginBottom:5},li:{marginLeft:5},table:{marginBottom:5},th:{bold:true,fillColor:"#EEEEEE"}};var inlineTags=["p","li","span","strong","em","b","i","u","th","td"];function changeDefaultStyles(){for(var keyStyle in options.defaultStyles){if(defaultStyles.hasOwnProperty(keyStyle)){if(options.defaultStyles.hasOwnProperty(keyStyle)&&!options.defaultStyles[keyStyle]){delete defaultStyles[keyStyle]}else{for(var k in options.defaultStyles[keyStyle]){if(!options.defaultStyles[keyStyle][k])delete defaultStyles[keyStyle][k];else defaultStyles[keyStyle][k]=options.defaultStyles[keyStyle][k]}}}}}if(options&&options.defaultStyles){changeDefaultStyles()}var convertHtml=function(htmlText){var docDef=[];var parser=new wndw.DOMParser;var parsedHtml=parser.parseFromString(htmlText,"text/html");[].forEach.call(parsedHtml.body.childNodes,function(child){var ret=parseElement(child);if(ret){if(Array.isArray(ret)&&ret.length===1)ret=ret[0];docDef.push(ret)}});return docDef};var parseElement=function(element,parentNode,parents){var nodeName=element.nodeName.toLowerCase();var parentNodeName=parentNode?parentNode.nodeName.toLowerCase():"";var ret,text,cssClass,dataset,key,dist,isInlineTag,hasStackTags;parents=parents||[];switch(element.nodeType){case 3:{if(element.textContent){text=element.textContent.replace(/\n(\s+)?/g,"");if(text){if(/^\s+$/.test(text)&&["table","thead","tbody","tr"].indexOf(parentNodeName)>-1)return ret;ret={text:text};if(parentNodeName){applyParentsStyle(ret,element);if(parentNodeName==="a"){ret.link=parentNode.getAttribute("href")}}else{ret=text}}}return ret}case 1:{ret=[];parents.push(nodeName);if(element.childNodes.length===0&&(parents.indexOf("th")>-1||parents.indexOf("td")>-1)){var ancestor=element;var allEmpty=true;while(ancestor.nodeName!=="TH"&&ancestor.nodeName!=="TD"){if(ancestor.textContent!==""){allEmpty=false;break}ancestor=ancestor.parentNode}if(allEmpty)ret.push({text:""})}else{[].forEach.call(element.childNodes,function(child){child=parseElement(child,element,parents);if(child){if(Array.isArray(child)&&child.length===1)child=child[0];ret.push(child)}});parents.pop()}if(ret.length===0)ret="";switch(nodeName){case"svg":{ret={svg:element.outerHTML};ret.style=["html-"+nodeName];break}case"br":{ret="\n";break}case"hr":{var styleHR={width:514,type:"line",margin:[0,12,0,12],thickness:.5,color:"#000000",left:0};if(element.dataset&&element.dataset.pdfmake){dataset=JSON.parse(element.dataset.pdfmake);for(key in dataset){styleHR[key]=dataset[key]}}ret={margin:styleHR.margin,canvas:[{type:styleHR.type,x1:styleHR.left,y1:0,x2:styleHR.width,y2:0,lineWidth:styleHR.thickness,lineColor:styleHR.color}]};break}case"ol":case"ul":{ret={_:ret};ret[nodeName]=ret._;delete ret._;ret.style=["html-"+nodeName];cssClass=element.getAttribute("class");if(cssClass){ret.style=ret.style.concat(cssClass.split(" "))}setComputedStyle(ret,element);break}case"table":{ret={_:ret,table:{body:[]}};ret._.forEach(function(re){if(re.stack){var td=[],rowspan={};re.stack.forEach(function(r,indexRow){var c,cell,i,indexCell;if(r.stack){if(rowspan[indexRow]){rowspan[indexRow].forEach(function(cell){r.stack.splice(cell.index,0,{text:"",style:["html-td","html-tr"],colSpan:cell.colspan})})}for(c=0,cell;c<r.stack.length;){cell=r.stack[c];if(cell.colSpan>1){for(i=0;i<cell.colSpan-1;i++){r.stack.splice(c+1,0,"")}c+=cell.colSpan}else c++}indexCell=0;r.stack.forEach(function(cell){if(cell.rowSpan){for(var i=0;i<cell.rowSpan;i++){if(!rowspan[indexRow+i])rowspan[indexRow+i]=[];rowspan[indexRow+i].push({index:indexCell,colspan:cell.colSpan||1})}}indexCell+=cell.colSpan||1});ret.table.body.push(r.stack)}else{td.push(r);if(r.colSpan>1){for(i=0;i<r.colSpan-1;i++){td.push("")}}}});if(td.length>0)ret.table.body.push(td)}else{ret.table.body.push([re])}});delete ret._;setComputedStyle(ret,element);var insertBreakLine=function(content,prevContent,firstStyleOnly){var breakLine=false,i;if(prevContent&&Array.isArray(content.style)){for(i=0;i<content.style.length;i++){if(firstStyleOnly&&i>0)break;if(content.style[i]==="html-p"||content.style[i]==="html-div"){breakLine=true;break}else if(content.style[i]==="html-td")break}if(breakLine){if(typeof prevContent.text==="string"){prevContent.text+="\n"}else if(Array.isArray(prevContent.text)){prevContent.text.push({text:"\n"})}}else if(!firstStyleOnly&&Array.isArray(prevContent.style)){for(i=0;i<prevContent.style.length;i++){if(prevContent.style[i]==="html-p"||prevContent.style[i]==="html-div"){breakLine=true;break}else if(prevContent.style[i]==="html-td")break}if(breakLine){if(typeof prevContent.text==="string"){prevContent.text+="\n"}else if(Array.isArray(prevContent.text)){prevContent.text.push({text:"\n"})}}}}if(Array.isArray(content.text)){for(i=0;i<content.text.length;i++){insertBreakLine(content.text[i],content.text[i-1],true)}}};ret.table.body.forEach(function(row){row.forEach(function(cell){if(Array.isArray(cell.text)){for(var i=0;i<cell.text.length;i++){insertBreakLine(cell.text[i],cell.text[i-1])}}})});break}case"img":{ret={image:element.getAttribute("src")};ret.style=["html-img"];cssClass=element.getAttribute("class");if(cssClass){ret.style=ret.style.concat(cssClass.split(" "))}if(element.getAttribute("width")){ret.width=parseFloat(element.getAttribute("width"))}if(element.getAttribute("height")){ret.height=parseFloat(element.getAttribute("height"))}setComputedStyle(ret,element);break}case"h1":case"h2":case"h3":case"h4":case"h5":case"h6":{ret={stack:[{text:ret}]};ret.stack[0].style=["html-"+nodeName];cssClass=element.getAttribute("class");if(cssClass){ret.stack[0].style=ret.stack[0].style.concat(cssClass.split(" "))}applyDefaultStyle(ret.stack[0],nodeName);setComputedStyle(ret.stack[0],element);break}}if(ret){if(Array.isArray(ret)){if(ret.length===1&&nodeName!=="tr"){ret=ret[0];if(typeof ret==="string")ret={text:ret};if(ret.text){applyDefaultStyle(ret,nodeName);setComputedStyle(ret,element)}ret.style=(ret.style||[]).concat(["html-"+nodeName]);if(nodeName==="td"||nodeName==="th")ret.style.push("html-tr")}else{isInlineTag=inlineTags.indexOf(nodeName)>-1;hasStackTags=/{"(stack|table|ol|ul|image)"/.test(JSON.stringify(ret));if(nodeName==="div"&&!hasStackTags)ret={text:ret};else if(isInlineTag&&hasStackTags)ret={stack:ret};else if(!isInlineTag)ret={stack:ret};else ret={text:ret};if(isInlineTag){applyDefaultStyle(ret,nodeName)}ret.style=["html-"+nodeName]}applyParentsStyle(ret,element);if(nodeName==="td"||nodeName==="th"){if(element.getAttribute("rowspan"))ret.rowSpan=element.getAttribute("rowspan")*1;if(element.getAttribute("colspan"))ret.colSpan=element.getAttribute("colspan")*1}cssClass=element.getAttribute("class");if(cssClass){ret.style=(ret.style||[]).concat(cssClass.split(" "))}if(ret.text){setComputedStyle(ret,element)}}else if(ret.table||ret.ol||ret.ul){ret.style=["html-"+nodeName];cssClass=element.getAttribute("class");if(cssClass){ret.style=ret.style.concat(cssClass.split(" "))}applyDefaultStyle(ret,nodeName)}if(element.dataset&&element.dataset.pdfmake){dataset=JSON.parse(element.dataset.pdfmake);dist=ret[nodeName]||ret;for(key in dataset){dist[key]=dataset[key]}}cssClass=element.getAttribute("class");if(cssClass&&typeof ret==="object"){ret.style=(ret.style||[]).concat(cssClass.split(" "))}if(typeof ret==="object"&&Array.isArray(ret.style)){ret.style=ret.style.filter(function(value,index,self){return self.indexOf(value)===index})}}return ret}}return""};var applyDefaultStyle=function(ret,nodeName){if(defaultStyles[nodeName]){for(var style in defaultStyles[nodeName]){if(defaultStyles[nodeName].hasOwnProperty(style)){ret[style]=defaultStyles[nodeName][style]}}}};var applyParentsStyle=function(ret,node){var classes=[],defaultStyles=[],cssClass,cssStyles=[];var parentNode=node.parentNode;var inlineParentNode=node.parentNode;while(inlineParentNode){var defaultStyle={};var inlineParentNodeName=inlineParentNode.nodeName.toLowerCase();if(inlineTags.indexOf(inlineParentNodeName)>-1){cssClass=inlineParentNode.getAttribute("class");classes=classes.concat(["html-"+inlineParentNodeName],cssClass||[]);applyDefaultStyle(defaultStyle,inlineParentNodeName);defaultStyles.push(defaultStyle);inlineParentNode=inlineParentNode.parentNode}else break}ret.style=(ret.style||[]).concat(classes);defaultStyles.forEach(function(defaultStyle){for(var key in defaultStyle){if(key.indexOf("margin")===-1&&ret[key]===undefined)ret[key]=defaultStyle[key]}});while(parentNode.nodeType===1){cssStyles=cssStyles.concat(computeStyle(parentNode.getAttribute("style"),parentNode));parentNode=parentNode.parentNode}cssStyles.reverse();cssStyles.forEach(function(stl){ret[stl.key]=stl.value});if(ret.style.length===0)delete ret.style};var computeStyle=function(style,element){if(!style)return[];var styleDefs=style.split(";").map(function(style){return style.toLowerCase().split(":")});var ret=[];var borders=[];var nodeName=element.nodeName.toUpperCase();styleDefs.forEach(function(styleDef){if(styleDef.length===2){var key=styleDef[0].trim();var value=styleDef[1].trim();switch(key){case"margin":{value=value.replace(/(\d+)(\.\d+)?([^\d]+)/g,"$1$2 ").trim().split(" ");if(value.length===1)value=+value[0];else if(value.length===2)value=[+value[1],+value[0]];else if(value.length===3)value=[+value[1],+value[0],+value[1],+value[2]];else if(value.length===4)value=[+value[3],+value[0],+value[1],+value[2]];ret.push({key:key,value:value});break}case"text-align":{ret.push({key:"alignment",value:value});break}case"font-weight":{if(value==="bold")ret.push({key:"bold",value:true});break}case"text-decoration":{ret.push({key:"decoration",value:toCamelCase(value)});break}case"font-style":{if(value==="italic")ret.push({key:"italics",value:true});break}case"font-family":{ret.push({key:"font",value:value.replace(/"|^'|'$/g,"")});break}case"color":{ret.push({key:"color",value:parseColor(value)});break}case"background-color":{ret.push({key:nodeName==="TD"||nodeName==="TH"?"fillColor":"background",value:parseColor(value)});break}default:{if(key==="border"||key.indexOf("border-left")===0||key.indexOf("border-top")===0||key.indexOf("border-right")===0||key.indexOf("border-bottom")===0){borders.push({key:key,value:value})}else{if(key.indexOf("-")>-1)key=toCamelCase(key);if(value){value=value.replace(/(\d+)(\.\d+)?([^\d]+)/g,"$1$2 ").trim();if(!isNaN(value))value=+value;ret.push({key:key,value:value})}}}}}});if(borders.length>0){var border=[];var borderColor=[];borders.forEach(function(b){var properties=b.value.split(" ");var width=properties[0].replace(/(\d+)(\.\d+)?([^\d]+)/g,"$1$2 ").trim();var index=-1,i;if(b.key.indexOf("-left")>-1)index=0;else if(b.key.indexOf("-top")>-1)index=1;else if(b.key.indexOf("-right")>-1)index=2;else if(b.key.indexOf("-bottom")>-1)index=3;if(index>-1){border[index]=width>0}else{for(i=0;i<4;i++)border[i]=width>0}if(properties.length>2){var color=properties.slice(2).join(" ");if(index>-1){borderColor[index]=parseColor(color)}else{for(i=0;i<4;i++)borderColor[i]=parseColor(color)}}});for(var i=0;i<4;i++){if(border.length>0&&typeof border[i]==="undefined")border[i]=true;if(borderColor.length>0&&typeof borderColor[i]==="undefined")borderColor[i]="#000000"}if(border.length>0)ret.push({key:"border",value:border});if(borderColor.length>0)ret.push({key:"borderColor",value:borderColor})}return ret};var setComputedStyle=function(ret,element){var cssStyle=element.getAttribute("style");if(cssStyle){cssStyle=computeStyle(cssStyle,element);cssStyle.forEach(function(style){ret[style.key]=style.value})}};var toCamelCase=function(str){return str.replace(/-([a-z])/g,function(g){return g[1].toUpperCase()})};var parseColor=function(color){var haxRegex=new RegExp("^#([0-9a-f]{3}|[0-9a-f]{6})$");var rgbRegex=new RegExp("^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$");var nameRegex=new RegExp("^[a-z]+$");if(haxRegex.test(color)){return color}else if(rgbRegex.test(color)){var decimalColors=rgbRegex.exec(color).slice(1);for(var i=0;i<3;i++){var decimalValue=+decimalColors[i];if(decimalValue>255){decimalValue=255}var hexString="0"+decimalValue.toString(16);hexString=hexString.slice(-2);decimalColors[i]=hexString}return"#"+decimalColors.join("")}else if(nameRegex.test(color)){return color}else{console.error('Could not parse color "'+color+'"');return color}};return convertHtml(htmlText)}},{}]},{},[1])(1)});
