
function ie7Quirks() {
  
  var FONT_SIZES = "xx-small,x-small,small,medium,large,x-large,xx-large".split(",");
  for (var i = 0; i < FONT_SIZES.length; i++) {
    FONT_SIZES[FONT_SIZES[i]] = FONT_SIZES[i - 1] || "0.67em";
  }
  
  var NEGATIVE = /^\-/, LENGTH = /(em|ex)$/i;
  var EM = /em$/i, EX = /ex$/i;

  var temp = createTempElement();
  
  IE7.CSS.addFix(new RegExp("(font(-size)?\\s*:\\s*)([\\w\\-\\.]+)"), function(match, label, size, value) {
    return label + (FONT_SIZES[value] || value);
  });

  function getFontScale(element) {
    var scale = 1;
    temp.style.fontFamily = element.currentStyle.fontFamily;
    temp.style.lineHeight = element.currentStyle.lineHeight;
    //temp.style.fontSize = "";
    while (element != body) {
      var fontSize = element.currentStyle["ie7-font-size"];
      if (fontSize) {
        if (EM.test(fontSize)) scale *= parseFloat(fontSize);
        else if (PERCENT.test(fontSize)) scale *= (parseFloat(fontSize) / 100);
        else if (EX.test(fontSize)) scale *= (parseFloat(fontSize) / 2);
        else {
          temp.style.fontSize = fontSize;
          return 1;
        }
      }
      element = element.parentElement;
    }
    return scale;
  };

  getPixelValue = function(element, value) {
    if (PIXEL.test(value||0)) return parseInt(value||0);
    var scale = NEGATIVE.test(value)? -1 : 1;
    if (LENGTH.test(value)) scale *= getFontScale(element);
    temp.style.width = (scale < 0) ? value.slice(1) : value;
    body.appendChild(temp);
    // retrieve pixel width
    value = scale * temp.offsetWidth;
    // remove the temporary element
    temp.removeNode();
    return parseInt(value);
  };

  // we need to preserve font-sizes as IE makes a bad job of it
  HEADER = HEADER.replace(/(font(-size)?\s*:\s*([^\s;}\/]*))/gi, "ie7-font-size:$3;$1");

  // cursor:pointer (IE5.x)
  IE7.CSS.addFix(/cursor\s*:\s*pointer/, "cursor:hand");
  // display:list-item (IE5.x)
  IE7.CSS.addFix(/display\s*:\s*list-item/, "display:block");
  
  // -----------------------------------------------------------------------
  //  margin:auto
  // -----------------------------------------------------------------------
  
  function getPaddingWidth(element) {
    return getPixelValue(element, element.currentStyle.paddingLeft) +
      getPixelValue(element, element.currentStyle.paddingRight);
  };
  
  function fixMargin(element) {
    if (appVersion < 5.5) IE7.Layout.boxSizing(element.parentElement);
    var parent = element.parentElement;
    var margin = parent.offsetWidth - element.offsetWidth - getPaddingWidth(parent);
    var autoRight = (element.currentStyle["ie7-margin"] && element.currentStyle.marginRight == "auto") ||
      element.currentStyle["ie7-margin-right"] == "auto";
    switch (parent.currentStyle.textAlign) {
      case "right":
        margin = (autoRight) ? parseInt(margin / 2) : 0;
        element.runtimeStyle.marginRight = parseInt(margin) + "px";
        break;
      case "center":
        if (autoRight) margin = 0;
      default:
        if (autoRight) margin = parseInt(margin / 2);
        element.runtimeStyle.marginLeft = parseInt(margin) + "px";
    }
  };
  
  IE7.CSS.addRecalc("margin(-left|-right)?", "[^};]*auto", function(element) {
    if (register(fixMargin, element,
      element.parentElement &&
      element.currentStyle.display == "block" &&
      element.currentStyle.marginLeft == "auto" &&
      element.currentStyle.position != "absolute")) {
        fixMargin(element);
    }
  });
  
  addResize(function() {
    for (var i in fixMargin.elements) {
      element = fixMargin.elements[i];
      element.runtimeStyle.marginLeft =
      element.runtimeStyle.marginRight = "";
      fixMargin(element);
    }
  });
};
