/*
 * tablify
 * Author : Mathieu DOMER
 * Created : 25/10/2013
 * Modified : 
 *
 */


/**
 * Extends {@link NodeList} to simplify addEventListener on list
 *
 * @param	type		Event type
 * @param	listener 	Object triggered when the event occurs
 * @param	useCapture	See {@link EventTarget.addEventListener}
 * @see 	EventTarget.addEventListener
 */
NodeList.prototype.addEventListenerAll = function(type, listener, useCapture) {
	for(var i = 0; i < this.length; i++) {
		this[i].addEventListener(type, listener, useCapture);
	}
};

/**
 * Define reccursively if the element elt is in another element which class name is className
 *
 * @param	elt			Original element
 * @param	className 	Class name searched
 * @return	True - The elt is in an element which class name is className
 * @return	False - The elt is not in an element which class name is className
 */
// Fonctions assistance
var isIn = function(elt, className) {
	if(elt == document.body || elt == document.body.parentNode) return false;
	else if(elt.parentNode.classList.contains(className)) return true;
	else return isIn(elt.parentNode, className);
};

// Génération du HTML

// Events 

/**
 * Defines behavior of element of tbody is selected
 * Multiple selection is possible using Ctrl or Cmd
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tbodyClick = function(e) {
	var trsSelected = document.querySelectorAll(".tablify tr.selected");
	if(!e.ctrlKey && !e.metaKey) {
		// Déselection des lignes sélectionnées si ctrl n'est pas appuyée
		for(var i = 0; i < trsSelected.length; i++) {
			trsSelected[i].classList.remove("selected");
		}
	}
	e.target.parentNode.classList.add("selected");
};

/**
 * Defines behavior of element of tbody is unselected
 * Unselection occurs when clicking outside the table
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.documentClick = function(e) {
	if (!isIn(e.target, "tablify")) {
		var trsSelected = document.querySelectorAll(".tablify tr.selected");
		for(var i = 0; i < trsSelected.length; i++) {
			trsSelected[i].classList.remove("selected");
		}
	}
};

/**
 * Defines behavior tr elements on drag start
 * Add .moving class to the selected tr as setData doesn't work in dragover events
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.trsDragStart = function(e) { 
	e.dataTransfer.effectAllowed = 'move';
	e.currentTarget.classList.add("moving");
	e.dataTransfer.setData("text/html", null); // Cannot be empty for Firefox !
};

/**
 * Defines behavior tr elements on drag over
 * If the selected tr is moved on the upper half part of another tr, it is inserted before
 * If the selected tr is moved on the lower half part of another tr, it is inserted after
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.trsDragOver = function(e) {
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

/**
 * Defines behavior tr elements on drag end
 * Once released, we remove the .moving class of the selected tr
 * The ids of the tr elements in the tbody are renumbered
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.trsDragEnd = function(e){
	e.preventDefault();
	document.querySelector(".tablify tr.moving").classList.remove("moving");
	// Refaire les ids
	var trs = document.querySelectorAll(".tablify tbody tr");
	for (var i = 0; i < trs.length; i++) {
		trs[i].id = "tr" + i;
	}
	return false;
};

/**
 * Defines behavior of the tbody element on drop
 * Nothing is done there, its for Firefox...
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tbodyDrop = function(e){
	e.preventDefault();
	return false;
};
// Tri


// Filtre


// Editer


// Ajouter


// Enregistrer

/**
 * Defines behavior of the Remove button when clicked
 * All .selected tr elements are removed
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.supprimersClick = function(e) {
	var trsSelected = document.querySelectorAll(".tablify tr.selected");
	for(var i = 0; i < trsSelected.length; i++) {
		document.querySelector(".tablify tbody").removeChild(trsSelected[i]);
	}
};

/** 
 * Class constructor.
 */
function Tablify() {
	
	// Propriétés
	this.tbody = document.querySelector(".tablify tbody");
	this.trs = document.querySelectorAll(".tablify tbody tr");
	this.removeButton = document.querySelectorAll(".tablify button.remove");
	
	// Initiate events
	document.addEventListener("click", this.documentClick, false);
	this.tbody.addEventListener("click", this.tbodyClick, false);
	this.trs.addEventListenerAll("dragstart", this.trsDragStart, false);
	this.trs.addEventListenerAll("dragover", this.trsDragOver, false);
	this.trs.addEventListenerAll("dragend", this.trsDragEnd, false);
	this.tbody.addEventListener("drop", this.tbodyDrop, false);
	this.removeButton.addEventListenerAll("click", this.supprimersClick, false);

}
var test = new Tablify();
