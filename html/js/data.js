// Generated by CoffeeScript 1.6.3
this.EfficiencyPlot = (function() {
  EfficiencyPlot.prototype.type = 'EfficiencyPlot';

  EfficiencyPlot.prototype.unit = 'Wh';

  EfficiencyPlot.prototype.feed = 'allRooms';

  EfficiencyPlot.prototype.datastream = 'ElectricPower';

  function EfficiencyPlot(chart) {
    var _this = this;
    this.chart = chart;
    this.energyLine = d3.svg.line().x(function(d) {
      return _this.chart.x(d.resampledAt);
    }).y(function(d) {
      return _this.chart.y(d.value);
    });
    this.energyArea = d3.svg.area().x(function(d) {
      return _this.chart.x(d.resampledAt);
    }).y0(function(d) {
      return _this.chart.height - _this.chart.config.padding_bottom;
    }).y1(function(d) {
      return _this.chart.y(d.value);
    });
    this.wasteLine = d3.svg.line().x(function(d) {
      return _this.chart.x(d.resampledAt);
    }).y(function(d) {
      return _this.chart.y(d.value - d.absence);
    });
    this.wasteArea = d3.svg.area().x(function(d) {
      return _this.chart.x(d.resampledAt);
    }).y0(function(d) {
      return _this.chart.y(d.value - d.absence);
    }).y1(function(d) {
      return _this.chart.y(d.value);
    });
  }

  EfficiencyPlot.prototype.init = function() {
    var container;
    container = this.chart.time.select('.container').attr('transform', '');
    container.selectAll('*').remove();
    container.append('path').classed('area', true).classed('energy', true).datum([]).attr('d', this.energyArea);
    container.append('path').classed('area', true).classed('waste', true).datum([]).attr('d', this.wasteArea);
    container.append('path').classed('line', true).classed('waste', true).datum([]).attr('d', this.wasteLine);
    return container.append('path').classed('line', true).classed('energy', true).datum([]).attr('d', this.energyLine);
  };

  EfficiencyPlot.prototype.getDataFromRequest = function(params, result) {
    var cache, resample;
    resample = +new Date(params.start);
    cache = results.datapoints.slice(0);
    return result.datapoints.map(function(d, i) {
      var _ref;
      return {
        at: new Date(d.at),
        resampledAt: new Date(resample + i * params.interval * 1000),
        value: (_ref = parseFloat(d.value)) != null ? _ref : 0,
        absence: (function() {
          if (i === 0) {
            return 0.0;
          } else {
            return parseFloat(d.absence) - parseFloat(cache.datapoints[i - 1].absence);
          }
        })(),
        measuredAt: new Date(d.debug[2])
      };
    });
  };

  EfficiencyPlot.prototype.transformExtras = function() {
    var y;
    if (this.chart.doc == null) {
      return;
    }
    y = this.chart.y(this.chart.doc.ElectricPower);
    this.chart.time.select('.nowLine').attr('x', this.chart.x(new Date) - this.chart.config.now_bar_width).attr('y', y).attr('height', this.chart.height - this.chart.config.padding_bottom - y);
    return this.chart.time.select('.nowDot').attr('cx', this.chart.x(new Date())).attr('cy', y);
  };

  EfficiencyPlot.prototype.setDataAndTransform = function(data, from, to, transition) {
    var transitionLength;
    if (transition == null) {
      transition = true;
    }
    transitionLength = transition ? 1000 : 1;
    this.chart.time.selectAll('.area').datum(data).attr('transform', from).transition().duration(transitionLength).attr('transform', to);
    this.chart.time.selectAll('.line').datum(data).attr('transform', from).transition().duration(transitionLength).attr('transform', to);
    return this.transform();
  };

  EfficiencyPlot.prototype.transform = function() {
    this.chart.time.select('.area.energy').attr('d', this.energyArea);
    this.chart.time.select('.area.waste').attr('d', this.wasteArea);
    this.chart.time.select('.line.energy').attr('d', this.energyLine);
    return this.chart.time.select('.line.waste').attr('d', this.wasteLine);
  };

  EfficiencyPlot.prototype.getParameters = function(domain) {
    var actualDuration, actualEnd, actualStart, duration, i, interval, n, start, _i, _len, _ref, _ref1;
    start = domain[0];
    duration = +domain[1] - +domain[0];
    actualStart = +start - duration;
    actualEnd = Math.min(+start + 2 * duration, +(new Date));
    actualDuration = Math.max(+actualStart, actualEnd) - +actualStart;
    n = this.chart.width / this.chart.config.sample_size;
    _ref = this.chart.config.intervals;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      interval = _ref[i];
      if (interval > duration / n / 1000) {
        break;
      }
    }
    interval = (_ref1 = this.chart.config.intervals[i - 1]) != null ? _ref1 : 1;
    n = Math.ceil(duration * 3 / interval / 1000);
    return {
      interval: interval,
      duration: "" + (parseInt(actualDuration / 1000)) + "seconds",
      start: new Date(actualStart).toJSON()
    };
  };

  return EfficiencyPlot;

})();

this.TotalPower = (function() {
  TotalPower.prototype.type = 'TotalPower';

  TotalPower.prototype.unit = 'W';

  TotalPower.prototype.feed = 'allRooms';

  TotalPower.prototype.datastream = 'ElectricPower';

  function TotalPower(chart) {
    var _this = this;
    this.chart = chart;
    this.area = d3.svg.area().x(function(d) {
      return _this.chart.x(d.resampledAt);
    }).y0(function(d) {
      return _this.chart.height - _this.chart.config.padding_bottom;
    }).y1(function(d) {
      return _this.chart.y(d.value);
    });
    this.line = d3.svg.line().x(function(d) {
      return _this.chart.x(d.resampledAt);
    }).y(function(d) {
      return _this.chart.y(d.value);
    });
  }

  TotalPower.prototype.init = function() {
    var container;
    container = this.chart.time.select('.container').attr('transform', '');
    container.selectAll('*').remove();
    container.append('path').attr('class', 'area').datum([]).attr('d', this.area);
    container.append('path').attr('class', 'line').datum([]).attr('d', this.line);
    this.chart.time.select('.extras').append('rect').attr('class', 'nowLine').attr('fill', 'url(#now-line-gradient)').attr('width', this.chart.config.now_bar_width);
    return this.chart.time.select('.extras').append('circle').attr('class', 'nowDot').attr('fill', 'url(#now-dot-gradient)').attr('r', this.chart.config.now_bar_width);
  };

  TotalPower.prototype.getDataFromRequest = function(params, result) {
    var resample;
    resample = +new Date(params.start);
    return result.datapoints.map(function(d, i) {
      var _ref;
      return {
        at: new Date(d.at),
        resampledAt: new Date(resample + i * params.interval * 1000),
        value: parseFloat((_ref = d.value) != null ? _ref : 0),
        measuredAt: new Date(d.debug[2])
      };
    });
  };

  TotalPower.prototype.transformExtras = function() {
    var y;
    if (this.chart.doc == null) {
      return;
    }
    y = this.chart.y(this.chart.doc.ElectricPower);
    this.chart.time.select('.nowLine').attr('x', this.chart.x(new Date) - this.chart.config.now_bar_width / 2).attr('y', y).attr('height', this.chart.height - this.chart.config.padding_bottom - y);
    return this.chart.time.select('.nowDot').attr('cx', this.chart.x(new Date)).attr('cy', y);
  };

  TotalPower.prototype.setDataAndTransform = function(data, from, to, transition) {
    if (transition == null) {
      transition = true;
    }
    if (transition) {
      this.chart.time.select('.area').datum(data).attr('d', this.area).attr('transform', from).transition().duration(1000).attr('transform', to);
      return this.chart.time.select('.line').datum(data).attr('d', this.line).attr('transform', from).transition().duration(1000).attr('transform', to);
    } else {
      this.chart.time.select('.area').datum(data).attr('d', this.area).attr('transform', to);
      return this.chart.time.select('.line').datum(data).attr('d', this.line).attr('transform', to);
    }
  };

  TotalPower.prototype.transform = function() {
    this.chart.time.select('.area').attr('d', this.area);
    return this.chart.time.select('.line').attr('d', this.line);
  };

  TotalPower.prototype.getParameters = function(domain) {
    var actualDuration, actualEnd, actualStart, duration, i, interval, n, start, _i, _len, _ref, _ref1;
    start = domain[0];
    duration = +domain[1] - +domain[0];
    actualStart = +start - duration;
    actualEnd = Math.min(+start + 2 * duration, +(new Date));
    actualDuration = Math.max(+actualStart, actualEnd) - +actualStart;
    n = this.chart.width / this.chart.config.sample_size;
    _ref = this.chart.config.intervals;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      interval = _ref[i];
      if (interval > duration / n / 1000) {
        break;
      }
    }
    interval = (_ref1 = this.chart.config.intervals[i - 1]) != null ? _ref1 : 1;
    n = Math.ceil(duration * 3 / interval / 1000);
    return {
      interval: interval,
      duration: "" + (parseInt(actualDuration / 1000)) + "seconds",
      start: new Date(actualStart).toJSON()
    };
  };

  return TotalPower;

})();

this.TotalEnergy = (function() {
  TotalEnergy.prototype.type = 'TotalEnergy';

  TotalEnergy.prototype.unit = 'Wh';

  TotalEnergy.prototype.feed = 'allRooms';

  TotalEnergy.prototype.datastream = 'ElectricEnergy';

  function TotalEnergy(chart) {
    this.chart = chart;
  }

  TotalEnergy.prototype.init = function() {
    this.group = this.chart.time.select('.container');
    return this.group.selectAll('*').remove();
  };

  TotalEnergy.prototype.getDataFromRequest = function(params, result) {
    var data, end, endIndex, info, n, pointsPerBar, start, startIndex, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    info = this.chart.getTickInfo();
    pointsPerBar = info.duration / (params.interval * 1000);
    data = [];
    n = [];
    while ((n + 1) * pointsPerBar < result.datapoints.length) {
      startIndex = n * pointsPerBar;
      endIndex = (n + 1) * pointsPerBar;
      end = parseFloat((_ref = (_ref1 = result.datapoints[endIndex]) != null ? _ref1.value : void 0) != null ? _ref : 0);
      start = parseFloat((_ref2 = (_ref3 = result.datapoints[startIndex]) != null ? _ref3.value : void 0) != null ? _ref2 : 0);
      data[n++] = {
        start: new Date((_ref4 = result.datapoints[startIndex]) != null ? _ref4.at : void 0),
        end: new Date((_ref5 = result.datapoints[endIndex]) != null ? _ref5.at : void 0),
        value: (0 < start && start < end) ? (end - start) * 1000 : 0
      };
    }
    return data;
  };

  TotalEnergy.prototype.transform = function() {
    var _this = this;
    this.group.selectAll('.bar rect').attr('x', function(d) {
      return _this.chart.x(d.start);
    }).attr('width', function(d) {
      return _this.chart.x(d.end) - _this.chart.x(d.start);
    });
    return this.group.selectAll('.bar text').attr('dx', function(d) {
      return _this.chart.x(d.start);
    });
  };

  TotalEnergy.prototype.setDataAndTransform = function(data, from, to) {
    var bar, g,
      _this = this;
    this.group.attr('transform', to);
    bar = this.group.selectAll('.bar').data(data, function(d) {
      return "" + (+d.start) + ">" + d.end;
    });
    g = bar.enter().append('g').attr('class', 'bar');
    g.append('rect').attr('y', function(d) {
      return _this.chart.y(d.value);
    }).attr('height', function(d) {
      return _this.chart.height - _this.chart.config.padding_bottom - _this.chart.y(d.value);
    });
    bar.exit().remove();
    return this.transform();
  };

  TotalEnergy.prototype.getParameters = function() {
    var duration, earliest, first, i, info, interval, latest, n, start, _i, _len, _ref, _ref1;
    info = this.chart.getTickInfo();
    start = this.chart.x.domain()[0];
    duration = +this.chart.x.domain()[1] - +this.chart.x.domain()[0];
    n = this.chart.width / this.chart.config.sample_size;
    _ref = this.chart.config.intervals;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      interval = _ref[i];
      if (interval > duration / n / 1000) {
        break;
      }
    }
    interval = (_ref1 = this.chart.config.intervals[i - 1]) != null ? _ref1 : 1;
    n = Math.ceil(duration * 3 / interval / 1000);
    first = +info.first;
    earliest = first + info.duration * Math.floor((+start - duration - first) / info.duration);
    latest = first + 2 * info.duration * Math.ceil((+start + duration - first) / info.duration);
    return {
      interval: interval,
      duration: "" + (parseInt((latest - earliest) / 1000)) + "seconds",
      start: new Date(earliest).toJSON()
    };
  };

  return TotalEnergy;

})();
