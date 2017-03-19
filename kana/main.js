var ROMAJI = {
    "a": "a", "i": "i", "u": "u", "e": "e", "o": "o",
    "ka": "ka", "ki": "ki", "ku": "ku", "ke": "ke", "ko": "ko",
    "sa": "sa", "shi": "shi", "su": "su", "se": "se", "so": "so",
    "ta": "ta", "chi": "chi", "tsu": "tsu", "te": "te", "to": "to",
    "na": "na", "ni": "ni", "nu": "nu", "ne": "ne", "no": "no",
    "ha": "ha", "hi": "hi", "fu": "fu", "he": "he", "ho": "ho",
    "ma": "ma", "mi": "mi", "mu": "mu", "me": "me", "mo": "mo",
    "ya": "ya", "yu": "yu", "yo": "yo",
    "ra": "ra", "ri": "ri", "ru": "ru", "re": "re", "ro": "ro",
    "wa": "wa", "wo": "wo", "n": "n",
}

var HIRAGANA = {
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "wo", "ん": "n",
}

var KATAKANA = {
    "ア": "a", "イ": "i", "ウ": "u", "エ": "e", "オ": "o",
    "カ": "ka", "キ": "ki", "ク": "ku", "ケ": "ke", "コ": "ko",
    "サ": "sa", "シ": "shi", "ス": "su", "セ": "se", "ソ": "so",
    "タ": "ta", "チ": "chi", "ツ": "tsu", "テ": "te", "ト": "to",
    "ナ": "na", "ニ": "ni", "ヌ": "nu", "ネ": "ne", "ノ": "no",
    "ハ": "ha", "ヒ": "hi", "フ": "fu", "ヘ": "he", "ホ": "ho",
    "マ": "ma", "ミ": "mi", "ム": "mu", "メ": "me", "モ": "mo",
    "ヤ": "ya", "ユ": "yu", "ヨ": "yo",
    "ラ": "ra", "リ": "ri", "ル": "ru", "レ": "re", "ロ": "ro",
    "ワ": "wa", "ヲ": "wo", "ン": "n",
}

function show_keyboard(type) {
    $('#romaji_keyboard').hide();
    $('#hiragana_keyboard').hide();
    $('#katakana_keyboard').hide();
    $('#'+type+'_keyboard').show();
}

// get keys from an object
function keys(obj) {
    var ks = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            ks.push(prop);
        }
    }
    return ks;
}

// array must be of the same length
function alternated_concat(arr1, arr2, arr3) {
    var result = [];
    for(var i in arr1) {
        result.push(arr1[i]);
        result.push(arr2[i]);
        result.push(arr3[i]);
    }
    return result;
}

var right_answers;

function right_answer() {
    right_answers++;
    $('#right_answers').text(right_answers);
    $('#left').text(question_list.length - question_i);
}

var errors;

function error() {
    errors++;
    $('#errors').text(errors);
}

var game_mode;
var question_mode;

var NORMAL_TIME = 120;
var MIXED_TIME = 360;

function new_game(new_mode) {
    clear();
    
    game_mode = new_mode;
    mixed_i = 0;
    
    $('#r_h').removeClass('selected');
    $('#h_r').removeClass('selected');
    $('#r_k').removeClass('selected');
    $('#k_r').removeClass('selected');
    $('#k_h').removeClass('selected');
    $('#h_k').removeClass('selected');
    $('#mixed').removeClass('selected');
    $('#'+new_mode).addClass('selected');
    
    if(game_mode != 'mixed') {
        question_mode = game_mode;
        time = NORMAL_TIME;
    }
    else if(game_mode == 'mixed') {
        question_mode = 'h_k'; // this will be immediately switched
        time = MIXED_TIME;
    }
    
    right_answers = 0;
    $('#right_answers').text(right_answers);
    errors = 0;
    $('#errors').text(errors);
    $('#time').children('span').empty().text(time); // this works with jquery.cycle in a mysterious way
    $('#time').cycle({
        fx:      'scrollDown',
        speed:   300,
        timeout: 1000,
        after:   on_tick
    });
    
    question_i = 0;
    
    if(game_mode == 'r_h') {
        question_list = $.shuffle(keys(ROMAJI));
    }
    else if(game_mode == 'h_r') {
        question_list = $.shuffle(keys(HIRAGANA));
    }
    else if(game_mode == 'r_k') {
        question_list = $.shuffle(keys(ROMAJI));
    }
    else if(game_mode == 'k_r') {
        question_list = $.shuffle(keys(KATAKANA));
    }
    if(game_mode == 'k_h') {
        question_list = $.shuffle(keys(KATAKANA));
    }
    else if(game_mode == 'h_k') {
        question_list = $.shuffle(keys(HIRAGANA));
    }
    else if(game_mode == 'mixed') {
        question_list = alternated_concat($.shuffle(keys(ROMAJI)), $.shuffle(keys(HIRAGANA)), $.shuffle(keys(KATAKANA)));
    }
    
    $('#left').text(question_list.length - question_i);
    
    next_question();
}

var question_list;
var question_i;

var MIXED_SEQUENCE = ['r_h', 'h_r', 'k_r', 'r_k', 'h_k', 'k_h']
var mixed_i;

function next_question() {
    // switch question mode if game mode is mixed
    if(game_mode == 'mixed') {
        question_mode = MIXED_SEQUENCE[mixed_i];
        mixed_i = (mixed_i + 1) % 6;
    }
    
    if(question_i >= question_list.length) {
        game_over();
    }
    
    $('#question').text(question_list[question_i]);
    
    if(question_mode[2] == 'r') {
        show_keyboard('romaji');
    }
    else if(question_mode[2] == 'h') {
        show_keyboard('hiragana');
    }
    else if(question_mode[2] == 'k') {
        show_keyboard('katakana');
    }
    
    question_i++;
}

function check(guess) {
    var question = $('#question').text();
    
    if(question_mode == 'r_h') {
        return ROMAJI[question] == HIRAGANA[guess];
    }
    else if(question_mode == 'h_r') {
        return HIRAGANA[question] == ROMAJI[guess];
    }
    else if(question_mode == 'r_k') {
        return ROMAJI[question] == KATAKANA[guess];
    }
    else if(question_mode == 'k_r') {
        return KATAKANA[question] == ROMAJI[guess];
    }
    else if(question_mode == 'h_k') {
        return HIRAGANA[question] == KATAKANA[guess];
    }
    else if(question_mode == 'k_h') {
        return KATAKANA[question] == HIRAGANA[guess];
    }
}

function clear() {
    $('#question').removeClass('correct');
    $('.keyboard td').removeClass('correct').removeClass('wrong');
}

var time;

function on_tick() {
    time--;
    $(this).siblings('span').empty().text(time); // this works with jquery.cycle in a mysterious way
    
    if(time == -1) {
        game_over();
    }
}

function game_over() {
    message = 'Game over!';
    if(right_answers == question_list.length) {
        message += ' All questions completed.';
    }
    message += ' '+right_answers+' correct answers, '+errors+' errors'
    if(game_mode != 'mixed') {
        message += ' in '+(NORMAL_TIME-1-time)+' seconds. 46 total.';
    }
    else {
        message += ' in '+(MIXED_TIME-1-time)+' seconds. 138 total.';
    }
    alert(message);
    new_game(game_mode);
}

$(document).ready(function() {
    new_game('r_h');
    
    $('.keyboard td').bind('click', function() {
        if($(this).text() == ' ') {
            return;
        }
        
        if(check($(this).text())) {
            right_answer();
            $(this).addClass('correct');
            $('#question').addClass('correct');
            $('#question').blink({blinkPeriod: 200, maxBlinks: 2});
            $(this).blink({blinkPeriod: 200, maxBlinks: 2, onMaxBlinks: function() {
                clear();
                next_question();
            }});
        }
        else {
            if(!($(this).hasClass('wrong'))) {
                error();
                $(this).addClass('wrong');
            }
        }
    });
    
    $('.btn').bind('click', function() {
        new_game($(this).attr('id'));
    });
});
