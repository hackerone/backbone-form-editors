Backbone.Form.editors.Selectize = Backbone.Form.editors.Base.extend({
  tagName: 'div',
  className: 'selectize-wrap',
  initialize: function(options) {
    this.options = options;
    Backbone.Form.editors.Base.prototype.initialize.call(this, this.options);
    this.schema = this.options.schema;
    this.form = this.options.form;
    return this.model = this.form.model;
  },
  getValue: function() {
    return this.$('.input-editor').val();
  },
  setValue: function(value) {
    return this.sel.setValue(value);
  },
  render: function() {
    var option, options, sel, self, url;
    $('<input class="input-editor">').appendTo(this.el);
    url = this.schema.url || null;
    self = this;
    options = this.schema.options ? _.map(this.schema.options, function(i, e) {
      return {
        label: e,
        value: i
      };
    }) : [];
    option = {
      options: options,
      valueField: 'value',
      labelField: 'label',
      searchField: 'label',
      createOnBlur: true,
      onChange: function(val) {
        return self.trigger('change', self);
      },
      onLoad: function() {
        return self.sel = this;
      }
    };
    if (url) {
      option.load = function(query, cb) {
        return $.getJSON(url, {
          'q': query
        }, cb);
      };
      option.placeholder = this.schema.placeholder || 'Type to autocomplete';
    } else {
      option.placeholder = this.schema.placeholder || 'Select one';
    }
    if (!this.schema.multiple) {
      option.maxItems = 1;
    }
    if (this.schema.create) {
      option.create = true;
    }
    sel = this.$('.input-editor').selectize(option);
    if (this.value) {
      $.getJSON(url, {
        'q': self.value
      }, function(data) {
        sel[0].selectize.addOption(data);
        return sel[0].selectize.setValue(self.value);
      });
    }
    return this;
  }
});
