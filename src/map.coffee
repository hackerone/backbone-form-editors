Backbone.Form.editors.MapEditor = Backbone.Form.editors.Base.extend
	
	tagName: 'div'
	className: 'map-editor-wrap'

	template: """
		<div class="form-wrap">
			<textarea class="address-text form-control"></textarea>
			<span class="hint geocode-status"></span>
		</div>
		<div class="form-wrap">
			<a class="btn locate-on-map btn-default">Locate on map</a>
			<div class="map-canvas"></div>
		</div>
	"""

	moved: false

	events: 
		'click .locate-on-map': 'locate'


	initialize: (@options) ->
		Backbone.Form.editors.Base.prototype.initialize.call(this, @options)

		@model = @options.model
		@schema = @options.schema
		@form = @options.form

		@mapOptions = @options.mapOptions || {zoom:12}

		@SubModel = new Backbone.Model()

		@listenTo SubModel,'change:text',@textChange
		@listenTo SubModel,'change',@commitValue

	setValue: (value)->
		@SubModel.setAttributes value

	getValue: ->
		@SubModel.getAttributes()

	setStatus: (text) ->
		@$('.geocode-status').html text


	commitValue: (model)->
		@value = model.getAttributes()

	locate: (e)->
		e.preventDefault()
		@SubModel.set {text: @$('.address-text').val()}


	textChange: (model)->
		geocoder = @getGeocoder()
		self = this

		options =
			address: model.get('text')

		@setStatus "Geocoding..."

		geocoder.geocode options,(results, status)->
			if status != google.maps.GeocoderStatus.OK 
				self.setStatus "No address found"
				return
			
			loc = results[0].geometry.location

			self.SubModel.set {loc:{lat: loc.lat(), lng: loc.lng()}}
			self.moveMarker self.SubModel

	moveMarker: (model)->
		point = new google.maps.LatLng(model.get('lat') || 0, model.get('lng') || 0)
		if not @marker
			@marker = @makeMarker(point, @map)
		else
			@marker.setPosition point

	getGeocoder: ->
		if !@geocoder
			@geocoder = new google.maps.Geocoder()

		return @geocoder

	makeMarker: (point, map) ->
		self = this

		marker = new google.maps.Marker
			map: map
			position: point
			draggable: true

		google.maps.event.addListener marker,'dragend',(ev)->
			self.setValue.call self,{lat: ev.latLng.lat(), lng:ev.latLng.lng()}
			self.moved = true

		setTimeout () ->
			google.maps.event.trigger(self.map, 'resize');
			self.map.setZoom self.map.getZoom()
		, 200

	render: ->
		html = _.template(@template)()
		@$el.empty().append html
		@map = new google.maps.Map(@$('.map-canvas')[0], @mapOptions)
		@SubModel.setAttributes @value

		return this


	


