
var FPS = 30;
var SPF = 1 / FPS;

// In pixels per second.
var FLEET_SPEED = 100;

var PLAYER_COLORS = [
    ["#CCFF00", "#99BF00"],
    ["#00CCFF", "#0099BF"],
    ["#FF00CC", "#BF0099"],
    ["#FFCC00", "#BF9900"],
    ["#00FFCC", "#00BF99"],
    ["#CC00FF", "#9900BF"],
];

var planetLocs = null;

function dist(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function makePlanetLocs(ctx, planets) {
    planetLocs = [];
    var top = Infinity,
        left = Infinity,
        right = -Infinity,
        bottom = -Infinity;
    for (var i = 0; i < planets.length; i++) {
        var p = planets[i];
        if (p.x < left) left = p.x;
        if (p.x > right) right = p.x;
        if (p.y < top) top = p.y;
        if (p.y > bottom) bottom = p.y;
    }
    console.log(top);
    console.log(left);
    console.log(right);
    console.log(bottom);
    var xRange = right - left,
        yRange = bottom - top,
        paddingFactor = 0.1;
    left -= xRange * paddingFactor;
    right += xRange * paddingFactor;
    top -= yRange * paddingFactor;
    bottom += yRange * paddingFactor;
    var width = ctx.canvas.width;
    var height = width * yRange / xRange;
    console.log("new canvas height: " + height);
    ctx.canvas.height = height;
    for (var i = 0; i < planets.length; i++) {
        var p = planets[i];
        var x = Math.floor((p.x - left) / (right - left) * width);
        var y = height - Math.floor((p.y - top) / (bottom - top) * height);
        planetLocs.push({
            "x": x,
            "y": y,
        });
    }
}

function drawPlanet(ctx, planet) {
    var p = planetLocs[planet.id];
    ctx.beginPath();
    ctx.arc(p.x + 0.5, p.y + 0.5, planet.growth * 20, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = PLAYER_COLORS[planet.owner][1];
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = PLAYER_COLORS[planet.owner][0];
    ctx.stroke();
    ctx.font = "36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    ctx.fillText(planet.ships, p.x, p.y);
}

function drawFleet(ctx, fleet) {
    var source = planetLocs[fleet.source];
    var destination = planetLocs[fleet.destination];
    var d = dist(source, destination);
    var traveled = d * (1.0 - fleet.remaining_turns / fleet.total_turns);
    var theta = Math.atan2(destination.y - source.y, destination.x - source.x);
    var x = source.x + Math.cos(theta) * traveled;
    var y = source.y + Math.sin(theta) * traveled;
    var r = fleet.ships * 0.75;
    ctx.beginPath();
    ctx.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = PLAYER_COLORS[fleet.owner][0];
    ctx.fill();
    //ctx.lineWidth = 4;
    //ctx.strokeStyle = PLAYER_COLORS[planet.owner][0];
    //ctx.stroke();
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    ctx.fillText(fleet.ships, x, y);
}

$(function() {
    var gameID = document.URL.slice(document.URL.lastIndexOf("/") + 1);
    var socket = io.connect("/game");
    var canvas = document.getElementById("game");
    var ctx = canvas.getContext("2d");
    socket.emit("join", gameID);
    socket.on("update", function(msg) {
        var data = JSON.parse(msg);
        //console.log(data);
        if (!planetLocs) makePlanetLocs(ctx, data.planets);
        //console.log(planetLocs);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < data.planets.length; i++) {
            drawPlanet(ctx, data.planets[i]);
        }
        for (var i = 0; i < data.fleets.length; i++) {
            drawFleet(ctx, data.fleets[i]);
        }
    });
});