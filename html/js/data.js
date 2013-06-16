// Generated by CoffeeScript 1.6.3
(function() {
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
        return _this.chart.height - Chart.PADDING_BOTTOM;
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
      var container, url,
        _this = this;
      container = this.chart.time.select('.container').attr('transform', '');
      container.selectAll('*').remove();
      container.append('path').attr('class', 'area').datum([]).attr('d', this.area);
      container.append('path').attr('class', 'line').datum([]).attr('d', this.line);
      this.chart.time.select('.extras').append('rect').attr('class', 'nowLine').attr('fill', 'url(#now-line-gradient)').attr('width', Chart.NOW_BAR_WIDTH);
      this.chart.time.select('.extras').append('circle').attr('class', 'nowDot').attr('fill', 'url(#now-dot-gradient)').attr('r', Chart.NOW_BAR_WIDTH);
      url = ("" + this.chart.db + "/_changes?filter=energy_data") + ("/measurements&source=" + this.feed);
      this.current = 0;
      this.chart.getJSON("" + url + "&descending=true&limit=2", function(result) {
        _this.eventSource = new EventSource("" + url + "&feed=eventsource&include_docs=true&since=" + result.last_seq, {
          withCredentials: true
        });
        return _this.eventSource.onmessage = function(e) {
          var doc, _ref;
          doc = JSON.parse(e.data).doc;
          _this.chart.meter.select('text').text("" + ((_ref = doc.ElectricEnergy) != null ? _ref : 0) + " Wh");
          _this.current = doc.ElectricPower;
          return _this.transformExtras();
        };
      });
      return setInterval((function() {
        return _this.transformExtras();
      }), 1000);
    };

    TotalPower.prototype.stop = function() {};

    TotalPower.prototype.getDataFromRequest = function(params, result) {
      var resample;
      resample = +new Date(params.start);
      return result.datapoints.map(function(d, i) {
        var _ref;
        return {
          at: new Date(d.at),
          resampledAt: new Date(resample + i * params.interval * 1000),
          value: parseFloat((_ref = d.value) != null ? _ref : 0)
        };
      });
    };

    TotalPower.prototype.transformExtras = function() {
      this.chart.time.select('.nowLine').attr('x', this.chart.x(new Date) - Chart.NOW_BAR_WIDTH / 2).attr('y', this.chart.y(this.current) - Chart.PADDING_BOTTOM).attr('height', this.chart.height - this.chart.y(this.current));
      return this.chart.time.select('.nowDot').attr('cx', this.chart.x(new Date)).attr('cy', this.chart.y(this.current) - Chart.PADDING_BOTTOM);
    };

    TotalPower.prototype.setDataAndTransform = function(data, from, to) {
      this.chart.time.select('.area').datum(data).attr('d', this.area).attr('transform', from).transition().duration(1000).attr('transform', to);
      return this.chart.time.select('.line').datum(data).attr('d', this.line).attr('transform', from).transition().duration(1000).attr('transform', to);
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
      n = this.chart.width / Chart.SAMPLE_SIZE;
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
        return _this.chart.height - Chart.PADDING_BOTTOM - _this.chart.y(d.value);
      });
      g.append('text').text(function(d) {
        return d.start.toLocaleDateString() + '|' + d.start.toLocaleTimeString() + '>' + d.end.toLocaleTimeString();
      }).attr('text-anchor', 'left').attr('alignment-baseline', 'bottom').attr('dy', this.chart.height - Chart.PADDING_BOTTOM);
      g.append('text').text(function(d) {
        return d.value;
      }).attr('text-anchor', 'left').attr('alignment-baseline', 'bottom').attr('dy', this.chart.height - Chart.PADDING_BOTTOM - 20);
      bar.exit().remove();
      return this.transform();
    };

    TotalEnergy.prototype.getParameters = function() {
      var duration, earliest, first, i, info, interval, latest, n, start, _i, _len, _ref, _ref1;
      info = this.chart.getTickInfo();
      start = this.chart.x.domain()[0];
      duration = +this.chart.x.domain()[1] - +this.chart.x.domain()[0];
      n = this.chart.width / Chart.SAMPLE_SIZE;
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

}).call(this);
