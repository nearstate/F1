#NearState Dynamic Forms
##v 0.1  

#### Goals

* Minimum demonstrable product
	* Only textbox, textarea, checkbox
	* Only single page forms
	* Can list editable forms
	* Can add new form
	* Can edit in editor
	* Can publish for filling
	* Can list fillable forms
	* Can fill out an instance and save
	* No retrieval for additional editing following save
	* Can list filled forms
	* Can view filled form
* Releasable on GitHub

##### Descoped
* Running on both AWS and Azure

##### Critique

* Code quality
	* Event handling difficult to trace due to AJAX loaded scripts
	* CSS is over complicated
	* form.js is not well factored
	* GET of a clone has side-effect of creating one!
* Functionality
	* Editor save/update failures not handled
* API quality
	* custom content type needed
	* confusion over "name" vs. "id"
	* confusion over HATEOAS vs. RMM1
* Expandability
	* better way to implement storage APIs