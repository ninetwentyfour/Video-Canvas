Function.prototype.bind = function (a) {
    var b = this;
    return function () {
        return b.apply(a, arguments)
    }
};
Array.prototype.remove = function (a) {
    for (var b = this.length; b--;) this[b] === a && this.splice(b, 1)
};
Event = function () {
    this.handlers = []
};
Event.prototype.dispose = function () {
    this.handlers = []
};
Event.prototype.add = function (a, b) {
    this.handlers.push({
        handler: a,
        obj: b
    })
};
Event.prototype.remove = function (a, b) {
    for (var c = this.handlers.length - 1; c >= 0; c--) this.handlers[c].handler === a && this.handlers[c].obj === b && this.handlers.splice(c, 1)
};
Event.prototype.raise = function () {
    for (var a = 0; a < this.handlers.length; a++) this.handlers[a].handler.apply(this.handlers[a].obj, arguments)
};
var Point = function (a, b) {
        this.x = a;
        this.y = b
    };
Point.prototype.equals = function (a) {
    return this.x === a.x && this.y === a.y
};
var Size = function (a, b) {
        this.width = a;
        this.height = b
    },
    Rectangle = function (a, b, c, d) {
        this.x = a;
        this.y = b;
        this.width = c;
        this.height = d
    };
Rectangle.prototype.union = function (a) {
    var b = this.x < a.x ? this.x : a.x,
        c = this.y < a.y ? this.y : a.y;
    return new Rectangle(b, c, (this.x + this.width < a.x + a.width ? a.x + a.width : this.x + this.width) - b, (this.y + this.height < a.y + a.height ? a.y + a.height : this.y + this.height) - c)
};
Rectangle.prototype.toString = function () {
    return "(" + this.x + "," + this.y + ")-(" + this.width + "," + this.height + ")"
};
var TextPosition = function () {
        if (arguments.length === 1) {
            this.line = arguments[0].line;
            this.column = arguments[0].column
        }
        if (arguments.length === 2) {
            this.line = arguments[0];
            this.column = arguments[1]
        }
    };
TextPosition.prototype.equals = function (a) {
    return this.line === a.line && this.column === a.column
};
TextPosition.prototype.compareTo = function (a) {
    var b = this.line - a.line;
    return b === 0 ? this.column - a.column : b
};
TextPosition.prototype.toString = function () {
    return "(" + this.line + "," + this.column + ")"
};
TextRange = function () {
    if (arguments.length === 1) {
        this.start = new TextPosition(arguments[0].start);
        this.end = new TextPosition(arguments[0].end)
    }
    if (arguments.length === 2) {
        this.start = arguments[0];
        this.end = arguments[1]
    }
};
TextRange.prototype.isEmpty = function () {
    return this.start.line === this.end.line && this.start.column === this.end.column
};
TextRange.prototype.normalize = function () {
    return this.start.compareTo(this.end) > 0 ? new TextRange(new TextPosition(this.end), new TextPosition(this.start)) : new TextRange(this)
};
TextRange.prototype.toString = function () {
    return this.start.toString() + "-" + this.end.toString()
};
var ContainerUndoUnit = function () {
        this.undoUnits = []
    };
ContainerUndoUnit.prototype.add = function (a) {
    this.undoUnits.push(a)
};
ContainerUndoUnit.prototype.undo = function () {
    for (var a = 0; a < this.undoUnits.length; a++) this.undoUnits[a].undo()
};
ContainerUndoUnit.prototype.redo = function () {
    for (var a = 0; a < this.undoUnits.length; a++) this.undoUnits[a].redo()
};
ContainerUndoUnit.prototype.isEmpty = function () {
    if (this.undoUnits.length > 0) for (var a = 0; a < this.undoUnits.length; a++) if (!this.undoUnits[a].isEmpty || !this.undoUnits[a].isEmpty()) return false;
    return true
};
ContainerUndoUnit.prototype.toString = function () {
    for (var a = "Container:\n", b = 0; b < this.undoUnits.length; b++) a += "\t" + this.undoUnits[b].toString() + "\n";
    return a
};
var SelectionUndoUnit = function (a, b) {
        this.textModel = a;
        this.redoTextRange = b;
        this.undoTextRange = this.textModel.getTextRange()
    };
SelectionUndoUnit.prototype.undo = function () {
    this.textModel.selectRange(this.undoTextRange)
};
SelectionUndoUnit.prototype.redo = function () {
    this.textModel.selectRange(this.redoTextRange)
};
SelectionUndoUnit.prototype.merge = function (a) {
    if (a instanceof SelectionUndoUnit) {
        this.redoTextRange = a.redoTextRange;
        return true
    }
    return false
};
SelectionUndoUnit.prototype.toString = function () {
    return "Selection: " + this.redoTextRange.toString() + " => " + this.undoTextRange.toString()
};
var TextUndoUnit = function (a, b, c, d) {
        this.textModel = a;
        this.textBuffer = b;
        this.redoRange = c;
        this.redoText = d;
        this.undoRange = this.redoSelection = null;
        this.undoText = this.textBuffer.getText(c);
        this.undoSelection = this.textModel.getTextRange()
    };
TextUndoUnit.prototype.undo = function () {
    this.textBuffer.setText(this.undoRange, this.undoText);
    this.textModel.selectRange(this.undoSelection)
};
TextUndoUnit.prototype.redo = function () {
    this.undoRange = this.textBuffer.setText(this.redoRange, this.redoText);
    if (this.redoSelection === null) {
        var a = this.textModel.toScreenPosition(this.undoRange.end);
        this.redoSelection = new TextRange(new TextPosition(a), new TextPosition(a))
    }
    this.textModel.selectRange(this.redoSelection)
};
TextUndoUnit.prototype.merge = function (a) {
    if (a instanceof SelectionUndoUnit) {
        this.redoSelection = a.redoTextRange;
        return true
    }
    return false
};
TextUndoUnit.prototype.toString = function () {
    return "Text: " + this.undoRange.toString() + " => " + this.redoRange.toString() + " | '" + this.undoText.replace(/\t/g, "\\t") + "' => '" + this.redoText.replace(/\t/g, "\\t") + "' | " + this.undoSelection.toString() + " => " + this.redoSelection.toString()
};
var UndoService = function () {
        this.container = null;
        this.stack = [];
        this.position = 0
    };
UndoService.prototype.begin = function () {
    this.container = new ContainerUndoUnit
};
UndoService.prototype.cancel = function () {
    this.container = null
};
UndoService.prototype.commit = function () {
    if (!this.container.isEmpty()) {
        this.stack.splice(this.position, this.stack.length - this.position);
        this.stack.push(this.container);
        this.redo();
        for (var a = this.stack[this.stack.length - 1], b = a.undoUnits.length - 1; b > 0; b--) {
            if (!a.undoUnits[b - 1].merge || !a.undoUnits[b - 1].merge(a.undoUnits[b])) break;
            a.undoUnits.splice(b, 1)
        }
        if (this.stack.length > 1) {
            b = this.stack[this.stack.length - 2];
            if (a.undoUnits.length === 1 && b.undoUnits.length > 0 && b.undoUnits[b.undoUnits.length - 1].merge && b.undoUnits[b.undoUnits.length - 1].merge(a.undoUnits[0])) {
                this.stack.splice(this.stack.length - 1, 1);
                this.position--
            }
        }
    }
    this.container = null
};
UndoService.prototype.add = function (a) {
    this.container.add(a)
};
UndoService.prototype.clear = function () {
    this.stack = [];
    this.position = 0
};
UndoService.prototype.undo = function () {
    if (this.position !== 0) {
        this.position--;
        this.stack[this.position].undo()
    }
};
UndoService.prototype.redo = function () {
    if (this.stack.length !== 0 && this.position < this.stack.length) {
        this.stack[this.position].redo();
        this.position++
    }
};
UndoService.prototype.toString = function () {
    for (var a = "", b = 0; b < this.stack.length; b++) a += this.stack[b].toString();
    return a
};
var TextReader = function (a) {
        this.textBuffer = a;
        this.textPosition = new TextPosition(0, 0);
        this.save()
    };
TextReader.prototype.peek = function () {
    if (this.textPosition.line < this.textBuffer.lines.length) {
        var a = this.textBuffer.lines[this.textPosition.line];
        return this.textPosition.column >= a.length ? "\n" : a[this.textPosition.column]
    }
    return -1
};
TextReader.prototype.read = function () {
    if (this.textPosition.line < this.textBuffer.lines.length) {
        var a = this.textBuffer.lines[this.textPosition.line],
            b = this.textPosition.column >= a.length ? "\n" : a[this.textPosition.column];
        this.textPosition.column++;
        if (this.textPosition.column > a.length) {
            this.textPosition.column = 0;
            this.textPosition.line++
        }
        return b
    }
    return -1
};
TextReader.prototype.match = function (a) {
    for (var b = this.textPosition.line, c = this.textPosition.column, d = 0; d < a.length;) {
        var e = this.read();
        if (e === -1 || e !== a[d]) {
            this.textPosition.line = b;
            this.textPosition.column = c;
            return false
        }
        d++
    }
    return true
};
TextReader.prototype.skipWhitespaces = function () {
    for (var a, b = false;
    (a = this.peek()) != -1 && this.isWhitespace(a);) {
        this.read();
        b = true
    }
    return b
};
TextReader.prototype.isWhitespace = function (a) {
    return a === " " || a === "\t" || a === "\u00a0"
};
TextReader.prototype.skipLineTerminators = function (a) {
    for (var b = false;
    (a = this.peek()) != -1;) if (a === "\n") {
        this.read();
        this.peek() === "\r" && this.read();
        b = true
    } else if (a === "\r" || a === "\u2028" || a === "\u2029") {
        this.read();
        b = true
    } else break;
    return b
};
TextReader.prototype.save = function () {
    this.lastLine = this.textPosition.line;
    this.lastColumn = this.textPosition.column
};
TextReader.prototype.restore = function () {
    this.textPosition = new TextPosition(this.lastLine, this.lastColumn)
};
var LanguageService = function (a) {
        this.textEditor = a;
        this.language = null;
        this.syntaxTable = []
    };
LanguageService.prototype.setLanguage = function (a) {
    this.language = a
};
LanguageService.prototype.getSyntax = function (a) {
    return this.syntaxTable[a] ? this.syntaxTable[a] : []
};
LanguageService.prototype.add = function (a) {
    if (this.language !== null) {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
            delete this.timeout
        }
        var b = null;
        this.column = this.line = 0;
        if (this.syntaxTable.length > 0) {
            for (var c = a.oldRange.start.line, d = 0; this.syntaxTable[c] && d < this.syntaxTable[c].length && a.oldRange.start.column > this.syntaxTable[c][d].start;) d++;
            for (; c >= 0 && d >= 0;) {
                d--;
                if (d < 0) {
                    c--;
                    d = this.syntaxTable[c] ? this.syntaxTable[c].length - 1 : 0
                }
                if (this.syntaxTable[c] && this.syntaxTable[c][d] && this.syntaxTable[c][d].state !== null) {
                    b = this.syntaxTable[c][d].state;
                    this.line = c;
                    this.column = this.syntaxTable[c][d].start;
                    break
                }
            }
        }
        this.moveRange(new TextPosition(a.oldRange.end), new TextPosition(a.newRange.end));
        a.text.length > 0 && this.clearRange(a.newRange.start, a.newRange.end);
        for (this.index = 0; this.syntaxTable[this.line] && this.index < this.syntaxTable[this.line].length && this.column > this.syntaxTable[this.line][this.index].start;) this.index++;
        this.textReader = new TextReader(this.textEditor.textBuffer);
        this.textReader.textPosition = new TextPosition(this.line, this.column);
        this.language.begin(this.textReader, b);
        this.style = "text";
        this.window_setTimeout()
    }
};
LanguageService.prototype.window_setTimeout = function () {
    for (var a = (new Date).getTime() + 20, b = new TextPosition(this.line, this.column), c = this.textReader.textPosition.line, d = this.textReader.textPosition.column; this.textReader.peek() !== -1;) {
        var e = this.language.read(),
            g = this.textReader.peek();
        if (g === -1 || e.style !== null || e.state !== null) {
            if (g === -1 || e.style !== this.style || e.state !== this.state || e.state !== null) {
                if (g === -1 || c !== this.line || d !== this.column || e.state !== null) {
                    this.addRecord(this.column, c, this.style, this.state);
                    this.column = d
                }
                this.style = e.style;
                this.state = e.state
            }
            c = this.textReader.textPosition.line;
            d = this.textReader.textPosition.column
        }
        if ((new Date).getTime() > a) break
    }
    if (this.textReader.peek() !== -1) this.timeout = window.setTimeout(this.window_setTimeout.bind(this), 100);
    else this.addRecord(this.column, this.line, this.style, null);
    this.textEditor.invalidateRange(new TextRange(b, new TextPosition(this.line, this.column)));
    this.textEditor.update()
};
LanguageService.prototype.moveRange = function (a, b) {
    if (a.compareTo(b) < 0) {
        for (var c = 0; this.syntaxTable[a.line] && c < this.syntaxTable[a.line].length && a.column > this.syntaxTable[a.line][c].start;) c++;
        if (this.syntaxTable[a.line]) {
            for (var d = this.syntaxTable[a.line].splice(c, this.syntaxTable[a.line].length - c), e = 0; e < d.length; e++) d[e].start += b.column - a.column;
            var g = b.line - a.line;
            if (g > 0) {
                var f = Array(g);
                for (e = 0; e < g; e++) f[e] = c > 0 ? [{
                    style: this.syntaxTable[a.line][c - 1].style,
                    state: null,
                    start: 0
                }] : [];
                c = this.syntaxTable.splice(a.line + 1, this.syntaxTable.length - a.line + 1);
                this.syntaxTable = this.syntaxTable.concat(f, c)
            }
            this.syntaxTable[b.line] = this.syntaxTable[b.line].concat(d)
        }
    } else if (a.compareTo(b) > 0) {
        c = 0;
        if (a.line >= this.syntaxTable.length) {
            a.line = this.syntaxTable.length - 1;
            c = this.syntaxTable[a.line].length - 1
        } else for (; this.syntaxTable[a.line] && c < this.syntaxTable[a.line].length && a.column > this.syntaxTable[a.line][c].start;) c++;
        if (this.syntaxTable[a.line]) {
            d = this.syntaxTable[a.line].splice(c, this.syntaxTable[a.line].length - c);
            for (e = 0; e < d.length; e++) d[e].start -= a.column - b.column;
            for (c = 0; this.syntaxTable[b.line] && c < this.syntaxTable[b.line].length && b.column > this.syntaxTable[b.line][c].start;) c++;
            this.syntaxTable.splice(b.line + 1, a.line - b.line);
            this.syntaxTable[b.line].splice(c, this.syntaxTable[b.line].length - c);
            this.syntaxTable[b.line] = this.syntaxTable[b.line].concat(d)
        }
    }
};
LanguageService.prototype.clearRange = function (a, b) {
    if (a.line === b.line) {
        var c = this.syntaxTable[a.line];
        if (c) for (var d = -1, e = 0; e < c.length; e++) {
            if (d === -1 && a.column >= c[e].start) d = e;
            if (d !== -1 && b.column >= c[e].start) {
                this.syntaxTable[a.line].splice(d, e - d);
                break
            }
        }
    } else {
        if (this.syntaxTable[a.line]) for (e = this.syntaxTable[a.line].length - 1; e >= 0; e--) this.syntaxTable[a.line][e].start > a.column && this.syntaxTable[a.line].splice(e, 1);
        for (e = a.line + 1; e < b.line; e++) this.syntaxTable[e] = [];
        if (this.syntaxTable[b.line]) for (e = this.syntaxTable[b.line].length - 1; e >= 0; e--) this.syntaxTable[b.line][e].start < b.column && this.syntaxTable[b.line].splice(e, 1)
    }
};
LanguageService.prototype.addRecord = function (a, b, c, d) {
    this.syntaxTable[this.line] = this.syntaxTable[this.line] || [];
    if (this.index > 0 && this.index - 1 < this.syntaxTable[this.line].length && this.syntaxTable[this.line][this.index - 1].start === this.column) {
        var e = this.syntaxTable[this.line][this.index - 1];
        e.style = c;
        if (d !== null) e.state = d
    } else {
        if (this.index < this.syntaxTable[this.line].length) {
            e = this.syntaxTable[this.line][this.index];
            if (a >= e.start) {
                e.start = a;
                e.style = c;
                e.state = d
            } else this.syntaxTable[this.line].splice(this.index, 0, {
                style: c,
                state: d,
                start: a
            })
        } else this.syntaxTable[this.line].push({
            style: c,
            state: d,
            start: a
        });
        this.index++
    }
    for (; this.line < b;) {
        this.syntaxTable[this.line].splice(this.index, this.syntaxTable[this.line].length - this.index);
        this.line++;
        this.index = 0;
        this.addRecord(0, this.line, c, null)
    }
};
LanguageService.prototype.log = function () {
    for (var a = 0; a < this.syntaxTable.length; a++) {
        var b = "line " + a + ": ";
        if (this.syntaxTable[a]) {
            b += "[ ";
            for (var c = 0; c < this.syntaxTable[a].length; c++) b += this.syntaxTable[a][c].start + this.syntaxTable[a][c].style[0] + (this.syntaxTable[a][c].state !== null ? "X" : "-") + " ";
            b += " ]"
        }
        console.log(b)
    }
    return "-"
};
var TextBuffer = function () {
        this.lines = [""];
        this.textChanging = new Event;
        this.textChanged = new Event
    };
TextBuffer.prototype.setText = function (a, b) {
    var c = b.split("\n"),
        d = c.length - 1,
        e = new TextRange(new TextPosition(a.start), new TextPosition(a.start.line + d, (c.length === 1 ? a.start.column : 0) + c[d].length));
    c[0] = this.lines[a.start.line].substring(0, a.start.column) + c[0];
    c[d] += this.lines[a.end.line].substring(a.end.column);
    this.textChanging.raise(this, {
        oldRange: a,
        newRange: e,
        text: b
    });
    this.lines = this.lines.slice(0, a.start.line).concat(c, this.lines.slice(a.end.line + 1));
    this.textChanged.raise(this, {
        oldRange: a,
        newRange: e,
        text: b
    });
    return e
};
TextBuffer.prototype.getText = function (a) {
    if (a.start.line !== a.end.line) {
        var b = [];
        b.push(this.lines[a.start.line].substring(a.start.column));
        b = b.concat(this.lines.slice(a.start.line + 1, a.end.line));
        b.push(this.lines[a.end.line].substring(0, a.end.column));
        return b.join("\n")
    }
    return this.lines[a.start.line].substring(a.start.column, a.end.column)
};
TextBuffer.prototype.getTextRange = function () {
    return new TextRange(new TextPosition(0, 0), new TextPosition(this.lines.length - 1, this.lines[this.lines.length - 1].length))
};
TextBuffer.prototype.getLines = function () {
    return this.lines.length
};
TextBuffer.prototype.getColumns = function (a) {
    return this.lines[a].length
};
TextBuffer.prototype.getLine = function (a) {
    return this.lines[a]
};
var TextModel = function (a, b) {
        this.textBuffer = b;
        this.textRange = new TextRange(new TextPosition(0, 0), new TextPosition(0, 0));
        this.undoService = a;
        this.selectionChanged = new Event;
        this.blinkTimer = null;
        this.blinkState = true
    };
TextModel.prototype.select = function (a) {
    if (!a.equals(this.textRange.start) || !a.equals(this.textRange.end)) {
        var b = this.textRange;
        this.textRange = new TextRange(new TextPosition(a.line, a.column), new TextPosition(a.line, a.column));
        this.selectionChanged.raise(this, {
            oldRange: b,
            newRange: this.textRange
        })
    }
};
TextModel.prototype.selectRange = function (a) {
    if (!a.start.equals(this.textRange.start) || !a.end.equals(this.textRange.end)) {
        var b = this.textRange;
        this.textRange = a;
        this.selectionChanged.raise(this, {
            oldRange: b,
            newRange: this.textRange
        })
    }
};
TextModel.prototype.moveCursor = function (a, b, c, d) {
    var e, g, f = this.textRange.end;
    if (!d) {
        f = c === "previous" ? this.getTextRange().start : this.getTextRange().end;
        if (a === "line") f.column = c === "previous" ? this.textRange.start.column : this.textRange.end.column
    }
    f = this.toBufferPosition(f);
    if (a === "column") if (d || this.isCursor()) {
        if (b === "boundary") if (c !== "previous") f.column = this.textBuffer.getColumns(f.line);
        else {
            g = this.textBuffer.getLine(f.line);
            for (e = 0; e < g.length; e++) if (g[e] !== " " && g[e] !== "\t") {
                f.column = e === f.column ? 0 : e;
                break
            }
        } else if (b === "word") {
            g = this.textBuffer.getLine(f.line);
            if (c !== "previous" && f.column >= g.length) f.column++;
            else if (c === "previous" && f.column === 0) f.column--;
            else f.column = this.findWordBreak(g, f.column, c == "previous" ? -1 : +1)
        } else f.column += c === "previous" ? -b : +b;
        if (f.column < 0) {
            f.line--;
            if (f.line < 0) {
                f.line = 0;
                f.column = 0
            } else f.column = this.textBuffer.getColumns(f.line)
        }
        if (f.column > this.textBuffer.getColumns(f.line)) {
            f.line++;
            f.column = 0;
            if (f.line >= this.textBuffer.getLines()) {
                f.line = this.textBuffer.getLines() - 1;
                f.column = this.textBuffer.getColumns(f.line)
            }
        }
    }
    if (a === "line") {
        if (b !== "boundrary") f.line += c === "previous" ? -b : +b;
        if (f.line < 0) {
            f.line = 0;
            f.column = 0
        } else if (f.line > this.textBuffer.getLines() - 1) {
            f.line = this.textBuffer.getLines() - 1;
            f.column = this.textBuffer.getColumns(f.line)
        }
    }
    f = this.toScreenPosition(f);
    a = d ? new TextRange(new TextPosition(this.textRange.start.line, this.textRange.start.column), f) : new TextRange(f, f);
    this.undoService.begin();
    this.undoService.add(new SelectionUndoUnit(this, a));
    this.undoService.commit()
};
TextModel.prototype.insertText = function (a) {
    this.undoService.begin();
    this.undoService.add(new TextUndoUnit(this, this.textBuffer, this.toBufferRange(this.getTextRange()), a));
    this.undoService.commit()
};
TextModel.prototype.deleteSelection = function (a) {
    if (!this.isCursor() || a === null) this.insertText("");
    else {
        var b = this.toBufferRange(this.getTextRange());
        if (a === "previous") {
            b.start.column--;
            if (b.start.column < 0) {
                b.start.line--;
                if (b.start.line < 0) {
                    b.start.line = 0;
                    b.start.column = 0
                } else b.start.column = this.textBuffer.getColumns(b.start.line)
            }
        } else if (a === "next") {
            b.end.column++;
            if (b.end.column > this.textBuffer.getColumns(b.end.line)) {
                b.end.line++;
                if (b.end.line > this.textBuffer.getLines() - 1) {
                    b.end.line = this.textBuffer.getLines() - 1;
                    b.end.column = this.textBuffer.getColumns(b.end.line)
                } else b.end.column = 0
            }
        }
        this.undoService.begin();
        this.undoService.add(new TextUndoUnit(this, this.textBuffer, b, ""));
        this.undoService.commit()
    }
};
TextModel.prototype.getTextRange = function () {
    if (this.isCursor()) {
        var a = this.textRange.start.line,
            b = this.textRange.start.column;
        if (a >= this.textBuffer.getLines()) {
            a = this.textBuffer.getLines() - 1;
            b = this.getColumns(a)
        } else if (b > this.getColumns(a)) b = this.getColumns(a);
        return new TextRange(new TextPosition(a, b), new TextPosition(a, b))
    }
    a = new TextRange(this.textRange);
    if (a.start.line >= this.textBuffer.getLines()) {
        a.start.line = this.textBuffer.getLines() - 1;
        a.start.column = this.getColumns(a.start.line)
    }
    if (a.end.line >= this.textBuffer.getLines()) {
        a.end.line = this.textBuffer.getLines() - 1;
        a.end.column = this.getColumns(a.end.line)
    }
    if (a.start.column > this.getColumns(a.start.line)) a.start = new TextPosition(a.start.line, this.getColumns(a.start.line));
    if (a.end.column > this.getColumns(a.end.line)) a.end = new TextPosition(a.end.line, this.getColumns(a.end.line));
    return a.normalize()
};
TextModel.prototype.isCursor = function () {
    return this.textRange.isEmpty()
};
TextModel.prototype.setTabSize = function (a) {
    this.tabSize = a;
    this.tabText = "";
    for (a = 0; a < this.tabSize; a++) this.tabText += " "
};
TextModel.prototype.getColumns = function (a) {
    return this.getTabLength(this.textBuffer.getLine(a))
};
TextModel.prototype.getTabLength = function (a) {
    for (var b = 0, c = a.length, d = 0; d < c; d++) b += a[d] === "\t" ? this.tabSize : 1;
    return b
};
TextModel.prototype.toScreenPosition = function (a) {
    var b = this.textBuffer.getLine(a.line).substring(0, a.column);
    b = this.getTabLength(b) - b.length;
    return new TextPosition(a.line, a.column + b)
};
TextModel.prototype.toBufferPosition = function (a) {
    for (var b = this.textBuffer.getLine(a.line), c = 0, d = 0; d < b.length; d++) {
        c += b[d] === "\t" ? this.tabSize : 1;
        if (c > a.column) return new TextPosition(a.line, d)
    }
    return new TextPosition(a.line, b.length)
};
TextModel.prototype.toScreenRange = function (a) {
    return new TextRange(this.toScreenPosition(a.start), this.toScreenPosition(a.end))
};
TextModel.prototype.toBufferRange = function (a) {
    return new TextRange(this.toBufferPosition(a.start), this.toBufferPosition(a.end))
};
TextModel.prototype.getIndent = function () {
    var a = this.getTextRange();
    if (a.isEmpty()) {
        for (var b = this.textBuffer.getLine(a.end.line), c = 0; c < b.length && (b[c] == "\t" || b[c] == " ");) c++;
        b = b.substring(0, c);
        if (a.end.column >= this.getTabLength(b)) return b
    }
    return ""
};
TextModel.prototype.findWordBreak = function (a, b, c) {
    if (c < 0) b += c;
    var d = this.isWordSeparator(a[b]);
    for (b = b; b >= 0 && b < a.length; b += c) if (this.isWordSeparator(a[b]) != d) return c < 0 ? b -= c : b;
    return c < 0 ? 0 : a.length
};
TextModel.prototype.isWordSeparator = function (a) {
    return " \t'\",;.!~@#$%^&*?=<>()[]:\\+-".indexOf(a) !== -1
};
var TextController = function (a) {
        this.textEditor = a;
        this.isWebKit = typeof navigator.userAgent.split("WebKit/")[1] !== "undefined";
        this.isChrome = navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
        this.isMozilla = navigator.appVersion.indexOf("Gecko/") >= 0 || navigator.userAgent.indexOf("Gecko") >= 0 && !this.isWebKit && typeof navigator.appVersion !== "undefined";
        this.isMac = /Mac/.test(navigator.userAgent);
        this.textArea = document.createElement("textarea");
        this.textArea.style.position = "absolute";
        this.textArea.style.top = 0;
        this.textArea.style.left = 0;
        this.textArea.style.width = 0;
        this.textArea.style.height = 0;
        this.textArea.style.zIndex = -99999;
        this.textArea.style.margin = 0;
        this.textArea.style.border = 0;
        this.textArea.style.padding = "1px";
        this.textArea.style.resize = "none";
        this.textArea.style.outline = "none";
        this.textArea.style.overflow = "hidden";
        //this.textArea.style.background = "none";
        this.textArea.value = ".";
        document.body.appendChild(this.textArea);
        this.updateTextAreaPosition();
        this.canvas_mouseDownHandler = this.canvas_mouseDown.bind(this);
        this.canvas_mouseWheelHandler = this.canvas_mouseWheel.bind(this);
        this.canvas_touchStartHandler = this.canvas_touchStart.bind(this);
        this.canvas_focusHandler = this.canvas_focus.bind(this);
        this.window_mouseUpHandler = this.window_mouseUp.bind(this);
        this.window_mouseMoveHandler = this.window_mouseMove.bind(this);
        this.canvas_touchEndHandler = this.canvas_touchEnd.bind(this);
        this.canvas_touchMoveHandler = this.canvas_touchMove.bind(this);
        this.textArea_keyUpHandler = this.textArea_keyUp.bind(this);
        this.textArea_keyDownHandler = this.textArea_keyDown.bind(this);
        this.textArea_keyPressHandler = this.textArea_keyPress.bind(this);
        this.textArea_focusHandler = this.textArea_focus.bind(this);
        this.textArea_blurHandler = this.textArea_blur.bind(this);
        this.textArea_cutHandler = this.textArea_cut.bind(this);
        this.textArea_copyHandler = this.textArea_copy.bind(this);
        this.textArea_pasteHandler = this.textArea_paste.bind(this);
        this.textArea_beforeCutHandler = this.textArea_beforeCut.bind(this);
        this.textArea_beforeCopyHandler = this.textArea_beforeCopy.bind(this);
        this.textEditor.canvas.addEventListener("focus", this.canvas_focusHandler, false);
        this.textEditor.canvas.addEventListener("onmousewheel" in this.textEditor.canvas ? "mousewheel" : "DOMMouseScroll", this.canvas_mouseWheelHandler, false);
        this.textEditor.canvas.addEventListener("touchstart", this.canvas_touchStartHandler, false);
        this.textEditor.canvas.addEventListener("touchmove", this.canvas_touchMoveHandler, false);
        this.textEditor.canvas.addEventListener("touchend", this.canvas_touchEndHandler, false);
        this.textEditor.canvas.addEventListener("mousedown", this.canvas_mouseDownHandler, false);
        window.addEventListener("mousemove", this.window_mouseMoveHandler, false);
        window.addEventListener("mouseup", this.window_mouseUpHandler, false);
        this.textArea.addEventListener("focus", this.textArea_focusHandler, false);
        this.textArea.addEventListener("blur", this.textArea_blurHandler, false);
        this.textArea.addEventListener("cut", this.textArea_cutHandler, false);
        this.textArea.addEventListener("copy", this.textArea_copyHandler, false);
        this.textArea.addEventListener("paste", this.textArea_pasteHandler, false);
        this.textArea.addEventListener("beforecut", this.textArea_beforeCutHandler, false);
        this.textArea.addEventListener("beforecopy", this.textArea_beforeCopyHandler, false);
        this.textArea.addEventListener("keydown", this.textArea_keyDownHandler, false);
        this.textArea.addEventListener("keypress", this.textArea_keyPressHandler, false);
        this.textArea.addEventListener("keyup", this.textArea_keyUpHandler, false)
    };
TextController.prototype.dispose = function () {
    window.removeEventListener("mousemove", this.window_mouseMoveHandler);
    window.removeEventListener("mouseup", this.window_mouseUpHandler);
    this.textEditor.canvas.removeEventListener("mousedown", this.canvas_mouseDownHandler);
    this.textEditor.canvas.removeEventListener("touchend", this.canvas_touchEndHandler);
    this.textEditor.canvas.removeEventListener("touchmove", this.canvas_touchMoveHandler);
    this.textEditor.canvas.removeEventListener("touchstart", canvas_this.touchStartHandler);
    this.textEditor.canvas.removeEventListener("focus", this.canvas_focusHandler);
    this.textEditor.canvas.removeEventListener("onmousewheel" in this.textEditor.canvas ? "mousewheel" : "DOMMouseScroll", this.canvas_mouseWheelHandler, false);
    this.textArea.removeEventListener("focus", this.textArea_focusHandler);
    this.textArea.removeEventListener("blur", this.textArea_blurHandler);
    this.textArea.removeEventListener("cut", this.textArea_cutHandler);
    this.textArea.removeEventListener("copy", this.textArea_copyHandler);
    this.textArea.removeEventListener("paste", this.textArea_pasteHandler);
    this.textArea.removeEventListener("beforecut", this.textArea_beforeCutHandler);
    this.textArea.removeEventListener("beforecopy", this.textArea_beforeCopyHandler);
    this.textArea.removeEventListener("keypress", this.textArea_keyPressHandler);
    this.textArea.removeEventListener("keyup", this.textArea_keyUpHandler);
    this.textArea.removeEventListener("keydown", this.textArea_keyDownHandler)
};
TextController.prototype.isFocused = function () {
    return /(^|\s+)focus(\s+|$)/.test(this.textEditor.canvas.className)
};
TextController.prototype.textArea_cut = function () {
    this.textEditor.cut()
};
TextController.prototype.textArea_copy = function () {
    this.textEditor.copy()
};
TextController.prototype.textArea_paste = function (a) {
    if (this.isMozilla) {
        this.textArea.value = "";
        window.setTimeout(function () {
            var b = this.textArea.value;
            b.length > 0 && this.textEditor.paste(b)
        }.bind(this), 1)
    } else if (this.isWebKit) {
        this.textEditor.paste(a.clipboardData.getData("text/plain"));
        this.stopEvent(a)
    }
};
TextController.prototype.textArea_beforeCut = function () {
    this.textEditor.copy()
};
TextController.prototype.textArea_beforeCopy = function () {
    this.textEditor.copy()
};
TextController.prototype.textArea_focus = function () {
    this.isFocused() || (this.textEditor.canvas.className += " focus");
    this.textArea.select();
    this.textEditor.invalidate();
    this.textEditor.update()
};
TextController.prototype.textArea_blur = function () {
    if (this.isFocused()) this.textEditor.canvas.className = this.textEditor.canvas.className.replace(/ focus\b/, "");
    this.textEditor.invalidate()
};
TextController.prototype.canvas_focus = function () {
    this.textEditor.focus()
};
TextController.prototype.canvas_mouseDown = function (a) {
    this.textEditor.focus();
    this.stopEvent(a);
    this.updatePointerPosition(a.pageX, a.pageY);
    var b = this.getTextPosition(),
        c = (a.detail - 1) % 3 + 1;
    if (c === 1) {
        a.shiftKey ? this.textEditor.selectTo(b.line, b.column) : this.pointerDown();
        this.mouseCapture = true;
        this.startScrollTimer()
    } else if (c === 2) {
        this.textEditor.selectWord(b.line, b.column);
        this.mouseCapture = true;
        this.startScrollTimer()
    } else c === 3 && this.textEditor.selectRange(b.line, 0, b.line + 1, 0);
    this.updateMouseCursor()
};
TextController.prototype.window_mouseUp = function (a) {
    a.preventDefault();
    this.updatePointerPosition(a.pageX, a.pageY);
    this.pointerUp()
};
TextController.prototype.window_mouseMove = function (a) {
    a.preventDefault();
    this.updatePointerPosition(a.pageX, a.pageY);
    this.pointerMove()
};
TextController.prototype.canvas_mouseWheel = function (a) {
    a.preventDefault();
    var b = a.wheelDelta ? this.isChrome ? -a.wheelDelta * 1E3 : -a.wheelDelta : a.detail ? a.detail * 1E3 : 0;
    a.axis && a.axis === 1 || a.wheelDeltaX && a.wheelDeltaX === -b || a.shiftKey ? this.textEditor.scroll(0, Math.floor(b / 1E3)) : this.textEditor.scroll(Math.floor(b / 1E3), 0);
    this.textEditor.update()
};
TextController.prototype.canvas_touchStart = function (a) {
    this.textEditor.focus();
    if (a.touches.length === 1) {
        a.preventDefault();
        this.updatePointerPosition(a.touches[0].pageX, a.touches[0].pageY);
        this.pointerDown()
    }
};
TextController.prototype.canvas_touchMove = function (a) {
    if (a.touches.length === 1) {
        a.preventDefault();
        this.updatePointerPosition(a.touches[0].pageX, a.touches[0].pageY);
        this.pointerMove()
    }
};
TextController.prototype.canvas_touchEnd = function (a) {
    a.preventDefault();
    this.pointerUp()
};
TextController.prototype.textArea_keyUp = function (a) {
    a.preventDefault()
};
TextController.prototype.textArea_keyDown = function (a) {
    if (!this.isMozilla) if (this.processKey(a.keyCode, a.shiftKey, a.ctrlKey, a.altKey, a.metaKey)) {
        this.textEditor.update();
        this.stopEvent(a)
    }
};
TextController.prototype.textArea_keyPress = function (a) {
    var b;
    if (this.isMozilla) {
        if (!this.keyCodeTable) {
            this.keyCodeTable = [];
            var c = {
                32: " ",
                48: "0",
                49: "1",
                50: "2",
                51: "3",
                52: "4",
                53: "5",
                54: "6",
                55: "7",
                56: "8",
                57: "9",
                59: ";",
                61: "=",
                65: "a",
                66: "b",
                67: "c",
                68: "d",
                69: "e",
                70: "f",
                71: "g",
                72: "h",
                73: "i",
                74: "j",
                75: "k",
                76: "l",
                77: "m",
                78: "n",
                79: "o",
                80: "p",
                81: "q",
                82: "r",
                83: "s",
                84: "t",
                85: "u",
                86: "v",
                87: "w",
                88: "x",
                89: "y",
                90: "z",
                107: "+",
                109: "-",
                110: ".",
                188: ",",
                190: ".",
                191: "/",
                192: "`",
                219: "[",
                220: "\\",
                221: "]",
                222: '"'
            };
            for (b in c) {
                var d = c[b];
                this.keyCodeTable[d.charCodeAt(0)] = parseInt(b);
                if (d.toUpperCase() != d) this.keyCodeTable[d.toUpperCase().charCodeAt(0)] = parseInt(b)
            }
        }
        b = a.charCode !== 0 && this.keyCodeTable[a.charCode] ? this.keyCodeTable[a.charCode] : a.keyCode;
        if (this.processKey(b, a.shiftKey, a.ctrlKey, a.altKey, a.metaKey)) {
            this.textEditor.update();
            this.stopEvent(a);
            return
        }
    }
    if (!a.ctrlKey && !a.altKey && !a.metaKey && a.charCode !== 0) {
        this.stopEvent(a);
        this.textEditor.insertText(String.fromCharCode(a.charCode));
        this.textEditor.updateScrollPosition();
        this.textEditor.update()
    }
};
TextController.prototype.mouseScroll = function () {
    var a = this.getTextPosition();
    this.textEditor.selectTo(a.line, a.column);
    this.textEditor.updateScrollPosition();
    this.textEditor.update()
};
TextController.prototype.mouseScroll_interval = function () {
    var a = this.getTextCoordinate(),
        b = this.textEditor.getSize();
    if (a.line < 0 || a.line >= b.line || a.column < 0 || a.column >= b.column) this.mouseScroll()
};
TextController.prototype.pointerDown = function () {
    var a = this.getTextPosition();
    this.textEditor.select(a.line, a.column)
};
TextController.prototype.pointerMove = function () {
    this.mouseCapture && this.mouseScroll();
    this.updateMouseCursor()
};
TextController.prototype.pointerUp = function () {
    this.mouseCapture = false;
    this.stopScrollTimer();
    this.updateMouseCursor()
};
TextController.prototype.startScrollTimer = function () {
    this.stopScrollTimer();
    this.scrollTimer = window.setInterval(this.mouseScroll_interval.bind(this), 75)
};
TextController.prototype.stopScrollTimer = function () {
    if (this.scrollTimer !== null) {
        window.clearInterval(this.scrollTimer);
        this.scrollTimer = null
    }
};
TextController.prototype.stopEvent = function (a) {
    a.preventDefault();
    a.stopPropagation()
};
TextController.prototype.updateMouseCursor = function () {
    this.textEditor.canvas.style.cursor = "text"
};
TextController.prototype.updateTextAreaPosition = function () {
    for (var a = new Point(0, 0), b = this.textEditor.canvas; b !== null;) {
        a.x += b.offsetLeft;
        a.y += b.offsetTop;
        b = b.offsetParent
    }
    this.textArea.style.top = a.y + "px";
    this.textArea.style.left = a.x + "px"
};
TextController.prototype.updatePointerPosition = function (a, b) {
    this.pointerPosition = new Point(a, b);
    for (var c = this.textEditor.canvas; c !== null;) {
        this.pointerPosition.x -= c.offsetLeft;
        this.pointerPosition.y -= c.offsetTop;
        c = c.offsetParent
    }
};
TextController.prototype.getTextCoordinate = function () {
    var a = this.pointerPosition.x + this.textEditor.getFontSize().width / 2;
    return this.textEditor.getTextPosition(new Point(a, this.pointerPosition.y))
};
TextController.prototype.getTextPosition = function () {
    var a = this.getTextCoordinate();
    a.line += this.textEditor.scrollPosition.line;
    a.column += this.textEditor.scrollPosition.column;
    return a
};
TextController.prototype.processKey = function (a, b, c, d, e) {
    if (this.isMac) if (c && !b && !d && !e) if (a === 65) {
        c = false;
        a = 36
    } else {
        if (a === 69) {
            c = false;
            a = 35
        }
    } else if (e && a === 37) {
        e = false;
        a = 36
    } else if (e && a === 39) {
        e = false;
        a = 35
    }
    return this.textEditor.processKey(a, b, c, d, e)
};
var TextEditor = function (a) {
        this.canvas = a;
        this.context = this.canvas.getContext("2d");
        this.undoService = new UndoService;
        this.textChanging = new Event;
        this.textChanged = new Event;
        this.selectionChanged = new Event;
        this.textBuffer = new TextBuffer;
        this.textBuffer.textChanging.add(this.textBuffer_textChanging, this);
        this.textBuffer.textChanged.add(this.textBuffer_textChanged, this);
        this.textModel = new TextModel(this.undoService, this.textBuffer);
        this.textModel.selectionChanged.add(this.textModel_selectionChanged, this);
        this.textModel.setTabSize(4);
        this.scrollPosition = new TextPosition(0, 0);
        this.textController = new TextController(this);
        this.languageService = new LanguageService(this);
        this.invalidRectangles = [];
        this.maxColumns = -1;
        this.theme = {
            "font-family": "Monaco,Lucida Console,Courier New",
            "font-size": "12",
            "padding-left": "4",
            "padding-top": "4",
            // "background-color": "#ffffff",
            // "background-blur-color": "#ffffff",
            // "selection-color": "#c0ddf6",
            // "selection-blur-color": "#e3f1fe",
            "cursor-color": "#000000",
            "cursor-background-color": "#ededed",
            "text-style": "#000000",
            "punctuation-style": "#666666",
            "comment-style": "#0068c5 italic",
            "keyword-style": "#662266 bold",
            "literal-style": "#005a15",
            "element-style": "#0000AA bold",
            "attribute-style": "#0000AA italic",
            "error-style": "#FF0000 bold",
            "declaration-style": "#000000 bold"
        };
        this.updateFont();
        this.invalidate();
        this.update();
        this.focus()
    };
TextEditor.prototype.dispose = function () {
    this.textController.dispose();
    this.textController = null;
    this.textModel.selectionChanged.remove(this.textModel_selectionChanged, this);
    this.textBuffer.textChanged.remove(this.textBuffer_textChanged, this);
    this.textChanged.dispose();
    this.textChanged = null;
    this.selectionChanged.dispose();
    this.selectionChanged = null
};
TextEditor.prototype.setTheme = function (a) {
    for (var b in a) {
        this.theme[b] = a[b];
        if (b === "font-family" || b === "font-size") this.updateFont()
    }
    this.invalidate();
    this.update()
};
TextEditor.prototype.setLanguage = function (a) {
    this.languageService.setLanguage(a)
};
TextEditor.prototype.setTabSize = function (a) {
    this.textModel.setTabSize(a);
    this.invalidate();
    this.update()
};
TextEditor.prototype.focus = function () {
    this.textController.textArea.focus()
};
TextEditor.prototype.setText = function (a) {
    this.undoService.begin();
    this.undoService.add(new TextUndoUnit(this.textModel, this.textBuffer, this.textBuffer.getTextRange(), a));
    this.undoService.add(new SelectionUndoUnit(this.textModel, new TextRange(new TextPosition(0, 0), new TextPosition(0, 0))));
    this.undoService.commit();
    this.undoService.clear();
    this.update()
};
TextEditor.prototype.getText = function () {
    return this.textBuffer.getText(this.textBuffer.getTextRange())
};
TextEditor.prototype.insertText = function (a) {
    this.textModel.insertText(a)
};
TextEditor.prototype.deleteSelection = function () {
    this.textModel.deleteSelection(null)
};
TextEditor.prototype.select = function (a, b) {
    if (a > this.textBuffer.getLines() - 1) {
        a = this.textBuffer.getLines() - 1;
        if (b > this.textBuffer.getColumns(a) - 1) b = this.textBuffer.getColumns(a) - 1
    }
    var c = new TextPosition(a, b),
        d = this.textModel.toScreenPosition(this.textModel.toBufferPosition(c));
    c = this.textModel.toScreenPosition(this.textModel.toBufferPosition(c));
    this.undoService.begin();
    this.undoService.add(new SelectionUndoUnit(this.textModel, new TextRange(d, c)));
    this.undoService.commit();
    this.updateScrollPosition();
    this.update()
};
TextEditor.prototype.selectRange = function (a, b, c, d) {
    this.undoService.begin();
    this.undoService.add(new SelectionUndoUnit(this.textModel, new TextRange(new TextPosition(a, b), new TextPosition(c, d))));
    this.undoService.commit();
    this.updateScrollPosition();
    this.update()
};
TextEditor.prototype.selectAll = function () {
    this.undoService.begin();
    this.undoService.add(new SelectionUndoUnit(this.textModel, this.textModel.toScreenRange(this.textBuffer.getTextRange())));
    this.undoService.commit();
    this.update()
};
TextEditor.prototype.selectTo = function (a, b) {
    var c = new TextPosition(a, b);
    if (c.line < 0) c.line = 0;
    if (c.line >= this.textBuffer.getLines()) c.line = this.textBuffer.getLines() - 1;
    if (c.column < 0) c.column = 0;
    c = this.textModel.toScreenPosition(this.textModel.toBufferPosition(c));
    if (!this.textModel.textRange.end.equals(c)) {
        this.undoService.begin();
        this.undoService.add(new SelectionUndoUnit(this.textModel, new TextRange(new TextPosition(this.textModel.textRange.start), c)));
        this.undoService.commit();
        this.updateScrollPosition();
        this.update()
    }
};
TextEditor.prototype.selectWord = function (a, b) {
    var c = this.textModel.toBufferPosition(new TextPosition(a, b)),
        d = this.textBuffer.getLine(c.line),
        e = this.textModel.findWordBreak(d, c.column + 1, -1);
    d = this.textModel.findWordBreak(d, c.column, 1);
    c = new TextRange(new TextPosition(c.line, e), new TextPosition(c.line, d));
    this.undoService.begin();
    this.undoService.add(new SelectionUndoUnit(this.textModel, this.textModel.toScreenRange(c)));
    this.undoService.commit();
    this.update()
};
TextEditor.prototype.scroll = function (a, b) {
    this.scrollPosition.line += a;
    this.scrollPosition.column += b;
    var c = this.getSize(),
        d = this.textBuffer.getLines() - c.line < 0 ? 0 : this.textBuffer.getLines() - c.line;
    c = this.getMaxColumns() - c.column + 1 < 0 ? 0 : this.getMaxColumns() - c.column + 1;
    if (this.scrollPosition.line < 0) this.scrollPosition.line = 0;
    if (this.scrollPosition.line > d) this.scrollPosition.line = d;
    if (this.scrollPosition.column < 0) this.scrollPosition.column = 0;
    if (this.scrollPosition.column > c) this.scrollPosition.column = c;
    this.invalidate()
};
TextEditor.prototype.undo = function () {
    this.undoService.undo();
    this.updateScrollPosition();
    this.update()
};
TextEditor.prototype.redo = function () {
    this.undoService.redo();
    this.updateScrollPosition();
    this.update()
};
TextEditor.prototype.cut = function () {
    this.copy();
    this.deleteSelection();
    this.updateScrollPosition();
    this.update()
};
TextEditor.prototype.copy = function () {
    var a = this.textModel.toBufferRange(this.textModel.getTextRange());
    if (!a.isEmpty()) {
        a = this.textBuffer.getText(a);
        if (window.clipboardData && window.clipboardData.getData) window.clipboardData.setData("Text", a);
        else if (this.textController.isMozilla || this.textController.isWebKit) {
            this.textController.textArea.value = a;
            this.textController.textArea.select()
        }
    }
};
TextEditor.prototype.paste = function (a) {
    if (a) {
        this.insertText(a);
        this.updateScrollPosition();
        this.update()
    }
};
TextEditor.prototype.processKey = function (a, b, c, d, e) {
    if ((c || e) && !d) if (a === 65) {
        this.selectAll();
        return true
    } else if (a === 88) {
        if (window.clipboardData && window.clipboardData.setData) {
            this.cut();
            return true
        }
    } else if (a === 67) {
        if (window.clipboardData && window.clipboardData.setData) {
            this.copy();
            return true
        }
    } else if (a === 86) {
        if (window.clipboardData && window.clipboardData.getData) {
            var g = window.clipboardData.getData("Text");
            if (g) {
                this.paste(g);
                return true
            }
        }
    } else if (a === 90 && !b) {
        this.undo();
        return true
    } else if (a === 90 && b || a === 89) {
        this.redo();
        return true
    }
    if (!e && !d) if (a === 37) {
        this.textModel.moveCursor("column", !c ? 1 : "word", "previous", b);
        this.updateScrollPosition();
        return true
    } else if (a === 39) {
        this.textModel.moveCursor("column", !c ? 1 : "word", "next", b);
        this.updateScrollPosition();
        return true
    } else if (a === 38) {
        if (c) this.scroll(-1, 0);
        else {
            this.textModel.moveCursor("line", 1, "previous", b);
            this.updateScrollPosition()
        }
        return true
    } else if (a === 40) {
        if (c) this.scroll(+1, 0);
        else {
            this.textModel.moveCursor("line", 1, "next", b);
            this.updateScrollPosition()
        }
        return true
    } else if (!c) if (a === 8) {
        this.textModel.deleteSelection("previous");
        this.updateScrollPosition();
        return true
    } else if (a === 9) {
        this.insertText("\t");
        this.updateScrollPosition();
        return true
    } else if (a === 13) {
        this.insertText("\n" + this.textModel.getIndent());
        this.updateScrollPosition();
        return true
    } else if (a === 45) {
        this.textModel.insertText(" ");
        this.updateScrollPosition();
        return true
    } else if (a === 46) {
        this.textModel.deleteSelection("next");
        this.updateScrollPosition();
        return true
    } else if (a === 32) {
        this.insertText(" ");
        this.updateScrollPosition();
        return true
    } else if (a === 33) {
        if (b) {
            this.textModel.moveCursor("line", this.getSize().line, "previous", b);
            this.updateScrollPosition()
        } else this.scroll(-this.getSize().line, 0);
        return true
    } else if (a === 34) {
        if (b) {
            this.textModel.moveCursor("line", this.getSize().line, "next", b);
            this.updateScrollPosition()
        } else this.scroll(+this.getSize().line, 0);
        return true
    } else if (a === 35) {
        this.textModel.moveCursor("column", "boundary", "next", b);
        this.updateScrollPosition();
        return true
    } else if (a === 36) {
        this.textModel.moveCursor("column", "boundary", "previous", b);
        this.updateScrollPosition();
        return true
    }
};
TextEditor.prototype.updateScrollPosition = function () {
    var a = this.getSize();
    a.line--;
    a.column--;
    var b = (new TextRange(this.textModel.textRange)).end;
    if (b.line > this.textBuffer.getLines() - 1) b.line = this.textBuffer.getLines() - 1;
    var c = this.textModel.toScreenPosition(new TextPosition(b.line, this.textBuffer.getColumns(b.line)));
    if (b.column > c.column - 1) b.column = c.column - 1;
    b.line -= this.scrollPosition.line;
    b.column -= this.scrollPosition.column;
    var d = c = 0;
    if (b.line < 0) c = b.line;
    else if (b.line > a.line) c = b.line - a.line;
    if (b.column < 5) {
        d = b.column - 5;
        if (this.scrollPosition.column + d < 0) d = -this.scrollPosition.column
    } else if (b.column > a.column - 5) {
        d = b.column - a.column + 5;
        b = this.getMaxColumns();
        if (this.scrollPosition.column + d + a.column > b + 1) d = b - a.column - this.scrollPosition.column + 1
    }
    if (d !== 0 || c !== 0) this.scroll(c, d)
};
TextEditor.prototype.updateFont = function () {
    this.context.font = this.theme["font-size"] + "px " + this.theme["font-family"];
    var a = this.context.measureText("XXXXXXXXXXXXXXXXXXXX").width / 20,
        b = Math.floor(parseFloat(this.theme["font-size"]) * 1.5);
    this.fontSize = new Size(a, b)
};
TextEditor.prototype.getFontSize = function () {
    return this.fontSize
};
TextEditor.prototype.getSize = function () {
    return this.getTextPosition(new Point(this.canvas.width, this.canvas.height))
};
TextEditor.prototype.getTextPosition = function (a) {
    var b = {
        left: parseFloat(this.theme["padding-left"]),
        top: parseFloat(this.theme["padding-top"])
    },
        c = this.getFontSize();
    return new TextPosition(Math.floor((a.y - b.top) / c.height), Math.floor((a.x - b.left) / c.width))
};
TextEditor.prototype.getMaxColumns = function () {
    if (this.maxColumns === -1) for (var a = 0; a < this.textBuffer.lines.length; a++) {
        var b = this.textModel.getColumns(a);
        if (this.maxColumns < b) this.maxColumns = b
    }
    return this.maxColumns
};
TextEditor.prototype.invalidate = function () {
    //this.invalidateRectangle(new Rectangle(0, 0, this.canvas.width, this.canvas.height))
};
TextEditor.prototype.invalidateSelection = function (a) {
    this.invalidateRange(a);
    var b = {
        left: parseFloat(this.theme["padding-left"]),
        top: parseFloat(this.theme["padding-top"])
    },
        c = this.getFontSize();
    //this.invalidateRectangle(new Rectangle(0, (a.end.line - this.scrollPosition.line) * c.height + b.top, this.canvas.width, c.height))
};
TextEditor.prototype.invalidateRange = function (a) {
    var b = this.getFontSize(),
        c = {
            left: parseFloat(this.theme["padding-left"]),
            top: parseFloat(this.theme["padding-top"])
        },
        d = a.normalize();
    d.start.line -= this.scrollPosition.line;
    d.end.line -= this.scrollPosition.line;
    d.start.column -= this.scrollPosition.column;
    d.end.column -= this.scrollPosition.column;
    var e = c.left;
    c = c.top + d.start.line * b.height;
    if (a.start.line === a.end.line) {
        e += d.start.column * b.width;
        width = (d.end.column - d.start.column) * b.width;
        this.invalidateRectangle(new Rectangle(e, c, width, b.height))
    } else this.invalidateRectangle(new Rectangle(e, c, this.canvas.width, (d.end.line - d.start.line + 1) * b.height))
};
TextEditor.prototype.invalidateRectangle = function (a) {
    if (a.x < 0) a.x = 0;
    if (a.y < 0) a.y = 0;
    if (a.x + a.width > this.canvas.width) a.width = this.canvas.width - a.x;
    if (a.y + a.height > this.canvas.height) a.height = this.canvas.height - a.y;
    this.invalidRectangles.push(a)
};
TextEditor.prototype.update = function () {
    if (this.invalidRectangles.length !== 0) {
        for (var a = this.invalidRectangles[0], b = 1; b < this.invalidRectangles.length; b++) a = a.union(this.invalidRectangles[b]);
        if (a.width !== 0 && a.height !== 0) {
            this.context.save();
            this.context.beginPath();
            this.context.rect(a.x, a.y, a.width, a.height);
            this.context.clip();
            var c = this.textController.isFocused();
            //this.context.fillStyle = c ? this.theme["background-color"] : this.theme["background-blur-color"];
            //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            a = this.getSize();
            var d = this.getFontSize(),
                e = {
                    left: parseFloat(this.theme["padding-left"]),
                    top: parseFloat(this.theme["padding-top"])
                };
            b = this.textModel.getTextRange();
            b.start.line -= this.scrollPosition.line;
            b.end.line -= this.scrollPosition.line;
            b.start.column -= this.scrollPosition.column;
            b.end.column -= this.scrollPosition.column;
            if (this.textModel.isCursor()) {
                //this.context.fillStyle = this.theme["cursor-background-color"];
                c = b.start.line * d.height + e.top;
                //this.context.fillRect(0, c, this.canvas.width, d.height);
                if (this.textModel.blinkState && this.textController.isFocused()) {
                    this.context.fillStyle = this.theme["cursor-color"];
                    //this.context.fillRect(e.left + b.start.column * d.width, c, 1, d.height)
                }
            } else {
                //this.context.fillStyle = c ? this.theme["selection-color"] : this.theme["selection-blur-color"];
                for (var g = c = 0; g < a.line; g++) {
                    var f = 0,
                        h = this.canvas.width;
                    if (g === b.start.line) f = b.start.column < 0 ? 0 : b.start.column * d.width;
                    if (g === b.end.line) h = b.end.column * d.width - f;
                    g >= b.start.line && g <= b.end.line && h > 0; //&& this.context.fillRect(f + e.left, c + e.top, h, d.height);
                    c += d.height
                }
            }
            f = {
                text: true
            };
            h = ["text"];
            var q = this.context.font;
            this.context.shadowOffsetX = 0;
            for (b = this.context.shadowOffsetY = 0; b < h.length; b++) {
                var r = h[b];
                c = this.theme[r + "-style"].split(" ");
                this.context.fillStyle = c[0];
                this.context.font = c.length === 2 && c[1] === "italic" ? "italic " + q : q;
                if (c.length === 2 && c[1] === "bold") {
                    this.context.shadowBlur = this.textController.isMozilla ? 0.5 : 1;
                    this.context.shadowColor = c[0]
                } else {
                    this.context.shadowBlur = 0;
                    this.context.shadowColor = "rgba(0,0,0,0)"
                }
                c = Math.floor(d.height * 0.8) + e.top;
                for (g = this.scrollPosition.line; g < this.scrollPosition.line + a.line; g++) {
                    if (g < this.textBuffer.getLines()) for (var l = this.textBuffer.getLine(g), m = this.languageService.getSyntax(g), j = 0, k = "text", n = 0, i = 0; i < l.length;) {
                        if (j < m.length) {
                            k = m[j].style;
                            if (b === 0 && !f.hasOwnProperty(k)) {
                                f[k] = true;
                                h.push(k)
                            }
                            j++
                        }
                        for (var s = j < m.length ? m[j].start - i : l.length - i, o = "", p = i; p < i + s; p++) o += l[p] !== "\t" ? l[p] : this.textModel.tabText;
                        r === k && n - this.scrollPosition.column + o.length > 0 && n - this.scrollPosition.column < a.column && this.context.fillText(o, (n - this.scrollPosition.column) * d.width + e.left, c);
                        i += s;
                        n += o.length
                    }
                    c += d.height
                }
            }
            this.context.restore()
        }
        this.invalidRectangles = [];
        this.textController.updateTextAreaPosition()
    }
};
TextEditor.prototype.textBuffer_textChanging = function (a, b) {
    var c = this.textModel.toScreenRange(b.oldRange.normalize());
    c.end.column = this.getSize().column + this.scrollPosition.column;
    if (c.start.line != c.end.line) c.end.line = this.getSize().line + this.scrollPosition.line;
    this.invalidateRange(c);
    this.textChanging.raise(this, b)
};
TextEditor.prototype.textBuffer_textChanged = function (a, b) {
    this.maxColumns = -1;
    var c = this.textModel.toScreenRange(b.newRange.normalize());
    c.end.column = this.getSize().column + this.scrollPosition.column;
    if (c.start.line != c.end.line) c.end.line = this.getSize().line + this.scrollPosition.line;
    this.invalidateRange(c);
    this.languageService.add(b);
    this.textChanged.raise(this, b)
};
TextEditor.prototype.textModel_selectionChanged = function (a, b) {
    this.invalidateSelection(b.oldRange);
    this.invalidateSelection(b.newRange);
    if (this.blinkTimer) {
        window.clearInterval(this.blinkTimer);
        delete this.blinkTimer;
        this.textModel.blinkState = true
    }
    var c = new TextRange(b.newRange);
    if (c.isEmpty) this.blinkTimer = window.setInterval(function () {
        this.invalidateSelection(c);
        this.update();
        this.textModel.blinkState = !this.textModel.blinkState
    }.bind(this), 600);
    this.selectionChanged.raise(this, b)
};