// Generated by CoffeeScript 1.6.3
this.BubbleBath = (function() {
  BubbleBath.prototype.bubbles = [];

  function BubbleBath(container, db, chart) {
    var CANCEL_DISTANCE, cancel, open, opening, popup, position, timeout,
      _this = this;
    this.container = container;
    this.db = db;
    this.chart = chart;
    if (this.container.length == null) {
      this.container = d3.select(this.container);
    }
    CANCEL_DISTANCE = 10;
    opening = false;
    position = null;
    timeout = null;
    popup = null;
    cancel = function() {
      opening = false;
      if (timeout != null) {
        return timeout = clearTimeout(timeout);
      }
    };
    open = function() {
      var data, datum, delta, dt, time, _i, _len;
      opening = false;
      time = _this.chart.x.invert(position[0]);
      data = _this.chart.time.select('.area').datum();
      dt = Infinity;
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        datum = data[_i];
        delta = Math.abs(+datum.resampledAt - time);
        if (delta < dt) {
          dt = delta;
        } else {
          break;
        }
      }
      _this.container.append('g').attr('class', 'highlight current').datum({
        chart: _this.chart,
        at: datum.resampledAt,
        measuredAt: datum.measuredAt,
        value: datum.value,
        value_type: 'W',
        closesOnTouch: true
      }).each(function() {
        return bubble(this).position().on('close', function() {
          container.selectAll('.highlight').remove();
          return container.selectAll('.bubble').each(function() {
            return bubble(this).toggleSeeThrough(false);
          });
        });
      }).insert('rect', '.popup').attr('class', 'backdrop').attr('width', _this.chart.width).attr('height', _this.chart.height).attr('fill', 'url(#popup-gradient)').on('touchend', function() {
        if (opening) {
          return cancel();
        }
      });
      _this.chart.time.select('#popup-gradient').attr('cx', _this.chart.x(datum.resampledAt)).attr('cy', _this.chart.y(datum.value));
      return _this.container.selectAll('.bubble').each(function() {
        return bubble(this).toggleSeeThrough(true);
      });
    };
    (function(chart, container) {
      this.chart = chart;
      this.container = container;
      return chart.time.on('touchstart', function() {
        if (d3.touches(this).length === 1) {
          opening = true;
          position = d3.touches(this)[0];
          timeout = setTimeout(open, 1000);
          return container.selectAll('.highlight').each(function() {
            return bubble(this).close();
          });
        } else {
          return opening = false;
        }
      }).on('touchmove', function() {
        var distance, touch;
        if (!opening) {
          return;
        }
        touch = d3.touches(this)[0];
        distance = Math.sqrt(Math.pow(touch[1] - position[1], 2) + Math.pow(touch[0] - position[0], 2));
        if (distance > CANCEL_DISTANCE) {
          return cancel();
        }
      }).on('touchend', function() {
        if (opening) {
          return cancel();
        }
      }, true);
    })(this.chart, this.container);
  }

  BubbleBath.prototype.json = function(path, params) {
    return utils.json(("" + this.db + path + "?") + Object.keys(params).map(function(k) {
      return k + '=' + encodeURIComponent(JSON.stringify(params[k]));
    }).join('&'));
  };

  BubbleBath.prototype.position = function() {
    var chart, endts, startts;
    startts = this.chart.x.domain()[0];
    endts = this.chart.x.domain()[1];
    chart = this.chart;
    return this.container.selectAll('.bubble').each(function(d) {
      var b, s, trans;
      s = d3.select(this);
      b = bubble(this);
      if (d.timestamp <= startts) {
        trans = !this.classList.contains('past');
        s.attr('class', 'bubble past');
        return b.position(trans, 10, chart.height - chart.config.padding_bottom);
      } else if (d.timestamp >= endts) {
        trans = !this.classList.contains('future');
        s.attr('class', 'bubble future');
        return b.position(trans, chart.width - 10, chart.height - chart.config.padding_bottom);
      } else {
        trans = !this.classList.contains('current');
        s.attr('class', 'bubble current');
        return b.position(trans);
      }
    });
  };

  BubbleBath.prototype.load = function(feeds, start, end) {
    var deferred, endts, startts, timespan,
      _this = this;
    startts = +start;
    endts = +end;
    deferred = Q.defer();
    timespan = endts - startts;
    if (this.db == null) {
      return;
    }
    this.json('/_design/events/_view/bubbles_by_feed_and_time', {
      startkey: [feeds[0], startts - timespan],
      endkey: [feeds[0], endts + timespan]
    }).then(function(result) {
      var bubbles;
      bubbles = _this.container.selectAll('.bubble').data(result.rows.map(function(row) {
        var d, extra;
        extra = {
          chart: _this.chart,
          closesOnTouch: false
        };
        if (row.value.timestamp) {
          extra.at = new Date(row.value.timestamp);
        } else if (row.value.timestamp_start && row.value.timestamp_end) {
          extra.interval = [new Date(row.value.timestamp_start), new Date(row.value.timestamp_end)];
        }
        d = utils.extend(row.value, extra);
        return d;
      }), function(d) {
        return d.at || JSON.stringify(d.interval);
      });
      bubbles.enter().append('g').attr('class', 'bubble').classed('past', function(d) {
        return d.timestamp <= startts;
      }).classed('future', function(d) {
        return d.timestamp >= endts;
      }).classed('current', function(d) {
        var _ref;
        return (startts < (_ref = d.timestamp) && _ref < endts);
      }).each(function() {
        return bubble(this).position();
      });
      bubbles.exit().each(function(d) {
        return bubble(this).close();
      }).remove();
      _this.position();
      return deferred.resolve(bubbles);
    });
    return deferred.promise;
  };

  return BubbleBath;

})();
