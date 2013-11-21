// Generated by CoffeeScript 1.6.3
this.bubble = function(node) {
  return new Bubble(node);
};

this.Bubble = (function() {
  function Bubble(node) {
    var d, k, time, v;
    if (node.bubble != null) {
      return node.bubble;
    }
    node.bubble = this;
    this.chart = window.chart;
    this.container = d3.select(node);
    d = this.container.datum();
    for (k in d) {
      v = d[k];
      this[k] = v;
    }
    this.id = this.at != null ? +this.at : JSON.stringify(this.interval);
    if (this.interval != null) {
      this.middle = new Date((+this.interval[0] + +this.interval[1]) / 2);
    }
    if (this.value_type === 'W') {
      this.str = this.value < 1000 ? Math.round(this.value * 10) / 10 : Math.round(this.value);
      this.str += ' W';
      this.W = true;
    } else if (this.value_type === 'Wh') {
      this.str = "" + (Math.round(this.value)) + " Wh";
      this._value = this.value;
      this.hours = (+this.interval[1] - +this.interval[0]) / 60 / 60 / 1000;
      this.value = this.value / this.hours;
      this.Wh = true;
    }
    if ((this.note == null) && this.measuredAt) {
      time = "" + (this.measuredAt.getHours()) + ":";
      if (this.measuredAt.getMinutes() < 10) {
        time += '0';
      }
      time += this.measuredAt.getMinutes();
      this.note = "measured at " + time;
    }
    this.mobile = true;
    this.createDom();
    this.position();
    this._dispatch = d3.dispatch('close');
    this.publish(this._dispatch, ['on']);
  }

  Bubble.prototype.publish = function(obj, methods) {
    var _this = this;
    return methods.map(function(name) {
      return _this[name] = obj[name].bind(obj);
    });
  };

  Bubble.prototype.close = function() {
    this._el.remove();
    this._dispatch.close();
    return this;
  };

  Bubble.prototype.createDom = function() {
    var labelBackground, labelText,
      _this = this;
    if (this.interval != null) {
      this._ival = this.container.append('rect').classed('interval', true).attr('x', 0).attr('y', 0).attr('width', 0).attr('height', 0);
    }
    this._el = this.container.append('g').attr('class', 'popup').classed('energy', this.value_type === 'Wh').on('touchstart', function(d, i) {
      var id;
      if (_this.container.classed('current')) {
        if (_this.closesOnTouch) {
          d3.event.stopPropagation();
          return _this.close();
        } else {
          _this.toggleSeeThrough(true);
          id = "touchend.bubble" + _this.id;
          return d3.select('body').on(id, function() {
            d3.select('body').on(id, null);
            return _this.toggleSeeThrough(false);
          });
        }
      } else {
        return _this.chart.bringIntoView(_this.at);
      }
    });
    labelBackground = this._el.append('rect').classed('back', true).attr('x', 63).attr('y', -20).attr('height', 40).attr('rx', 20).attr('ry', 20);
    this._el.append('path').attr('d', 'M 16 -8 A 48 48 340 1 1 16 8 L 0 0 L 16 -8');
    this._el.append('text').attr('class', 'value').text(this.str).attr('text-anchor', 'middle').attr('alignment-baseline', 'central').attr('dx', this.W != null ? 63 : 44).attr('dy', this.W != null ? 0 : -45);
    labelText = this._el.append('text').attr('class', 'note').text(this.note).attr('text-anchor', this.W != null ? 'start' : 'middle').attr('alignment-baseline', 'central').attr('dx', this.W != null ? 120 : 32).attr('dy', this.W != null ? 0 : -80);
    labelBackground.attr('width', 76 + labelText.node().getBBox().width);
    return this;
  };

  Bubble.prototype.position = function(transition, x, y) {
    var fixed, obj, _ref,
      _this = this;
    if (!this.mobile) {
      return;
    }
    fixed = (x != null) && (y != null);
    if (!fixed) {
      x = this.chart.x((_ref = this.at) != null ? _ref : this.middle);
      y = this.chart.y(this.value);
    }
    if (transition) {
      obj = this._el.on('webkitTransitionEnd', function() {
        _this._el.on('webkitTransitionEnd', null);
        _this.mobile = true;
        return _this.position(true);
      }).transition().duration(300);
      if (fixed) {
        this.mobile = false;
      }
    } else {
      obj = this._el;
    }
    obj.attr('transform', "translate(" + x + ", " + y + ")");
    if (this.Wh) {
      y = this.chart.y(this.value);
      this._ival.attr('x', this.chart.x(this.interval[0])).attr('width', this.chart.x(this.interval[1]) - this.chart.x(this.interval[0])).attr('y', y).attr('height', this.chart.height - this.chart.config.padding_bottom - y);
    }
    return this;
  };

  Bubble.prototype.toggleSeeThrough = function(bool) {
    this._seeThrough = bool != null ? bool : !this._seeThrough;
    this._el.attr('opacity', this._seeThrough ? .2 : 1);
    return this;
  };

  return Bubble;

})();
