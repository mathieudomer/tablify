/*
 * tablify
 * Author : Mathieu DOMER
 * Created : 25/10/2013
 * Modified : 
 * Backlog : 
 * - Sauvegarder en local les colonnes
 * - clic droit
 * - Drag'n drop colonne
 * - Ajouter
 * - Ajouter plusieurs lignes
 * - Tri
 * - Filtre
 * - Editer à la cellule
 * - Historique
 * - Enregistrer
 * - Autosave
 * - Charger
 * - Générer le HTML
 * - Websockets ? (modification côté serveur)
 */


/**
 * Extends {@link NodeList} to simplify addEventListener on node list
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
 * Extends {@link NodeList} to simplify remove class on node list
 *
 * @param	arguments	list of classes
 * @see 	EventTarget.addEventListener
 */
NodeList.prototype.removeClasses = function() {
	var classesCount = arguments.length;
	for (var i = 0; i < this.length; i++) {
		for (var j = 0; j < classesCount; j++) {
			this[i].classList.remove(arguments[j]);
		}
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
 * Simplifies creation of element in DOM
 * 
 * @param	elt			element information : element type, text (optional) and attributes (optional)
 * @return	The element
 */
var createElement = function(elt) {
	if (null != elt.elt) {
		var element = document.createElement(elt.elt);
		if (null != elt.text) element.innerHTML = elt.text;
		var attr = elt.attr;
		for(var i in attr) {
			if ("className" == i){
				element.classList.add(attr[i]);
			}
			else {
				element.setAttribute(i, attr[i]);
			}
		}
		return element;
	}
	else {
		return null;
	}
};

/**
 * Extends {@link Element} to simplify append of element in DOM
 * 
 * @param	elt			element information : element type, text (optional) and attributes (optional)
 * @return	The element
 */
Element.prototype.appendElement = function(elt) {
	var element = createElement(elt);
	if (null != element) {
		this.appendChild(element);
	}
	return element;
};

/**
 * Extends {@link Element} to simplify prepend of element in DOM
 * 
 * @param	elt			element information : element type, text (optional) and attributes (optional)
 * @return	The element
 */
Element.prototype.prependElement = function(elt) {
	var element = createElement(elt);
	if (null != element) {
		this.insertBefore(element, this.firstElementChild);
	}
	return element;
};

/**
 * Extends {@link Element} to remove the classes passed in arguments of the siblings of the element
 * 
 * @param	arguments	the list of classes to remove
 */
Element.prototype.removeSiblingsClasses = function() {
	var countItems = arguments.length;
	var currentElement = this.parentNode.firstElementChild;
	do {
		if(currentElement != this) {
			for(var i = 0; i < countItems; i++) {
				if (currentElement.classList.contains(arguments[i])) {
					currentElement.classList.remove(arguments[i]);
				}
			}
		}
	}
	while (currentElement = currentElement.nextElementSibling)
};

/**
 * Extends {@link Element} to switch class of an element by an ordered list
 * 
 * @param	arguments	the list of classes in the order to process
 */
Element.prototype.toggleClassesList = function() {
	var countItems = arguments.length;
	var emptyItem = countItems;
	var foundItem = countItems;
	var switchItem = 0;
	for(var i = 0; i < countItems; i++) {
		if ("" == arguments[i]) {
			emptyItem = i;
		}
		else if (this.classList.contains(arguments[i])) {
			foundItem = i;
		}
	}
	if (foundItem == countItems) {
		foundItem = emptyItem;
	}
	else {
		this.classList.remove(arguments[foundItem]);
	}
	if (foundItem != countItems - 1) {
		switchItem = foundItem + 1;
	}
	if ("" != arguments[switchItem]) {
		this.classList.add(arguments[switchItem]);
	}
	return arguments[switchItem];
};

/**
 * Unselect all .selected rows
 *
 */
Tablify.prototype.unSelectRows = function() {
	var trsSelected = this.table.querySelectorAll("tr.selected");
	for(var i = 0; i < trsSelected.length; i++) {
		trsSelected[i].classList.remove("selected");
	}
}

/**
 * Recalculate row ids
 *
 */
Tablify.prototype.recalculateRowIds = function() {
	var trs = this.table.querySelectorAll("tbody tr");
	for (var i = 0; i < trs.length; i++) {
		trs[i].id = "tr" + i;
		trs[i].firstElementChild.innerHTML = i + 1;
	}
};

/**
 * Recalculate row numbers
 *
 */
Tablify.prototype.recalculateRowNumbers = function() {
	var trs = this.table.querySelectorAll("tbody tr");
	for (var i = 0; i < trs.length; i++) {
		trs[i].firstElementChild.innerHTML = i + 1;
	}
};

/**
 * Defines behavior of element of tbody is selected
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tbodyClick = function(e) {
	e.preventDefault();
};

/**
 * Compare two elements ascending by their innerHTML (strings or intergers)
 *
 * @param	a, b 	elements to compare
 * @return	True - a is greater than b
 * @return	False - b is greater than a
 */
var sortAscendingByInnerHMTLString = function(a, b) {
	return a.innerHTML.toLowerCase().localeCompare(b.innerHTML.toLowerCase());
};

/**
 * Compare two elements ascending by their innerHTML (dates)
 *
 * @param	a, b 	elements to compare
 * @return	True - a is greater than b
 * @return	False - b is greater than a
 */
var sortAscendingByInnerHMTLDate = function(a, b) {
	return Date.parse(a.innerHTML) > Date.parse(b.innerHTML);
};

/**
 * Compare two elements ascending by the id of their parents
 *
 * @param	a, b 	elements to compare
 * @return	True - a is greater than b
 * @return	False - b is greater than a
 */
var sortAscendingByParentsId = function(a, b) {
	return parseInt(a.parentNode.id.substr(2), "10") - parseInt(b.parentNode.id.substr(2), "10");
};

/**
 * Defines behavior of th element when clicked
 * Sort rows by the selected column : 
 * - first click : ascending
 * - second click : descending
 * - third click : original sort
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.thsClick = function(e) {
	e.currentTarget.removeSiblingsClasses("ascending", "descending");
	var direction = e.currentTarget.toggleClassesList("ascending", "descending", "");
	if ("" != direction) {
		var index = e.currentTarget.getIndex();
		var sortFunction = sortAscendingByInnerHMTLString;
		// If the table has been generated by object, manage of date columns
		if ("date" == this.columns[index - 1].type) {
			//sortFunction = sortAscendingByInnerHMTLDate;
		}
	}
	else {
		var index = 0;
		var sortFunction = sortAscendingByParentsId;
	}
	var cells = this.tbody.querySelectorAll("tr td:nth-child(" + (index + 1) + ")");
	var arrayCells = [].slice.call(cells).sort(sortFunction);
	if ("descending" == direction) {
		arrayCells.reverse();
	}
	for (var i = 0; i < arrayCells.length; i++) {
		this.tbody.appendChild(arrayCells[i].parentNode);
	}
	this.recalculateRowNumbers();
};

/**
 * Defines behavior of element of row index td is selected
 * Row selection
 * Multiple selection is possible using Ctrl or Cmd
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tdsRowIndexClick = function(e) {
	// Unselect all selected rows if neither ctrl nor  cmd key are pressed
	if(!e.ctrlKey && !e.metaKey) {
		var trsSelected = this.table.querySelectorAll("tr.selected");
		for(var i = 0; i < trsSelected.length; i++) {
			trsSelected[i].classList.remove("selected");
		}
	}
	// Row selection
	e.target.parentNode.classList.add("selected");
	// Add buttons inactivation
	var addButtons = this.table.querySelectorAll("button.add");
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
		this.unSelectRows();
		// Add buttons reactivation
		var addButtons = this.table.querySelectorAll("button.add");
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
Tablify.prototype.tdsCellsMouseEnter = function(e) { 
	e.target.parentNode.firstElementChild.classList.add("hovered");
	this.table.querySelector("thead th:nth-child(" + (e.target.getIndex() + 1) + ")").classList.add("hovered");
};

/**
 * Defines behavior tr elements on mouse leave
 * Remove .hovered class to first td of the row and to the corresponding header th of the column
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tdsCellsMouseLeave = function(e) { 
	e.target.parentNode.firstElementChild.classList.remove("hovered");
	this.table.querySelector("thead th:nth-child(" + (e.target.getIndex() + 1) + ")").classList.remove("hovered");
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
	this.unSelectRows();
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
	if (e.pageY - e.target.offsetTop - this.table.offsetTop < e.target.offsetHeight / 2) {
		this.table.querySelector("tbody").insertBefore(this.table.querySelector("tr.moving"), trOvered);
	}
	else {
		var tbody = this.table.querySelector("tbody");
		if (trOvered.isEqualNode(tbody.lastElementChild)) {
			tbody.appendChild(this.table.querySelector("tr.moving"));
		}
		else {
			tbody.insertBefore(this.table.querySelector("tr.moving"), trOvered.nextElementSibling);
		}
	}
	this.recalculateRowIds();
	this.recalculateRowNumbers();
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
	this.table.querySelector("tr.moving").classList.remove("moving");
	this.ths.removeClasses("ascending", "descending");
	this.recalculateRowIds();
	this.recalculateRowNumbers();
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
 * Defines behavior of the cell td elements on double click
 * Open a form for cell editing values
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.tdsCellsDblClick = function(e){
	e.target.classList.remove("selected");
	e.target.classList.toggle("editing");

	// Disable add and remove buttons

	// Tab > cell suivante sans modif
	// Esc > Exit sans modification
	// Enter > valid la modif
	// Haut bas gauche droite > cell suivante sans modif
};

/**
 * Defines behavior of the Remove button when clicked
 * All .selected tr elements are removed
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.removeButtonsClick = function(e) {
	var trsSelected = this.table.querySelectorAll("tr.selected");
	for(var i = 0; i < trsSelected.length; i++) {
		this.table.querySelector("tbody").removeChild(trsSelected[i]);
	}
	this.recalculateRowIds();
	// Add buttons reactivation
	var addButtons = this.table.querySelectorAll("button.add");
	for(var i = 0; i < addButtons.length; i++) {
		addButtons[i].removeAttribute("disabled");
	}
};

/**
 * Defines behavior of the Add button when clicked
 * A new line is added under the line selected or at the beginning of the table
 * If the table has been iniate with an object the form respect columns type
 *
 * @param	e 	{@link Event} object
 * @see 	EventTarget.addEventListener
 */
Tablify.prototype.addButtonsClick = function(e) {

};

/**
 * Initiate the table based on submitted columns and rows arrays
 *
 * @return	The created table element
 */
Tablify.prototype.initiateFromObject = function() {
	// Table
	var table = document.body.appendElement({elt:"table", attr:{className:"tablify"}});
	// Header
	var thead = table.appendElement({elt:"thead"});
	// Colonnes
	var tr = thead.appendElement({elt:"tr"});
	tr.appendElement({elt:"th", attr:{id:"corner"}});
	for (var i = 0; i < this.columns.length; i++) {
		var th = tr.appendElement({elt:"th", text:this.columns[i]["label"]});
		th.appendElement({elt:"a"});
	}
	// Body
	var tbody = table.appendElement({elt:"tbody"}); 
	for (var i = 0; i < this.rows.length; i++) {
		var tr = tbody.appendElement({elt:"tr", attr:{id:"tr"+i, draggable:"true"}});
		tr.appendElement({elt:"td", text:i+1});
		var row = this.rows[i];
		for (var j = 0; j < row.length; j++) {
			tr.appendElement({elt:"td", text:row[j]});
		}
	}

	return table;
};

/**
 * Insert Actions Bar in the header
 */
Tablify.prototype.insertActionsBar = function() {
	var thead = this.table.querySelector("thead");
	var colspan = thead.querySelectorAll("th").length;
	var tr = thead.prependElement({elt:"tr", attr:{className:"actions"}});
	var td = tr.appendElement({elt:"td", attr:{colspan:colspan}});
	td.appendElement({elt:"button", text:"Ajouter", attr:{type:"button", className:"add"}});
	td.appendElement({elt:"button", text:"Supprimer", attr:{type:"button", className:"remove"}});
};

/**
 * Initiate the events
 */
Tablify.prototype.initiateEvents = function() {
	// Properties
	this.tbody = this.table.querySelector("tbody");
	this.trs = this.table.querySelectorAll("tbody tr");
	this.ths = this.table.querySelectorAll("thead th:not(#corner)");
	this.tdsRowIndex = this.table.querySelectorAll("tbody td:first-child");
	this.tdsCells = this.table.querySelectorAll("tbody td:not(:first-child)");
	this.addButtons = this.table.querySelectorAll("button.add");
	this.removeButtons = this.table.querySelectorAll("button.remove");
	
	// Initiate events
	document.addEventListener("click", this.documentClick.bind(this), false);
	this.tbody.addEventListener("click", this.tbodyClick.bind(this), false);
	this.ths.addEventListenerAll("click", this.thsClick.bind(this), false);
	this.tdsRowIndex.addEventListenerAll("click", this.tdsRowIndexClick.bind(this), false);
	this.tdsCells.addEventListenerAll("dblclick", this.tdsCellsDblClick.bind(this), false);
	this.tbody.addEventListener("drop", this.tbodyDrop.bind(this), false);
	this.trs.addEventListenerAll("dragstart", this.trsDragStart.bind(this), false);
	this.trs.addEventListenerAll("dragover", this.trsDragOver.bind(this), false);
	this.trs.addEventListenerAll("dragend", this.trsDragEnd.bind(this), false);
	this.tdsCells.addEventListenerAll("mouseenter", this.tdsCellsMouseEnter.bind(this), false);
	this.tdsCells.addEventListenerAll("mouseleave", this.tdsCellsMouseLeave.bind(this), false);
	this.addButtons.addEventListenerAll("click", this.addButtonsClick.bind(this), false);
	this.removeButtons.addEventListenerAll("click", this.removeButtonsClick.bind(this), false);
};

/**
 * Initiate table from a selector
 */
Tablify.prototype.transformTable = function(selector) {
	this.table = document.querySelector(selector);
	this.insertActionsBar();
	this.initiateEvents();
};

/**
 * Initiate table from an object
 */
Tablify.prototype.generateFromObject = function(obj) {
	this.columns = obj.columns;
	this.rows = obj.rows;
	this.table = this.initiateFromObject();
	this.insertActionsBar();
	this.initiateEvents();
};

/** 
 * Class constructor.
 */
function Tablify() {};