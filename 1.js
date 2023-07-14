$(document).ready(function() {
    setTimeout(function () {
        $(".loader-wrapper").fadeOut("slow");
    }, 3000);
});


const can = document.getElementById("C")
can.style.zIndex = -1
can.style.position = 'fixed'
const c = can.getContext("2d")
const rect = can.getBoundingClientRect()
var cX, cY
var xlim, ylim
var lw = 5
var Color = "black"
var Font = "20px serif"
var X, Y
var fX, fY, fW, fH
var scale = 1 //zoom
var tempD = {}
var tempD2 = {}
var z_eye = -12
var z_screen = 0
var x_eye = -10
var y_eye = 0
var begining = true
/**Similar to c.moveTo but uses position as seen in frame*/
function GoTo(x, y) {
    X = fX + (fW * (x - xlim[0]) / (xlim[1] - xlim[0]))
    Y = fY - (fH * (y - ylim[0]) / (ylim[1] - ylim[0]))
    c.moveTo(X, Y)
}
/**Similar to c.lineTo but uses position as seen in frame */
function LineTo(x, y) {
    X = fX + (fW * (x - xlim[0]) / (xlim[1] - xlim[0]))
    Y = fY - (fH * (y - ylim[0]) / (ylim[1] - ylim[0]))
    c.lineTo(X, Y)
}
function point(x, y) {
    GoTo(x, y)
    Dot()
}
/**
 * Draws the frame
 * @param {*} Frame_Left fraction of cX
 * @param {*} Frame_Bottom fraction of cY
 * @param {*} Frame_Width fraction of cX
 * @param {*} Frame_Height fraction of cY
 */
function Frame(Frame_Left = fX / cX, Frame_Bottom = 1 - fY / cY, Frame_Width = fW / cX, Frame_Height = fH / cY) {
    fW = Frame_Width * cX
    fH = Frame_Height * cY
    fX = Frame_Left * cX
    fY = (1 - Frame_Bottom) * cY
    c.strokeRect(fX, fY - fH, fW, fH)
    var txt = `(${xlim[0]},${ylim[0]})`
    GoTo(xlim[0], ylim[0])
    c.fillText(txt, X - 5 * (txt.length), Y + 20)
    txt = `(${xlim[1]},${ylim[1]})`
    GoTo(xlim[1], ylim[1])
    c.fillText(txt, X, Y)
}

/**
 * Plots a 3D mesh
 * @param {*} data object with x,y properties being nested arrays of coordinates of points
 * @param {*} contour if true, draws the rows only, otherwise draws the columns too.
 * @param {*} x_range [x_low,x_high] : range of x values of points ON THE SCREEN
 * @param {*} y_range [y_low,y_high] : range of y values of points ON THE SCREEN
 * @param {*} z_eye z coordinate of your eye
 * @param {*} z_screen z coordinate of screen
 * @param {*} frame if true, draws frame
 */
function meshPlot(data, contour = false, x_range = xlim, y_range = ylim, frame = false) {
    xlim = x_range
    ylim = y_range
    if (data.x == undefined) {
        print("You have put a data without x array. \n Assuming data is array of more data objects")
        for (var i = 0; i < data.length; i++) { meshPlot(data[i]) }
        return;
    }
    if (data.x.tolist) { data.x = data.x.tolist() }
    if (data.y.tolist) { data.y = data.y.tolist() }
    if (data.z && data.z.tolist) { data.z = data.z.tolist() }
    if (data.x.shape) {
        if (data.x.shape != data.y.shape) {
            print("incompatible arrays")
        }
    } else {
        var m = data.x.length
        if (m !== data.y.length) {
            print("incompatible arrays")
        }
        var n = data.x[0].length
        if (n !== data.y[0].length) {
            print("incompatible arrays")
        }
    }
    var z = 1
    var x = 0
    var y = 0
    c.beginPath()
    for (var i = 0; i < m; i++) {
        begining = true
        if (data.z) {
            if (data.z[i][0] == z_screen) { var z = 1 }
            else { var z = (data.z[i][0] - z_eye) / (z_screen - z_eye) }
        }
        if (data.color) {
            if (data.type != 'scatter') {
                c.stroke()
            }
            c.beginPath()
            c.fillStyle = c.strokeStyle = data.color[i]
        }
        if (z > 0) {
            x = x_eye + (data.x[i][0] - x_eye) / z
            y = y_eye + (data.y[i][0] - y_eye) / z
            GoTo(x, y)
            begining = false
        }
        if (data.type == "scatter") { Dot(c, X, Y, lw / (2 * z)) }
        for (var j = 1; j < n; j++) {
            if (data.z) {
                if (data.z[i][j] == z_screen) { z = 1 }
                else { z = (data.z[i][j] - z_eye) / (z_screen - z_eye) }
            }
            if (z <= 0) {
                begining = true
                continue
            }
            x = x_eye + (data.x[i][j] - x_eye) / z
            y = y_eye + (data.y[i][j] - y_eye) / z
            if (data.type == "scatter") {
                GoTo(x, y)
                Dot(c, X, Y, lw / (2 * z))
            } else {
                if (begining) { GoTo(x, y); begining = false }
                else { LineTo(x, y) }
            }
        }
    }

    if (!contour) {
        for (var j = 0; j < n; j++) {
            begining = true
            if (data.z) {
                if (data.z[0][j] == z_screen) { var z = 1 }
                else { var z = (data.z[0][j] - z_eye) / (z_screen - z_eye) }
            }
            if (data.color) {
                if (data.type != 'scatter') {
                    c.stroke()
                }
                c.beginPath()
                c.fillStyle = c.strokeStyle = data.color[i]
            }
            if (z > 0) {
                x = x_eye + (data.x[0][j] - x_eye) / z
                y = y_eye + (data.y[0][j] - y_eye) / z
                GoTo(x, y)
                begining = false
            }
            if (data.type == "scatter") { Dot(c, X, Y, lw / (2 * z)) }
            for (var i = 1; i < m; i++) {
                if (data.z) {
                    if (data.z[i][j] == z_screen) { z = 1 }
                    else { z = (data.z[i][j] - z_eye) / (z_screen - z_eye) }
                }
                if (z <= 0) {
                    begining = true
                    continue
                }
                x = x_eye + (data.x[i][j] - x_eye) / z
                y = y_eye + (data.y[i][j] - y_eye) / z
                if (data.type == "scatter") {
                    GoTo(x, y)
                    Dot(c, X, Y, lw / (2 * z))
                } else {
                    if (begining) { GoTo(x, y); begining = false }
                    else { LineTo(x, y) }
                }
            }
        }
    }

    if (data.type != 'scatter') {
        c.stroke()
    }
    Remember()
    if (frame) { Frame() }
}

/**
 * @param {*} A Angle of rotation (radians)
 * @param {*} W Axis of rotation (x,y,z). Not specifying axis will make the z axis the axis of rotation
 * @returns Transfomation function
 */
function RotM(A, W) {
    return Matrix(RM(A, W))
}

/**
 * Transforms a "data" object using a function
 * @param {*} data mesh or line 
 * @param {*} f Transformation function that takes in array arr and index i and alters the value of arr[i]
 */
function Transform(data, f, use = false) {
    if (!use) {
        for (var i = 0; i < data.x.length; i++) {
            if (typeof (data.x[i]) === 'object') {
                tempD.x = data.x[i]
                if (data.y) {
                    tempD.y = data.y[i]
                }
                if (data.z) {
                    tempD.z = data.z[i]
                }
                Transform(tempD, f)
            } else {
                f(data, i)
            }
        }
    } else {
        for (var i = 0; i < data.x.length; i++) {
            if (typeof (data.x[i]) === 'object') {
                tempD.x = data.x[i]
                tempD2.x = use.x[i]
                if (data.y) {
                    tempD.y = data.y[i]
                    tempD2.y = use.y[i]
                }
                if (data.z) {
                    tempD.z = data.z[i]
                    tempD2.z = use.z[i]
                }
                Transform(tempD, f, tempD2)
            } else {
                f(data, i, use)
            }
        }
    }
}

function Torus(R, r) {
    return (function (data, i, use = false) {
        if (!use) { use = data }
        var x = use.x[i]
        var y = use.y[i]
        data.x[i] = (R + r * Math.cos(x)) * Math.cos(y)
        data.y[i] = (R + r * Math.cos(x)) * Math.sin(y)
        data.z[i] = r * Math.sin(x)
    })
}

/**
 * Converts a matrix into a transformation function
 * @param {*} M The matrix to be used
 * @returns A Transformation function
 */
function Matrix(M) {
    return (function (data, i, use = false) {
        if (!use) { use = data }
        var x = use.x[i]
        var y = use.y[i]
        if (M.length === 2) {
            data.x[i] = M[0][0] * x + M[0][1] * y
            data.y[i] = M[1][0] * x + M[1][1] * y
        } else {
            var z = use.z[i]
            data.x[i] = M[0][0] * x + M[0][1] * y + M[0][2] * z
            data.y[i] = M[1][0] * x + M[1][1] * y + M[1][2] * z
            data.z[i] = M[2][0] * x + M[2][1] * y + M[2][2] * z
        }
    })
}
/**
 * @param {*} A Angle of rotation (in radians)
 * @param {*} W Axis about which rotation should happen (x,y,z)
 * @returns A 3D or 2D rotation matrix
 */
function RM(A, W) {
    var cA = Math.cos(A)
    var sA = Math.sin(A)
    if (W) {
        var x = W[0]
        var y = W[1]
        var z = W[2]
        var M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        var r = (x * x + y * y + z * z) ** 0.5
        x = x / r
        y = y / r
        z = z / r

        M[0][0] = cA + x * x * (1 - cA)
        M[0][1] = x * y * (1 - cA) - z * sA
        M[0][2] = x * y * (1 - cA) + y * sA

        M[1][0] = x * y * (1 - cA) + z * sA
        M[1][1] = cA + y * y * (1 - cA)
        M[1][2] = y * z * (1 - cA) - x * sA

        M[2][0] = x * z * (1 - cA) - y * sA
        M[2][1] = y * z * (1 - cA) + x * sA
        M[2][2] = cA + z * z * (1 - cA)

    } else {
        var M = [[cA, -sA], [sA, cA]]
    }
    return M
}
function applyM(M, v) {
    var x = v[0]
    var y = v[1]
    var z = v[2]
    var v2 = [0, 0, 0]
    v2[0] = M[0][0] * x + M[0][1] * y + M[0][2] * z
    v2[1] = M[1][0] * x + M[1][1] * y + M[1][2] * z
    v2[2] = M[2][0] * x + M[2][1] * y + M[2][2] * z
    return v2
}
function subtract(p2, p1) {
    return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]
}
function add(p2, p1) {
    return [p2[0] + p1[0], p2[1] + p1[1], p2[2] + p1[2]]
}
function cross(v1, v2) {
    var v3 = [0, 0, 0]
    v3[0] = v1[1] * v2[2] - v1[2] * v2[1]
    v3[1] = v1[2] * v2[0] - v1[0] * v2[2]
    v3[2] = v1[0] * v2[1] - v1[1] * v2[0]
    return v3
}
function normalize(v) {
    l = (v[0] ** 2 + v[1] ** 2 + v[2] ** 2) ** 0.5
    return [v[0] / l, v[1] / l, v[2] / l]
}
function angle(v1, v2) {
    var dot = 0
    var l1 = 0
    var l2 = 0
    for (var i = 0; i < 3; i++) {
        dot += v1[i] * v2[i]
        l1 += v1[i] ** 2
        l2 += v2[i] ** 2
    }
    l1 = l1 ** 0.5
    l2 = l2 ** 0.5
    var c = dot / (l1 * l2)
    return Math.acos(c)

}
function norm(v) {
    var S = 0
    for (var i = 0; i < v.length; i++) {
        S += v[i] ** 2
    }
    return S ** 0.5
}
function Scale(v, s) {
    for (var i = 0; i < v.length; i++) {
        v[i] *= s
    }
}
function Round(v) {
    for (var i = 0; i < v.length; i++) {
        v[i] = Math.round(v[i])
    }
}
function chop(v, lim) {
    for (var i = 0; i < v.length; i++) {
        if (v[i] < lim[0]) {
            v[i] = lim[0]
        }
        if (v[i] > lim[1]) {
            v[i] = lim[1]
        }
    }
}
var pulses = 3
function ColorCircleOn(p0, p1, p2) {
    var v1 = subtract(p1, p0)
    var v2 = subtract(p2, p0)
    var n0 = cross(v1, v2)
    var n1 = cross(n0, v1)
    var n2 = cross(v2, n0)
    var n02 = norm(n0) ** 2
    var v12 = norm(v1) ** 2
    var v22 = norm(v2) ** 2
    Scale(n1, v22 / (2 * n02))
    Scale(n2, v12 / (2 * n02))
    var c = add(n1, n2)
    c = add(c, p0)
    r0 = subtract(p0, c)
    return function (t) {
        var R = RM(2 * pulses * Math.PI * t, n0)
        var r = applyM(R, r0)
        var p = add(c, r)
        Round(p)
        chop(p, [0, 255])
        return `rgb(${p[0]},${p[1]},${p[2]})`
    }

}
Circ = ColorCircleOn([23, 0, 54], [214, 33, 166], [97, 176, 205])

/**
 * Creates a grid (mesh)
 * @param {*} m number of rows
 * @param {*} n number of collumns
 * @param {*} x_range [x_low, x_high] : The x values between which grid is confined
 * @param {*} y_range [y_low, y_high] : The y values between which grid is confined
 * @param {*} type "2d" or "3d"
 * @returns An object with x,y properties containing the nested arrays of x coordinates and y coordinates of points
 */
function grid(m = 10, n = 10, x_range = xlim, y_range = ylim, type = "3d", cmap = undefined) {
    m -= 1
    n -= 1
    if (type === "2d") {
        data = { x: [], y: [] }
        for (var i = 0; i <= m; i++) {
            var x = []
            var y = []
            for (var j = 0; j <= n; j++) {
                x.push((j * x_range[1] + (n - j) * x_range[0]) / n)
                y.push((i * y_range[1] + (m - i) * y_range[0]) / m)
            }
            data.x.push(x)
            data.y.push(y)
        }
    }
    if (type === "3d") {
        data = { x: [], y: [], z: [] }
        for (var i = 0; i <= m; i++) {
            var x = []
            var y = []
            var z = []
            for (var j = 0; j <= n; j++) {
                x.push((j * x_range[1] + (n - j) * x_range[0]) / n)
                y.push((i * y_range[1] + (m - i) * y_range[0]) / m)
                z.push(0)
            }
            data.x.push(x)
            data.y.push(y)
            data.z.push(z)
        }
    }
    if (cmap) {
        data['color'] = []
        for (var i = 0; i <= m; i++) {
            data.color.push(cmap(i / m))
        }
    }

    return data

}

function Remember(color = Color, Line_width = lw, font = Font) {
    c.strokeStyle = Color = color
    c.font = Font = font
    c.lineWidth = lw = Line_width
}

function resize() {
    cX = window.innerWidth
    cY = window.innerHeight
    var r = Math.min(cX / 4, cY / 4)
    fX = cX / 2
    fY = cY / 2 + r
    fW = 2 * r
    fH = 2 * r
    can.width = cX
    can.height = cY
    Remember()
}

/**
 * Function Animation
 * @param {*} f list of functions to call
 * @param {*} n list of number of times function is called
 * @param {*} T list of durations for which animation runs
 * @param {*} dt list of intervals between function calls
 */
function funcAnim(f, n = [100], T = [5000], dt = [false], i = 0) {
    if (!dt[i]) {
        dt[i] = T[i] / n[i]
    }
    fa = setInterval(function () {
        if (f[i]) {
            f[i]();
        }
        n[i]--;
        if (n[i] <= 0) {
            clearInterval(fa)
            if (i < f.length - 1) {
                funcAnim(f, n, T, dt, i + 1)
            }
        }
    }, dt[i])
}

function clear() {
    c.clearRect(0, 0, cX, cY)
}

function Dot(ctx = c, x = X, y = Y) {
    var l = ctx.lineWidth
    ctx.lineWidth = 0
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = l
}
function point(x, y) {
    GoTo(x, y)
    Dot()
}

function Doit() {
    clear()
    meshPlot(g, true)
}
dA = 0.05
LRM = RotM(dA, [0, 1, 0])
RRM = RotM(-dA, [0, 1, 0])
URM = RotM(dA, [1, 0, 0])
DRM = RotM(-dA, [1, 0, 0])
Funkeys = {
    '+': function () { z_eye += 1; z_screen += 1 },
    '-': function () { z_eye -= 1; z_screen -= 1 },
    'l': function () { x_eye -= 1 },
    'r': function () { x_eye += 1 },
    'u': function () { y_eye += 1 },
    'd': function () { y_eye -= 1 },
    //'L':function(){Transform(g,LRM)},
    //'R':function(){Transform(g,RRM)},
    'ArrowUp': function () { Transform(g, URM) },
    'ArrowDown': function () { Transform(g, DRM) },
    //'ArrowUp':function(){ylim[0]+=1;ylim[1]+=1}, 
    //'ArrowDown':function(){ylim[0]-=1;ylim[1]-=1},
    'ArrowLeft': function () { xlim[0] -= 1; xlim[1] -= 1 },
    'ArrowRight': function () { xlim[0] += 1; xlim[1] += 1 },
}
pressed = {
    '+': false,
    '-': false,
    'l': false,
    'r': false,
    'u': false,
    'd': false,
    'L': false,
    'R': false,
    'U': false,
    'D': false,
}
Loops = {}
dt = 50
window.onkeydown = function (e) {
    e.preventDefault()
    if (pressed[e.key]) { return }
    Loops[e.key] = setInterval(function () { Funkeys[e.key](); Doit(); }, dt)
    pressed[e.key] = true
}
window.onkeyup = function (e) {
    e.preventDefault()
    clearInterval(Loops[e.key])
    pressed[e.key] = false
}
window.onresize = resize


window.onload = function () {
    resize()
    g = grid(100, 100, [0, 2 * Math.PI], [-Math.PI, Math.PI], '3d', Circ)
    var R = 30
    var r = 9
    Transform(g, Torus(R, r))
    x_eye = -R
    z_eye = -2 * r
    xlim = [-R - r, -R + r]
    ylim = [-r, r]
    Transform(g, RotM(Math.PI / 2.3, [1, 0, 0]))
    setInterval(function () { Transform(g, LRM); Doit(); }, dt)
}

var targetDate = new Date("September 30, 2023").getTime();

// Update the timer every second
setInterval(function () {
    var now = new Date().getTime();
    var timeRemaining = targetDate - now;

    // Calculate the days, hours, minutes, and seconds remaining
    var days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
    var hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    var minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    var seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

    // Update the timer elements in the HTML
    document.querySelector(".time.days .number").textContent = days;
    document.querySelector(".time.hours .number").textContent = hours;
    document.querySelector(".time.minutes .number").textContent = minutes;
    document.querySelector(".time.seconds .number").textContent = seconds;
}, 1000);

