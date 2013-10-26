// Fonctions assistance
function isInTablify(elt) {
	if(elt == document.body || elt == document.body.parentNode) return false;
	else if(elt.parentNode.classList.contains("tablify")) return true;
	else return isInTablify(elt.parentNode);
}

// Events tableau
// Sélection (multiple avec ctrl ou cmd)
var tbody = document.querySelector(".tablify tbody");
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
