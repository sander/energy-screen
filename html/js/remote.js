// Generated by CoffeeScript 1.6.3
this.Remote = (function() {
  function Remote(url) {
    var source;
    source = new EventSource(url);
    source.addEventListener('reload', function() {
      return location.reload();
    });
  }

  return Remote;

})();
