let getWordsButton = document.getElementById('generate-solutions');
let getWordsText = document.getElementById('data-letters');
let getWordsSize = document.getElementById('data-size');
let getWordsLog = document.getElementById('form-logs');
let getWordsLogToggle = document.getElementById('form-logs-toggle');
let getWordsResultToggle = document.getElementById('form-result-toggle');
let getWordsResult = document.getElementById('form-result');
let loader = document.getElementById('form-loader');

let isLogsHidden = true;
let isResultHidden = true;

let wordsMatching = [];

let results = [];

function validate(r) {
	// Unvalidate duplicate
	if (results.includes(r)) {
		return false;
	}
	const lengthCriteria = parseInt(getWordsSize.value);
	if (!isNaN(lengthCriteria)) {
		return lengthCriteria === r.length;
	}
	return true;
}

function log(message) {
    //getWordsLog.innerText = getWordsLog.innerText + '\n' + message;
    const p = document.createElement('p');
    const node = document.createTextNode(message);
    p.appendChild(node);
    getWordsLog.appendChild(p);
}

function clearLog() {
	while (getWordsLog.firstChild) {
		getWordsLog.removeChild(getWordsLog.lastChild);
	}
}

function logResult(result) {
	if (!validate(result)) {
		return;
	}
	results.push(result);
    const p = document.createElement('p');
    const node = document.createTextNode(result);
    p.appendChild(node);
    getWordsResult.appendChild(p);
}

function clearResult() {
	while (getWordsResult.firstChild) {
		getWordsResult.removeChild(getWordsResult.lastChild);
	}
}

function utf8_to_str(a) {
    for(var i=0, s=''; i<a.length; i++) {
        var h = a[i].toString(16)
        if(h.length < 2) h = '0' + h
        s += '%' + h
    }
    return decodeURIComponent(s)
}

function parseFile(data, words){
    const lines = data.split('\r\n').map(str => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    });
    log('Check data (' + lines.length + ' records)');
    lines.forEach(line => {
        words.forEach(w => {
            if (line.toUpperCase() === w.toUpperCase()) {
                wordsMatching.push(w.toUpperCase());
            }
        });
    })
}

function browseInFiles(urls, words, cb)
{
    if (urls.length === 0) {
        cb();
        return;
    }
    const url = urls.pop();
    log('Search in file "' + url + '"');
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            const data = xmlHttp.responseText;
            log('Parse file "' + url + '"');
            parseFile(data, words);
            log('Parse file "' + url + '", done!');
        }
        browseInFiles(urls, words, cb);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.setRequestHeader('Content-type', 'text/plain; charset=utf-8')
    xmlHttp.send(null);
}

function tree(leafs) {
    let branches = [];
    if (leafs.length == 1) return leafs;
    for (let k in leafs) {
        let leaf = leafs[k];
        tree(leafs.join('').replace(leaf, '').split('')).concat('').map(function(subtree) {
            branches.push([leaf].concat(subtree));
        });
    }
    return branches;
}

function getPossibleWords(letters) {
    let possibleWords = tree(letters.split('')).map(function(str) {
        return str.join('')
    });
    log('Found ' + possibleWords.length + ' combinations');
    return possibleWords;
}

function perform() {
    getWordsButton.disabled = true; 
	loader.style.display = 'block';
    clearLog();
    clearResult();
    wordsMatching = [];
    results = [];
    let letters = getWordsText.value;
    log('Search combinations for "' + letters + '"');
    let words = getPossibleWords(letters.toUpperCase());

    browseInFiles(['/WordCombo/data/fr/words.txt'], words, function() {
        log('Possible words found:');
        wordsMatching.filter(function(item, pos) {
            return wordsMatching.indexOf(item) == pos;
        });
        wordsMatching.forEach(w => {
            log(w);
            logResult(w);
        });
        getWordsButton.disabled = false;
		loader.style.display = 'none';
    });
}

getWordsButton.addEventListener('click', perform);
getWordsLogToggle.addEventListener('click', (event) => {
	event.preventDefault();
	if (isLogsHidden) {
		isLogsHidden = false;
		isResultHidden = true;
		getWordsLog.style.display = 'block';
		getWordsResult.style.display = 'none';
	} else {
		isLogsHidden = true;
		isResultHidden = false;
		getWordsLog.style.display = 'none';
		getWordsResult.style.display = 'block';
	}
});
getWordsResultToggle.addEventListener('click', (event) => {
	event.preventDefault();
	if (isResultHidden) {
		isResultHidden = false;
		isLogsHidden = true;
		getWordsResult.style.display = 'block';
		getWordsLog.style.display = 'none';
	} else {
		isResultHidden = true;
		isLogsHidden = false;
		getWordsResult.style.display = 'none';
		getWordsLog.style.display = 'block';
	}
});