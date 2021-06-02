// Override Settings
var boostPFSInstantSearchConfig = {
    search: {
        //suggestionMode: 'test',
        //suggestionPosition: 'left'
    }
};


(function () { 
	BoostPFS.inject(this);  
	// Customize style of Suggestion box
	SearchInput.prototype.customizeInstantSearch = function (suggestionElement, searchElement, searchBoxId) {
		if (!suggestionElement) suggestionElement = this.$uiMenuElement;   // Add this line
		if (!searchElement) searchElement = this.$element;  // Add this line
		if (!searchBoxId) searchBoxId = this.id; // Add this line
	};

})();  