Backbone.Form.editors.Selectize = Backbone.Form.editors.Base.extend
	tagName: 'div'
	className: 'selectize-wrap'

	initialize: (@options) ->
		Backbone.Form.editors.Base.prototype.initialize.call(this, @options);
		@schema = @options.schema
		@form = @options.form
		@model = @form.model


	getValue: ->
		return @$('.input-editor').val()


	setValue: (value)->
		@sel.setValue value

	render: ->
		$('<input class="input-editor">').appendTo @el

		url = @schema.url || null
		self = this
		
		options =  if @schema.options then _.map(@schema.options, (i,e) -> {label:e, value: i}) else []


		option = 
			options:  options
			valueField: 'value'
			labelField: 'label'
			searchField: 'label'
			createOnBlur: true

			onChange: (val) ->
				self.trigger 'change',self

			onLoad: ->
				self.sel = this

		if url
			option.load = (query, cb) ->
				$.getJSON url,{'q': query}, cb

			option.placeholder = @schema.placeholder || 'Type to autocomplete'
		else
			option.placeholder = @schema.placeholder || 'Select one'

		if not @schema.multiple
			option.maxItems = 1

		if @schema.create
			option.create = true


		sel = @$('.input-editor').selectize option

		if @value
			$.getJSON url,{'q':self.value}, (data)->
				sel[0].selectize.addOption data
				sel[0].selectize.setValue self.value

		return this;
