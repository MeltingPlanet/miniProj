/*
var Voice = (function(aCtx) {
    function Voice(frequency){
      this.frequency = frequency;
      this.oscillators = [];
    };

    Voice.prototype.start = function() {
      
      var vco = aCtx.createOscillator();
      vco.type = "sine";
      vco.frequency.value = this.frequency;

      
      var vca = aCtx.createGain();
      vca.gain.value = 0.3;

      
      vco.connect(vca);
      vca.connect(aCtx.destination);

      vco.start(0);

      this.oscillators.push(vco);
    };

    Voice.prototype.stop = function() {
        this.oscillators.forEach(function(oscillator, _) {
            oscillator.stop();
        });
      };

    return Voice;
  })(aCtx);
*/