/*
 * tablify
 * Author : Mathieu DOMER
 * Created : 25/10/2013
 * Modified : 
 * Backlog : 
 * - Sauvegarder en local les colonnes
 * - clic droit
 * - Drag'n drop colonne
 * - Tri
 * - Filtre
 * - Editer
 * - Historique
 * - Enregistrer
 * - Charger
 * - Générer le HTML
 * - Websockets ? (modification côté serveur)
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
var isIn = function(elt, className) {
	if(elt == document.body || elt == document.body.parentNode) return false;
	else if(elt.parentNode.classList.contains(className)) return true;
	else return isIn(elt.parentNode, className);
};

/**
 * Recalculate row ids
 *
 */
var recalculateRowIds = function() {
	var trs = document.querySelectorAll(".tablify tbody tr");
	for (var i = 0; i < trs.length; i++) {
		trs[i].id = "tr" + i;
		trs[i].firstElementChild.innerHTML = i + 1;
	}
};

/**
 * Extends {@link Element} to determine a child node's index inside of its parent node 
 *
 * @return	The index
 */
Element.prototype.getIndex = function() {
	var i = 0;
	var child = this;
	while((child = child.previousElementSibling) != null) i++;
	return i;
}

/**
 * Defines behavior of element of tbody is selected
 * Multiple selection is possible using Ctrl or Cmd
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tbodyClick = function(e) {
	// Unselect all selected rows if neither ctrl nor  cmd key are pressed
	if(!e.ctrlKey && !e.metaKey) {
		var trsSelected = document.querySelectorAll(".tablify tr.selected");
		for(var i = 0; i < trsSelected.length; i++) {
			trsSelected[i].classList.remove("selected");
		}
	}
	// Row selection
	e.target.parentNode.classList.add("selected");
	// Add buttons inactivation
	var addButtons = document.querySelectorAll(".tablify button.add");
	for(var i = 0; i < addButtons.length; i++) {
		addButtons[i].disabled = "disabled";
	}
};

/**
 * Defines behavior of element of tbody is unselected
 * Unselection occurs when clicking outside the table
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.documentClick = function(e) {
	// Unselect selected rows if the click is outside the table
	if (!isIn(e.target, "tablify")) {
		var trsSelected = document.querySelectorAll(".tablify tr.selected");
		for(var i = 0; i < trsSelected.length; i++) {
			trsSelected[i].classList.remove("selected");
		}
		// Add buttons reactivation
		var addButtons = document.querySelectorAll(".tablify button.add");
		for(var i = 0; i < addButtons.length; i++) {
			addButtons[i].removeAttribute("disabled");
		}
	}
};

/**
 * Defines behavior tr elements on mouse enter
 * Add .hovered class to first td of the row and to the corresponding header th of the column
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tdsMouseEnter = function(e) { 
	e.target.parentNode.firstElementChild.classList.add("hovered");
	document.querySelector(".tablify thead th:nth-child(" + (e.target.getIndex() + 1) + ")").classList.add("hovered");
};

/**
 * Defines behavior tr elements on mouse leave
 * Remove .hovered class to first td of the row and to the corresponding header th of the column
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tdsMouseLeave = function(e) { 
	e.target.parentNode.firstElementChild.classList.remove("hovered");
	document.querySelector(".tablify thead th:nth-child(" + (e.target.getIndex() + 1) + ")").classList.remove("hovered");
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
	recalculateRowIds();
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
	recalculateRowIds();
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

/**
 * Defines behavior of the tbody elements on drop
 * Open an inline form for row editing values
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tbodyDblClick = function(e){
	e.target.parentNode.classList.remove("selected");
	e.target.parentNode.classList.toggle("editing");

	// Disable add and remove buttons
};

/**
 * Defines behavior of the Remove button when clicked
 * All .selected tr elements are removed
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.removeButtonsClick = function(e) {
	var trsSelected = document.querySelectorAll(".tablify tr.selected");
	for(var i = 0; i < trsSelected.length; i++) {
		document.querySelector(".tablify tbody").removeChild(trsSelected[i]);
	}
	recalculateRowIds();
	// Add buttons reactivation
	var addButtons = document.querySelectorAll(".tablify button.add");
	for(var i = 0; i < addButtons.length; i++) {
		addButtons[i].removeAttribute("disabled");
	}
};

/** 
 * Class constructor.
 */
function Tablify() {
	
	// Propriétés
	this.tbody = document.querySelector(".tablify tbody");
	this.trs = document.querySelectorAll(".tablify tbody tr");
	this.tdsRowIndex = document.querySelectorAll(".tablify tbody td:first-child");
	this.tdsField = document.querySelectorAll(".tablify tbody td:not(:first-child)");
	this.removeButtons = document.querySelectorAll(".tablify button.remove");
	
	// Initiate events
	document.addEventListener("click", this.documentClick, false);
	this.tbody.addEventListener("click", this.tbodyClick, false);
	this.tbody.addEventListener("dblclick", this.tbodyDblClick, false);
	this.tbody.addEventListener("drop", this.tbodyDrop, false);
	this.trs.addEventListenerAll("dragstart", this.trsDragStart, false);
	this.trs.addEventListenerAll("dragover", this.trsDragOver, false);
	this.trs.addEventListenerAll("dragend", this.trsDragEnd, false);
	this.tdsField.addEventListenerAll("mouseenter", this.tdsMouseEnter, false);
	this.tdsField.addEventListenerAll("mouseleave", this.tdsMouseLeave, false);
	this.removeButtons.addEventListenerAll("click", this.removeButtonsClick, false);

}
var test = new Tablify();
