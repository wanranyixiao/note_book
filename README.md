    这是一个基本文本编辑的jquery插件，应用在div上，可以编辑内容。
    还是来看看如何使用吧。
1.引用js、css文件
```javascript
<link rel="stylesheet" type="text/css" href="./css/font-awesome/css/font-awesome.css">
<link rel="stylesheet" type="text/css" href="./css/jquery.notebook.css">
<script type="text/javascript" src="./js/jquery.min.js"></script>
<script type="text/javascript" src="./js/jquery.notebook.js"></script>
```
2.定义div标签
```
<div id="editor1">
    <h1>JQUERY NOTEBOOK DEMO</h1>
    <p>一个简单，干净，优雅的所见即所得的富文本编辑器.<strong>用鼠标选中文字可看到效果</strong></p>
    <p>This jQuery plugin is released under the MIT license. You can check out the project and see how extremely simple it is to use this editor on your application by clicking on the Github ribbon on the top corner of this page. Feel free to contribute with this project by registering any bug that you may encounter as an issue on Github, and working on the issues that are already there. I'm looking forward to seeing your pull request!</p>
    <p>Now, just take a time to test the editor. Yes, <b>this div is the editor</b>. Try to edit this text, select a part of this text and don't forget to try the basic text editor keyboard shortcuts.</p>
</div>
```
3.初始化编辑器
```
<script type="text/javascript">
$(document).ready(function() {
    var e1 = $('#editor1').notebook({tabSpaces:true,clickShow:true});//options={{tabSpaces:true,clickShow:true}}
    $("document").on("click",function(){
      var note = el.data("n.notebook");
      var btns = note.options.buttons;
    });
});
</script>
```
##option参数配置说明
    buttons展示的功能按钮，默认全部
```
  buttons: ["fontFamily","fontSize","bold", "italic", "underline","foreColor", "backColor","space","justifyLeft","justifyRight","justifyCenter","justifyFull", "insertOrderedList", "insertUnorderedList", "outdent","space", "indent", "createLink","selectAll", "removeFormat","undo", "redo"]
```
    colors 字体颜色几字体背景颜色值
```
colors : ["#000000", "#444444", "#666666", "#999999", "#CCCCCC", "#EEEEEE", "#F3F3F3", "#FFFFFF", "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#9900FF", "#FF00FF", "#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#D0E0E3", "#CFE2F3", "#D9D2E9", "#EAD1DC", "#EA9999", "#F9CB9C", "#FFE599", "#B6D7A8", "#A2C4C9", "#9FC5E8", "#B4A7D6", "#D5A6BD", "#E06666", "#F6B26B", "#FFD966", "#93C47D", "#76A5AF", "#6FA8DC", "#8E7CC3", "#C27BA0", "#CC0000", "#E69138", "#F1C232", "#6AA84F", "#45818E", "#3D85C6", "#674EA7", "#A64D79", "#990000", "#B45F06", "#BF9000", "#38771D", "#134F5C", "#0B5394", "#351C75", "#741B47", "#660000", "#783F04", "#7F6000", "#274E13", "#0C343D", "#073763", "#201211", "#4C1130"]
```
    fontFamily 字体
```
fontFamily:['微软雅黑','Serif','Sans','Arial','Arial Black','Courier','Courier New','Comic Sans MS','Helvetica','Impact','Lucida Grande','Lucida Sans','Tahoma','Times','Times New Roman','Verdana']
```
    inlineMode 是否悬浮展示工具栏,默认为true
```
inlineMode: true,
```
    clickShow 点击文本展示工具栏，默认为false
```
clickShow: false,
```
    tabSpaces tab键触发不执行缩进标签而执行添加空格，默认为false
```
tabSpaces: false,
```  
    tabLength tabSpaces为true时，tab缩进几个空格，默认2个
```
tabLength: 2,
```  
    placeholder 文本内容为空时默认展示文字
```
    placeholder: "请在此输入文字",
```
    hotkeys 是否使用快捷键,默认为true
```
    hotkeys: true,
```   
    hotkeysAvailable 可使用快捷键
```
   hotkeysAvailable: ["bold", "italic", "underline","undo","redo","justifyRight","justifyFull","justifyLeft","justifyCenter"],//加粗、倾斜、下划线、撤销、重做、右对齐、两端对齐、左对齐、中间对齐
		
``` 
    zIndex 工具栏层级
```
    zIndex: 1e3,
```  

##方法
  show()
```
   el.data("n.notebook").show();
```  
  hide()
```
   el.data("n.notebook").hide();
```  
  destroy()
```
   el.data("n.notebook").destroy();
```  
