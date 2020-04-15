$(document).ready(function () {  // Use closure, no globals
    'use strict';
    let scores;
    let current_question = 0;
    let questions;
    let model;
    let model_file;
    let quiz_name = "unknown";
    let core_version = "0.1";
    let disable_back = false;
    let disable_display_no = false;
    let disable_shuffle = false;

    initialize();

    async function initialize(){
        let url = decodeURIComponent(window.location.search.substring(1));
        let params = url.split("&");
        for (let pair of params) {
            let [key, value] = pair.split("=")
            if (key == "question") {
                questions = await $.getJSON(`questions/${value}.json`)
                    .fail(()=>console.log("failed to load questions"));
            }
        }

        if (questions == undefined) {
            console.log("failed to parse parameters");
        }
        model = await $.getJSON(`models/${questions.model}.json`)
            .fail(()=>console.log("failed to load model"));

        core_version = questions.core_version;
        model_file = questions.model;
        quiz_name = questions.name;

        if (core_version == "0.1"){
            disable_shuffle = questions.disable_shuffle ? true : false;
            disable_back    = questions.disable_back ? true : false;
        }

        questions = questions.questions;
        scores = new Array(questions.length).fill(0);

        // Shuffle Quesions
        if (! disable_shuffle){
            questions.sort(() => Math.random() - 0.5);
        }

        $("#btn-strongly-positive")
            .click(()=>{ scores[current_question] = +1.0; next_question() });
        $("#btn-positive")          
            .click(()=>{ scores[current_question] = +0.5; next_question() });
        $("#btn-uncertain")        
            .click(()=>{ scores[current_question] =  0.0; next_question() });
        $("#btn-negative")         
            .click(()=>{ scores[current_question] = -0.5; next_question() });
        $("#btn-strongly-negative")
            .click(()=>{ scores[current_question] = -1.0; next_question() });


        if (!disable_back){
            $("#btn-prev").click(()=>{ prev_question() });
        }
        render_question();
    }

    function render_question() {
        $("#question-text").html(questions[current_question].text);
        $("#question-number").html(`第 ${current_question + 1} 题 剩余 ${questions.length - current_question - 1} 题`);
        if (current_question == 0 || disable_back) {
            $("#btn-prev").attr("disabled", "disabled");
        } else {
            $("#btn-prev").removeAttr("disabled");
        }
    }

    function next_question() {
        if (current_question < questions.length - 1) {
            current_question++;
            render_question();
        } else {
            result();
        }
    }

    function prev_question() {
        if (current_question != 0) {
            current_question--;
            render_question();
        }

    }

    function result(){
        if (core_version === undefined){
            return resultLegacy();
        }

        //there's the new version of result

        const d = model.dimensions.length;
        let max_left  = new Array(d).fill(0);
        let max_right = new Array(d).fill(0);
        let results   = new Array(d).fill(0);

        for (let qn = 0; qn < questions.length; qn ++) {
            let q = questions[qn];
            for (let i = 0; i < d; i ++){
                results[i] += q.evaluation[i] * scores[qn] + q.offset[i];
            }
        }

        for (let i = 0; i < d; i ++) {
            for (let q of questions) {
                let pos_sel = q.evaluation[i] + q.offset[i];
                let neg_sel = - q.evaluation[i] + q.offset[i];

                if (pos_sel > neg_sel){
                    max_left[i]  += pos_sel;
                    max_right[i] += neg_sel;
                }
                else {
                    max_right[i] += pos_sel;
                    max_left[i]  += neg_sel;
                }
            }

            if (results[i] > 0){
                results[i] = (results[i] / max_left[i]) * 50 + 50;
            }
            else {
                results[i] = -(results[i] / max_right[i]) * 50 + 50;
            }
        }
        results = results.map(Math.round);

        let request = {
            model: model_file,
            score: results.join("$"),
            question: quiz_name
        };
        location.href = "result.html?" + $.param(request); 
    }

    function resultLegacy() {
        const d = model.dimensions.length;
        let score = new Array(d).fill(0);
        let max_score = [...score];
        for (let i = 0; i < scores.length; i ++ ) {
            for (let key = 0; key < d; key ++){
                score[key] += scores[i] * questions[i].evaluation[key];
                max_score[key] += Math.abs(questions[i].evaluation[key] * 2);
            }
        }

        for (let key = 0; key < d; key ++ ){
            if (max_score[key] != 0){ // no such questions match this axes
                score[key] = ( score[key] + max_score[key]/2 ) / (max_score[key]);
            }
            else {
                score[key] = 0.5; //set to the middle value
            }
            score[key] = Math.round(score[key] * 100);
        } 

        let request = {
            model: model_file,
            score: score.join("$"),
            question: quiz_name
        };
        location.href = "result.html?" + $.param(request); 
    }
});
