/// <reference path="./jquery.d.ts" />

var defaultSpreadSheetRow = 15;
var defaultSpreadSheetCol = 10;

var nowCol = 0;
var nowRow = 0;

var isResizedMode = false;
var lastX;
var lastY;
var hitHotRegion;
var direction;
var resizedTr;
var resizedTd;
var moveX;
var moveY;

function createTable() {
    var newTable = $("<table><tr></tr></table>");
    newTable.attr("id", "myTable");
    $("body").append(newTable);
}

function addUnit(text, whichRow, id, editable) {
    if (typeof text === "undefined" || text === null) {
        text = "";
    } else {
        //text = arguments[0];
    }
    var newUnit = $("<td></td>");
    newUnit.text(text);
    newUnit.css({ "width": "56px", "height": "18px" });

    if (id) {
        newUnit.attr("id", id);
    }

    if (editable) {
        newUnit.attr("contenteditable", "true");
    }

    if (whichRow) {
        $("table tbody tr:nth-child(" + whichRow + ")").append(newUnit);
    } else {
        $("table tbody tr:last").append(newUnit);
    }

}

function addBlankLine() {
    var newLine = $("<tr></tr>");
    $("table tbody").append(newLine);
}

function addFullCol() {
    var tr = $("tr");
    addUnit(String.fromCharCode(65 + nowCol), 1, "top", false);
    nowCol++;

    for (var i = 2; i <= tr.length; i++) {
        addUnit("", i, "", true);
    }
}

function addFullLine() {
    if (hasANewLine() == false) {
        addBlankLine();
    }
    addUnit(nowRow + 1, "", "left", false);

    for (var i = 1; i < nowCol; i++) {
        addUnit("", "", "", true);
    }

    nowRow++;
}

function hasANewLine() {
    if ($("tr:last").html() === "") {
        return true;
    } else {
        return false;
    }
}

function removeCol() {
    $("td:last").remove();
}

function removeFullCol() {
    $("td:last-child").remove();
}

function removeLine() {
    $("tr:last").remove();
    nowRow--;
}

function createSpreadSheet() {
    $("body").mousemove(showCursorPosition);
    $("body").mousedown(mouseDown);
    $("body").mouseup(mouseUp);
    createTable();
    addUnit("", "", "lefttop", false);
    for (var i = 0; i < defaultSpreadSheetCol; i++) {
        addFullCol();
    }
    removeCol();
    for (var i = 0; i < defaultSpreadSheetRow; i++) {
        addFullLine();
    }

}

function showCursorPosition(event) {
    var x = event.clientX;
    var y = event.clientY;
    var whichCell = judgeOnWhichCell(event);
    var row = $("tr:nth-child(" + (whichCell.trNo + 1) + ") td:first");
    var col = $("tr:first td:nth-child(" + (whichCell.tdNo + 1) + ")");
    $("#pos").html("x:" + x + " y:" + y + " " + col.html() + row.html());



    if (isResizedMode === false) {
        setCursor(whichCell);
    } else {
        //$("td").css("cursor", "");
        moveX = x - lastX;
        moveY = y - lastY;
        if (hitHotRegion) {
            if (direction === "horizontal") {
                var oldWidth = $("tr:nth-child(" + (resizedTr + 1) + ") td:nth-child(" + (resizedTd + 1) + ")").width();
                $("td:nth-child(" + (resizedTd + 1) + ")").width(oldWidth + moveX + 1);//1 may be border
            } else if (direction === "vertical") {
                var oldHeight = $("tr:nth-child(" + (resizedTr + 1) + ") td:nth-child(" + (resizedTd + 1) + ")").height();
                $("tr:nth-child(" + (resizedTr + 1) + ") td ").height(oldHeight + moveY + 1);
            }

        }
    }
    lastX = x;
    lastY = y;

}

function judgeOnWhichCell(event) {
    var x = event.clientX;
    var y = event.clientY;
    var tr = $("tr");
    var table = $("#myTable");
    var tableX = $("td:first").offset().left;
    var tableY = $("td:first").offset().top;
    var leftWidth = tableX;
    var topHeight = tableY;
    var tableWidth = table[0].offsetWidth;
    var tableHeight = table[0].offsetHeight;
    var trNo = 0;
    var tdNo = 0;

    for (var i = 0; i < tr.length; i++) {
        if (y > topHeight && y <= topHeight + tr[i].offsetHeight && x <= tableX + tableWidth + 5) {
            trNo = i;
            break;
        }
        topHeight += tr[i].offsetHeight;
    }

    var td = $("tr:nth-child(" + (trNo + 1) + ") td");

    for (var i = 0; i < td.length; i++) {
        if (x > leftWidth && x <= leftWidth + td[i].offsetWidth && y <= tableY + tableHeight + 5) {
            tdNo = i;
            break;
        }
        leftWidth += td[i].offsetWidth;
    }

    return {
        x: x,
        y: y,
        trNo: trNo,
        tdNo: tdNo,
        topHeight: topHeight,
        leftWidth: leftWidth
    };
}

function setCursor(cursorInfo) {
    var x = cursorInfo.x;
    var y = cursorInfo.y;
    var trNo = cursorInfo.trNo;
    var tdNo = cursorInfo.tdNo;
    var topDistance = cursorInfo.topHeight;
    var leftDistance = cursorInfo.leftWidth;

    var horizontalBorderRegion = 10;
    var verticalBorderRegion = 5;
    var nowCell = $("tr:nth-child(" + (trNo + 1) + ") td:nth-child(" + (tdNo + 1) + ")");
    var offsetWidth = nowCell.outerWidth();
    var offsetHeight = nowCell.outerHeight();

    if (x > leftDistance && x <= leftDistance + horizontalBorderRegion) {
        //left
        nowCell.css("cursor", "e-resize");
        direction = "horizontal";
        resizedTr = trNo;
        resizedTd = tdNo - 1;
        hitHotRegion = true;
    } else if (x > leftDistance + offsetWidth - horizontalBorderRegion && x <= leftDistance + offsetWidth) {
        //right
        nowCell.css("cursor", "e-resize");
        direction = "horizontal";
        resizedTr = trNo;
        resizedTd = tdNo;
        hitHotRegion = true;
    } else if (y > topDistance && y <= topDistance + verticalBorderRegion) {
        //top
        nowCell.css("cursor", "n-resize");
        direction = "vertical";
        resizedTr = trNo - 1;
        resizedTd = tdNo;
        hitHotRegion = true;
    } else if (y > topDistance + offsetHeight - verticalBorderRegion && y <= topDistance + offsetHeight) {
        //buttom
        nowCell.css("cursor", "n-resize");
        direction = "vertical";
        resizedTr = trNo;
        resizedTd = tdNo;
        hitHotRegion = true;
    } else {
        //when move away some cell may still has cursor so do this
        $("td").css("cursor", "");
        direction = "";
        hitHotRegion = false;
    }
    
    return {
        direction: direction,
        resizedTr: resizedTr,
        resizedTd: resizedTd,
        hitHotRegion: hitHotRegion
    }

}

function mouseDown(event) {
    isResizedMode = true;

}

function mouseUp(event) {
    isResizedMode = false;

}
