// Variables
var tbody = document.querySelector(".tablify tbody");
var trs = document.querySelectorAll(".tablify tbody tr");
// Fonctions assistance
function isInTablify(elt) {
	if(elt == document.body || elt == document.body.parentNode) return false;
	else if(elt.parentNode.classList.contains("tablify")) return true;
	else return isInTablify(elt.parentNode);
}
NodeList.prototype.addEventListenerAll = function(type, listener, useCapture) {
	for(var i = 0; i < this.length; i++) {
		this[i].addEventListener(type, listener, useCapture);
	}
}
// Events tableau
// Sélection (multiple avec ctrl ou cmd)
tbody.addEventListener("click", function(e) {
	if(!e.ctrlKey && !e.metaKey) {
		// Déselection des lignes sélectionnées si ctrl n'est pas appuyée
		var selecteds = document.querySelectorAll(".tablify tr.selected");
		for(var i = 0; i < selecteds.length; i++) {
			selecteds[i].classList.remove("selected");
		}
	}
	e.target.parentNode.classList.add("selected");
}, false);
// Déselection
document.addEventListener("click", function(e) {
	if (!isInTablify(e.target)) {
		var selecteds = document.querySelectorAll(".tablify tr.selected");
		for(var i = 0; i < selecteds.length; i++) {
			selecteds[i].classList.remove("selected");
		}
	}
}, false);
// Drag'n drop
var trSelected = null;
trs.addEventListenerAll("dragstart", function(e) { 
	e.dataTransfer.effectAllowed = 'move';
	trSelected = e.currentTarget;
	trSelected.classList.add("moving");
	e.dataTransfer.setData("Text", trSelected.id);

}, false);
trs.addEventListenerAll("dragover", function(e) {
	e.preventDefault();
	var trOvered = e.target.parentNode;
	if (e.pageY - e.target.offsetTop < 20) {
		tbody.insertBefore(trSelected, trOvered);
	}
	else {
		if (trOvered.isEqualNode(tbody.lastElementChild)) {
			tbody.appendChild(trSelected);
		}
		else {
			tbody.insertBefore(trSelected, trOvered.nextElementSibling);
		}
		
	}
	return false;
}, false);
tbody.addEventListener("drop", function(e){
	e.preventDefault();
	trSelected.classList.remove("moving");
	trSelected = null;
	// Refaire les id
}, false);
// Tri


// Filtre


// Editer

// Supprimer
var supprimers = document.querySelectorAll(".tablify .supprimer");
for(var i = 0; i < supprimers.length; i++) {
	supprimers[i].addEventListener("click", function(e) {
		var selecteds = document.querySelectorAll(".tablify tr.selected");
		for(var i = 0; i < selecteds.length; i++) {
			tbody.removeChild(selecteds[i]);
		}
	}, false);
}
