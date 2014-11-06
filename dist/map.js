Backbone.Form.editors.MapEditor = Backbone.Form.editors.Base.extend({
  tagName: 'div',
  className: 'map-editor-wrap',
  template: "<div class=\"form-wrap\">\n	<textarea class=\"address-text form-control\"></textarea>\n	<span class=\"hint geocode-status\"></span>\n</div>\n<div class=\"form-wrap\">\n	<a class=\"btn locate-on-map btn-default\">Locate on map</a>\n	<div class=\"map-canvas\"></div>\n</div>",
  moved: false,
  events: {
    'click .locate-on-map': 'locate'
  },
  initialize: function(options) {
    this.options = options;
    Backbone.Form.editors.Base.prototype.initialize.call(this, this.options);
    this.model = this.options.model;
    this.schema = this.options.schema;
    this.form = this.options.form;
    this.mapOptions = this.options.mapOptions || {
      zoom: 12
    };
    this.SubModel = new Backbone.Model();
    this.listenTo(SubModel, 'change:text', this.textChange);
    return this.listenTo(SubModel, 'change', this.commitValue);
  },
  setValue: function(value) {
    return this.SubModel.setAttributes(value);
  },
  getValue: function() {
    return this.SubModel.getAttributes();
  },
  setStatus: function(text) {
    return this.$('.geocode-status').html(text);
  },
  commitValue: function(model) {
    return this.value = model.getAttributes();
  },
  locate: function(e) {
    e.preventDefault();
    return this.SubModel.set({
      text: this.$('.address-text').val()
    });
  },
  textChange: function(model) {
    var geocoder, options, self;
    geocoder = this.getGeocoder();
    self = this;
    options = {
      address: model.get('text')
    };
    this.setStatus("Geocoding...");
    return geocoder.geocode(options, function(results, status) {
      var loc;
      if (status !== google.maps.GeocoderStatus.OK) {
        self.setStatus("No address found");
        return;
      }
      loc = results[0].geometry.location;
      self.SubModel.set({
        loc: {
          lat: loc.lat(),
          lng: loc.lng()
        }
      });
      return self.moveMarker(self.SubModel);
    });
  },
  moveMarker: function(model) {
    var point;
    point = new google.maps.LatLng(model.get('lat') || 0, model.get('lng') || 0);
    if (!this.marker) {
      return this.marker = this.makeMarker(point, this.map);
    } else {
      return this.marker.setPosition(point);
    }
  },
  getGeocoder: function() {
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }
    return this.geocoder;
  },
  makeMarker: function(point, map) {
    var marker, self;
    self = this;
    marker = new google.maps.Marker({
      map: map,
      position: point,
      draggable: true
    });
    google.maps.event.addListener(marker, 'dragend', function(ev) {
      self.setValue.call(self, {
        lat: ev.latLng.lat(),
        lng: ev.latLng.lng()
      });
      return self.moved = true;
    });
    return setTimeout(function() {
      google.maps.event.trigger(self.map, 'resize');
      return self.map.setZoom(self.map.getZoom());
    }, 200);
  },
  render: function() {
    var html;
    html = _.template(this.template)();
    this.$el.empty().append(html);
    this.map = new google.maps.Map(this.$('.map-canvas')[0], this.mapOptions);
    this.SubModel.setAttributes(this.value);
    return this;
  }
});
