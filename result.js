$(document).ready(function () {
    let model;
    let score;
    let distanceFunc = vecDistance;
    let question_name = "unknown";
    const background_color = "#EEE";
    const indicator_color_left = "#F05";
    const indicator_color_right = "#50F";

    async function initialize() {
        let url = decodeURIComponent(window.location.search.substring(1));
        let params = url.split("&");
        for (let pair of params) {
            let [key, value] = pair.split("=")
            if (key == "model") {
                model = await $.getJSON(`models/${value}.json`);
                score = new Array(model.dimensions.length).fill(50);
            }
            else if (key == "score") {
                value.split("$").map((x) => parseInt(x)).forEach((value, index)=>{
                    score[index] = value > 100 ? 100 :
                                   value < 0 ? 0 : value; 
                });
            }
            else if (key == "question") {
                question_name = value;
            }
        }

        if (model == undefined || score == undefined) {
            console.log("failed to parse parameters");
        }
        
        if (model.distance == "cosine"){
            distanceFunc = vecCosine;
        }

        drawGraph();
    }

    function drawGraph() {
        const Y_STEP = 100;
        const width = 600;
        const height = 300 + Y_STEP * model.dimensions.length;
        const font_l = {
            family: 'Helvetica',
            size: 24,
            anchor: 'start',
            leading: '1em'
        };
        const font_light = {
            family: 'Helvetica',
            size: 24,
            anchor: 'start',
            leading: '1em',
            weight: 300
        };
        const font_r = {
            family: 'Helvetica',
            size: 24,
            anchor: 'end',
            leading: '1em'
        };
        const font_ideology = {
            family: 'Helvetica',
            size: 40,
            anchor: 'start',
            weight: 300
        };
        const font_title = {
            family: "monospace",
            size: 16,
            anchor: 'start'
        }

        let graph = document.getElementById("graph");
        graph.setAttribute("width", width);
        graph.setAttribute("viewBox", `0 0 ${width} ${height}`);
        let svg = SVG(graph);
        svg.rect(width, height).x(0).y(0).fill(background_color);


        for (let i = 0; i < model.dimensions.length; i++) {
            let y = i * Y_STEP;
            // draw progress bar
            let gradient = svg.gradient("linear", (add) => {
                add.stop(0, indicator_color_left);
                add.stop((score[i] - 2) / 100, indicator_color_left);
                add.stop((score[i] + 2) / 100, indicator_color_right);
                add.stop(1, indicator_color_right);
            });
            svg.rect().attr({
                width: 400,
                height: 40,
                x: 100,
                y: 40 + y,
                rx: 5,
                ry: 5,
                fill: gradient
            });

            // draw percentage
            svg.text(score[i] + "%").attr({
                x: 100 + 5,
                y: y + 40 + 5,
                fill: "#FFF",
            }).font(font_l);
            svg.text((100 - score[i]) + "%").attr({
                x: 500 - 5,
                y: y + 40 + 5,
                fill: "#FFF",
            }).font(font_r);

            // draw text
            let explanation = model.explanations[i][6 - Math.round((score[i] / 100) * 6)];
            let opposite = model.dimensions[i].split("-");
            svg.text(explanation).attr({
                x: 100,
                y: y + 5,
                fill: "#000"
            }).font(font_light);
            svg.text(opposite[0]).attr({
                x: 100 - 5,
                y: y + 40 + 5,
                fill: "#000"
            }).font(font_r);
            svg.text(opposite[1]).attr({
                x: 500 + 5,
                y: y + 40 + 5,
                fill: "#000"
            }).font(font_l);
        }

        let y = model.dimensions.length * Y_STEP;
        let ideology = findIdeology(score, model.ideologies);
        svg.text("最接近的意识形态:").attr({
            x: 30,
            y: y + 30,
            fill: "black"
        }).font(font_l);
        svg.text(ideology).attr({
            x: 30,
            y: y + 60,
            fill: "black"
        }).font(font_ideology);
        svg.text(`Quiz Name: ${question_name}`).attr({
            x: 20,
            y: height - 80,
            fill: "black"
        }).font(font_title);
        svg.text("Yet Another Values Test").attr({
            x: 20,
            y: height - 60,
            fill: "black"
        }).font(font_title);
        svg.text(window.location.hostname).attr({
            x: 20,
            y: height - 40,
            fill: "black"
        }).font(font_title);
        svg.image("SVGS/qrcode.svg").attr({
            x: 360,
            y: height - 270,
            width: 200,
            height: 200,
        });
        svg.text("基于8values的倾向测试").attr({
            x: 370,
            y: height - 60,
            fill: "black"
        }).font(font_title);


        $("#btn-result-save").removeAttr("disabled");
    }

    function vecDistance(vec1, vec2, powers) {
        let distance = 0;
        vec1.forEach((value, index) => {
            distance += (value - vec2[index]) ** (powers ? powers[index] : 2);
        });

        return Math.sqrt(distance);
    }

    function vecCosine(vec1, vec2) {
        return vecDot(vec1, vec2) / (vecNorm(vec1) * vecNorm(vec2));
    }

    function vecDot(vec1, vec2) {
        let n = 0;
        for (let i = 0; i < vec1.length; i ++){
            n += vec1[i] * vec2[i];
        }
        return n;
    }

    function vecNorm(vec) {
        let norm = 0;
        vec.forEach((value, index) => {
            norm += value ** 2;
        });
        return Math.sqrt(norm);
    }

    function findIdeology(score, ideologies) {
        let fixed = score.map((x) => (x - 50));
        let ideology = Object.keys(ideologies)[0];
        let powers = new Array(model.dimensions.length).fill(2);
        if (Array.isArray(model.power_weights)){
            powers = model.power_weights;
        }
        let min_distance = vecDistance(ideologies[ideology], score, powers);
        for (let [key, value] of Object.entries(ideologies)) {
            let distance = vecDistance(value, score, powers);
            if (distance < min_distance) {
                ideology = key;
                min_distance = distance;
            }
        }

        return ideology;
    }

    function encodeSVG (svg) {
        // first create a clone of our svg node so we don't mess the original one
        var clone = svg.cloneNode(true);

        // create a doctype
        var svgDocType = document.implementation.createDocumentType('svg', "-//W3C//DTD SVG 1.1//EN", "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd");
        // a fresh svg document
        var svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
        // replace the documentElement with our clone 
        svgDoc.replaceChild(clone, svgDoc.documentElement);
        // get the data
        var svgData = (new XMLSerializer()).serializeToString(svgDoc);

        // now you've got your svg data, the following will depend on how you want to download it
        // e.g yo could make a Blob of it for FileSaver.js
        /*
        var blob = new Blob([svgData.replace(/></g, '>\n\r<')]);
        saveAs(blob, 'myAwesomeSVG.svg');
        */
        // here I'll just make a simple a with download attribute

        return 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgData.replace(/></g, '>\n\r<'));
    };

    initialize();

    $("#btn-result-save").click(function () {
        let canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 800;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        let ctx = canvas.getContext("2d");

        let image = new Image();
        image.src = encodeSVG(document.getElementById("graph"));
        let qrcode = new Image();
        qrcode.src = "SVGS/qrcode.svg";
        image.onload = function (){
            ctx.drawImage(image, 0, 0);
            ctx.drawImage(qrcode, 360, 530, 200, 200);
            let a = document.createElement('a');
            a.download = "yavt.png";
            a.href = canvas.toDataURL("image/png");
            a.click();
        };
    });
});
