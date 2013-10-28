/*
 * tablify
 * Author : Mathieu DOMER
 * Created : 25/10/2013
 * Modified : 
 *
 */

// Objets externes
NodeList.prototype.addEventListenerAll = function(type, listener, useCapture) {
	for(var i = 0; i < this.length; i++) {
		this[i].addEventListener(type, listener, useCapture);
	}
};

// Fonctions assistance
var isIn = function(elt, className) {
	if(elt == document.body || elt == document.body.parentNode) return false;
	else if(elt.parentNode.classList.contains(className)) return true;
	else return isIn(elt.parentNode, className);
};

// Génération du HTML

// Events tableau
// Sélection (multiple avec ctrl ou cmd)
tablify.prototype.tbodyClick = function(e) {
	var trsSelected = document.querySelectorAll(".tablify tr.selected");
	if(!e.ctrlKey && !e.metaKey) {
		// Déselection des lignes sélectionnées si ctrl n'est pas appuyée
		for(var i = 0; i < trsSelected.length; i++) {
			trsSelected[i].classList.remove("selected");
		}
	}
	e.target.parentNode.classList.add("selected");
};
// Déselection
tablify.prototype.documentClick = function(e) {
	if (!isIn(e.target, "tablify")) {
		var trsSelected = document.querySelectorAll(".tablify tr.selected");
		for(var i = 0; i < trsSelected.length; i++) {
			trsSelected[i].classList.remove("selected");
		}
	}
};
// Drag'n drop
tablify.prototype.trsDragStart = function(e) { 
	e.dataTransfer.effectAllowed = 'move';
	e.currentTarget.classList.add("moving");
	e.dataTransfer.setData("text/html", null); // Ne doit pas être vide : Firefox !
};
tablify.prototype.trsDragOver = function(e) {
	e.preventDefault();
	var trOvered = e.target.parentNode;
	if (e.pageY - e.target.offsetTop < e.target.offsetHeight / 2) {
		document.querySelector(".tablify tbody").insertBefore(document.querySelector(".tablify tr.moving"), trOvered);
	}
	else {
		var tbody = document.querySelector(".tablify tbody");
		if (trOvered.isEqualNode(tbody.lastElementChild)) {
			tbody.appendChild(document.querySelector(".tablify tr.moving"));
		}
		else {
			tbody.insertBefore(document.querySelector(".tablify tr.moving"), trOvered.nextElementSibling);
		}
	}
	return false;
};
tablify.prototype.trsDragEnd = function(e){
	e.preventDefault();
	document.querySelector(".tablify tr.moving").classList.remove("moving");
	// Refaire les ids
	var trs = document.querySelectorAll(".tablify tbody tr");
	for (var i = 0; i < trs.length; i++) {
		trs[i].id = "tr" + i;
	}
	return false;
};
tablify.prototype.tbodyDrop = function(e){
	e.preventDefault();
	return false;
};
// Tri


// Filtre


// Editer

// Supprimer
tablify.prototype.supprimersClick = function(e) {
	var trsSelected = document.querySelectorAll(".tablify tr.selected");
	for(var i = 0; i < trsSelected.length; i++) {
		document.querySelector(".tablify tbody").removeChild(trsSelected[i]);
	}
};

// Constructeur
function tablify() {
	
	// Propriétés
	this.tbody = document.querySelector(".tablify tbody");
	this.trs = document.querySelectorAll(".tablify tbody tr");
	this.supprimers = document.querySelectorAll(".tablify .supprimer");
	
	// Initiate events
	document.addEventListener("click", this.documentClick, false);
	this.tbody.addEventListener("click", this.tbodyClick, false);
	this.trs.addEventListenerAll("dragstart", this.trsDragStart, false);
	this.trs.addEventListenerAll("dragover", this.trsDragOver, false);
	this.trs.addEventListenerAll("dragend", this.trsDragEnd, false);
	this.tbody.addEventListener("drop", this.tbodyDrop, false);
	this.supprimers.addEventListenerAll("click", this.supprimersClick, false);

}
var test = new tablify();
