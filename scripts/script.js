window.onload = function(){

    //##################################                ###########################################
    //################################## Piano keyboard ###########################################
    //##################################     drawing    ###########################################

    var whiteKeys = document.getElementById('whiteKeys');
    var ctxW = whiteKeys.getContext('2d');

    var blackKeys = document.getElementById('blackKeys');
    var ctxB = blackKeys.getContext('2d');

    //kvite tangenter
    function drawWhite(x, max, keyboard) {

        for(var i = 0; i < max; i++){   // Using a for loop to not write the same piece of code maaany times, and good for my key press logic
            if(i === keyboard){
                ctxW.fillStyle = 'rgb(34,187,187)';
                ctxW.fillRect(x, 20, 50, 150);
            }else if(keyboard === 'up'){
                ctxW.fillStyle = 'white';
                ctxW.fillRect(x, 20, 50, 150);
                ctxW.strokeRect(x, 20, 50, 150);
                x += 50;
            }else{
                ctxW.fillStyle = 'white';
                ctxW.strokeRect(x, 20, 50, 150);
                x += 50;
            }

        } 
    }

    function drawBlack(x, max, keyboard) {

        for(var i = 0; i < max; i++){
            if(i == keyboard){
                ctxB.fillStyle= 'rgb(34,187,187)';
            }else{
                ctxB.fillStyle = 'black';
            }
            if(i == 1 || i == 4 || i == 6){
                ctxB.fillRect(x, 19, 30, 100);
                x += 100;
            }
            else{
                ctxB.fillRect(x, 19, 30, 100);
                x += 50;
            }
        } 
    }

    drawBlack(55, 10);
    drawWhite(20, 14);

    //################ Draw white keys before keyboard interaction #######################

    x = 20;
    for(var i = 0; i < 14; i++){
        ctxW.fillStyle = 'white';
        ctxW.fillRect(x, 20, 50, 150);
        ctxW.strokeRect(x, 20, 50, 150);
        x += 50;
    }

    //##################################                  ###########################################
    //################################## User interaction ###########################################
    //##################################     objects      ###########################################

    var filterSlider = new Nexus.Slider('#slider1',{
        'size': [120,20],
        'mode': 'relative',  // 'relative' or 'absolute'
        'min': 50,
        'max': 18000,
        'step': 50,
        'value': 0
    });

    var delaySlider = new Nexus.Slider('#slider2',{
        'size': [120,20],
        'mode': 'relative',  // 'relative' or 'absolute'
        'min': 0.16,
        'max': 1,
        'step': 0,
        'value': 0.16
    });

    var tremoloSlider = new Nexus.Slider('#slider3',{
        'size': [120,20],
        'mode': 'relative',  // 'relative' or 'absolute'
        'min': 0,
        'max': 16,
        'step': 0,
        'value': 0
    });

    var filterButton = new Nexus.RadioButton('#button1',{
        'size': [120,25],
        'numberOfButtons': 1,
        'active': -1
    });

    var delayButton = new Nexus.RadioButton('#button2',{
        'size': [120,25],
        'numberOfButtons': 1,
        'active': -1
    });

    var tremoloButton = new Nexus.RadioButton('#button3',{
        'size': [120,25],
        'numberOfButtons': 1,
        'active': -1
    });

    var masterButton = new Nexus.Button('#masterButton',{
        'size': [200,100],
        'mode': 'aftertouch',
        'state': false
    });
    masterButton.colorize("accent",'rgb(34,187,187)');
    masterButton.colorize("fill","dark");

    //##################################             ###########################################
    //##################################    Setup    ###########################################
    //##################################             ###########################################

    var aCtx, vco, vca, biquadFilter, delay, delayAmount, LFO, LFOGain, wave;
    var dry1, dry2, dry3, dry4, wet1, wet2, wet3, wet4;
    var runOnce = true;

    masterButton.on("change", function(e){
        if(runOnce == true){    //code will run only once even if you press the button several times
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            aCtx = new AudioContext();  // Start audio context

            vco = aCtx.createOscillator(); // Create the oscillator which output will be shaped by wavetables and effects
            vco.frequency.value = 0;
            vca = aCtx.createGain();

            biquadFilter = aCtx.createBiquadFilter(); // Create filter
            biquadFilter.type = "lowpass";

            delay = aCtx.createDelay(); // Create delay
            delayAmount = aCtx.createGain();
            delayAmount.gain.value = 0.5; // amount of the effect
            delay.delayTime.setTargetAtTime(1 * 0.16, aCtx.currentTime, 0.05);

            LFO = aCtx.createOscillator();  // create low freq ocillator for Tremolo effect
            LFO.frequency.value = 0;        // Tremolo speed, will be varied by user
            LFOGain = aCtx.createGain();    // Tremolo depth, will be constant
            LFOGain.gain.value = 0;
            

            //##################################                  ###########################################
            //##################################    Dry/Wet for   ###########################################
            //##################################      effects     ###########################################
            
            dry1 = aCtx.createGain();
            wet1 = aCtx.createGain();
            dry1.gain.value = 0.5;
            wet1.gain.value = 0;

            dry2 = aCtx.createGain();
            wet2 = aCtx.createGain();
            dry2.gain.value = 0;
            wet2.gain.value = 0;

            dry3 = aCtx.createGain();
            wet3 = aCtx.createGain();
            dry3.gain.value = 0;
            wet3.gain.value = 0;


            //##################################                  ###########################################
            //##################################    Connections   ###########################################
            //##################################                  ###########################################
            LFO.connect(LFOGain); 
            vco.connect(vca); 
            
            vca.connect(biquadFilter);
            vca.connect(delay);
            vca.connect(dry1);

            biquadFilter.connect(dry2);
            biquadFilter.connect(wet2);

            delay.connect(delayAmount);
            delayAmount.connect(delay);

            delayAmount.connect(dry3);
            delayAmount.connect(wet3);

            dry1.connect(aCtx.destination);
            dry2.connect(aCtx.destination);
            dry3.connect(aCtx.destination);

            wet1.connect(aCtx.destination);
            wet2.connect(aCtx.destination);
            wet3.connect(aCtx.destination);

            vco.start(0);   // Start the oscillator in initiation, and will control the sound with gain 
            LFO.start(0);   

            //##################################                  ###########################################
            //##################################   Initial sound  ###########################################
            //##################################                  ###########################################

            var ourRequest = new XMLHttpRequest();
            ourRequest.open('GET', "JSON/Wurlitzer.json");
            ourRequest.onload = function(){
                var myArr = JSON.parse(ourRequest.responseText);
                wavetable(myArr);
            };
            ourRequest.send(); 

            runOnce = false;
        }
    });

    //##################################                  ###########################################
    //################################## Change wavetable ###########################################
    //##################################                  ###########################################

    var select = new Nexus.Select('instrument',{
        'size': [100,30],
        'options': ['Wurlitzer','Organ', "Mk1", "Bass", "Trombone"] //List of sounds to chose from
    });

    select.on("change", function(i){

        console.log(i.value);
        var ourRequest = new XMLHttpRequest();
        url = "JSON/" + i.value + ".json";  // Make the path with users choice of sound
        console.log(url);
        ourRequest.open('GET', url);    // Get the json file corresponding to the sound
        ourRequest.onload = function(){
            var myArr = JSON.parse(ourRequest.responseText);    //parse the file to variable
            wavetable(myArr);   //call function and pass the table as an argument
    };
        ourRequest.send();  
    });

    function wavetable(myArr){
        wave = aCtx.createPeriodicWave(myArr.real, myArr.imag); //create the periodic wave with the table chosen
        vco.setPeriodicWave(wave);  // set the wave to the oscillator
    }

    //##################################               ###########################################
    //################################## Play and stop ###########################################
    //##################################               ###########################################

    function playSound(freq){
        vco.frequency.value = freq; // set to frequency coming from the key pressed
        vca.gain.setTargetAtTime(0.5, aCtx.currentTime, 0.01);  // make it sound / turn up the gain gradually to prevent clicks (envelope)
        LFOGain.gain.setTargetAtTime(0.2, aCtx.currentTime, 0.01);  // Set the tremolo depth
    }

    function stopSound(){
        vca.gain.setTargetAtTime(0, aCtx.currentTime, 0.05);    // "turn off" or rather turn down the sound
        LFOGain.gain.setTargetAtTime(0, aCtx.currentTime, 0.05);
    }

    //##################################             ###########################################
    //##################################   Filter    ###########################################
    //##################################             ###########################################

    filterButton.on("change", function(e){ // filter button event listener
        //console.log(e);
        if(e == 0){ // e == 0 is the "on"-state, or "blue"-state
            dry1.gain.value = 0;
            wet1.gain.value = 1;
            wet2.gain.value = 1;
        }else{
            wet1.gain.value = 0;
            wet2.gain.value = 0;
            dry1.gain.value = 1;  
        }
    });

    filterSlider.on('change',function(v) {  // filter slider event listener, used to change filter frequency when user interacts with slider
        biquadFilter.frequency.setTargetAtTime(v, aCtx.currentTime, 0.05);
        console.log(v);
    });

    //##################################             ###########################################
    //##################################   Delay     ###########################################
    //##################################             ###########################################

    delayButton.on("change", function(e){
        //console.log(e);
        if(e == 0){
            wet1.gain.value = 1;
            wet3.gain.value = 1;
        }else{
            wet3.gain.value = 0;
        }
    });

    delaySlider.on('change',function(e) {   // listening for delaytime change / value from slider
        delay.delayTime.setTargetAtTime(1 * e, aCtx.currentTime, 0.05);
        console.log(e);
    });

    //##################################             ###########################################
    //##################################   Tremolo   ###########################################
    //##################################             ###########################################

    tremoloButton.on("change", function(e){
        if(e == 0){
            LFOGain.connect(vca.gain);  // modulate the gain of the oscillator
        }else{
            LFOGain.disconnect();
        }
    });

    tremoloSlider.on('change',function(e) {
        LFO.frequency.setTargetAtTime(e, aCtx.currentTime, 0.05);
        console.log(e);
    });

    //##################################             ###########################################
    //################################## Keytriggers ###########################################
    //##################################             ###########################################

    let noteFreq = null;
    noteFreq = createNoteTable(); // call function that creates the notetable
    var voice;
    var down = false;

    var oktav = new Nexus.Select('oktav',{
        'size': [100,30],
        'options': ['1', "2", "3", "4", "5"] // change octave on user input
    });
    oktav.selectedIndex = 2; //preset octave

    window.addEventListener('keydown', function(event){
        if(down) return; // boolean logic to prevent retriggering of keys while holding them down
        down = true;
        switch (event.key) { // switch used to pick out witch key is pressed
            //White keys
            case 'a':
                console.log('a');
                drawWhite(20, 14, 0);   //draw the white keys
                playSound(noteFreq[oktav.value]['C']); // turn up the oscillator with note frequency corresponding to user octave and note c
                break;
            case 's':
                console.log('s');
                drawWhite(20, 14, 1);
                playSound(noteFreq[oktav.value]['D']);
                break;
            case 'd':
                console.log('d');
                drawWhite(20, 14, 2);
                playSound(noteFreq[oktav.value]['E']);
                break;
            case 'f':
                console.log('f');
                drawWhite(20, 14, 3);
                playSound(noteFreq[oktav.value]['F']);
                break;
            case 'g':
                console.log('g');
                drawWhite(20, 14, 4);
                playSound(noteFreq[oktav.value]['G']);
                break;
            case 'h':
                console.log('h');
                drawWhite(20, 14, 5);
                playSound(noteFreq[oktav.value]['A']);
                break;
            case 'j':
                console.log('j');
                drawWhite(20, 14, 6);
                playSound(noteFreq[oktav.value]['B']);
                break;
            case 'k':
                console.log('k');
                drawWhite(20, 14, 7);
                playSound(noteFreq[parseFloat(oktav.value)+1]['C']); // use parseFloat to be able to perform math operation
                break;
            case 'l':
                console.log('l');
                drawWhite(20, 14, 8);
                playSound(noteFreq[parseFloat(oktav.value)+1]['D']);
                break;
            case 'ø':
                console.log('ø');
                drawWhite(20, 14, 9);
                playSound(noteFreq[parseFloat(oktav.value)+1]['E']);
                break;
            case 'æ':
                console.log('æ');
                drawWhite(20, 14, 10);
                playSound(noteFreq[parseFloat(oktav.value)+1]['F']);
                break;

            //Black keys
            case 'w':
                console.log('w');
                drawBlack(55, 10, 0);
                playSound(noteFreq[oktav.value]['C#']);
                break;
            case 'e':
                console.log('e');
                drawBlack(55, 10, 1);
                playSound(noteFreq[oktav.value]['D#']);
                break;
            case 't':
                console.log('t');
                drawBlack(55, 10, 2);
                playSound(noteFreq[oktav.value]['F#']);
                break;
            case 'y':
                console.log('y');
                drawBlack(55, 10, 3);
                playSound(noteFreq[oktav.value]['G#']);
                break;
            case 'u':
                console.log('u');
                drawBlack(55, 10, 4);
                playSound(noteFreq[oktav.value]['A#']);
                break;
            case 'o':
                console.log('o');
                drawBlack(55, 10, 5);
                playSound(noteFreq[parseFloat(oktav.value)+1]['C#']);
                break;
            case 'p':
                console.log('p');
                drawBlack(55, 10, 6);
                playSound(noteFreq[parseFloat(oktav.value)+1]['D#']);
                break;
            default:
                break;
        }
    }, false);

    window.addEventListener('keyup', function(event){   // stop sound and draw the piano without key presses (colors) 
        down = false;
        drawWhite(20, 14, 'up');
        drawBlack(55, 10, 'up');
        stopSound();
    }, false);

    //##################################            ###########################################
    //################################## Notetabell ###########################################
    //##################################            ###########################################

    function createNoteTable() {
        let noteFreq = [];
        for (let i=0; i< 9; i++) {
        noteFreq[i] = [];
        }
    
        noteFreq[0]['A'] = 27.500000000000000;
        noteFreq[0]['A#'] = 29.135235094880619;
        noteFreq[0]['B'] = 30.867706328507756;
    
        noteFreq[1]['C'] = 32.703195662574829;
        noteFreq[1]['C#'] = 34.647828872109012;
        noteFreq[1]['D'] = 36.708095989675945;
        noteFreq[1]['D#'] = 38.890872965260113;
        noteFreq[1]['E'] = 41.203444614108741;
        noteFreq[1]['F'] = 43.653528929125485;
        noteFreq[1]['F#'] = 46.249302838954299;
        noteFreq[1]['G'] = 48.999429497718661;
        noteFreq[1]['G#'] = 51.913087197493142;
        noteFreq[1]['A'] = 55.000000000000000;
        noteFreq[1]['A#'] = 58.270470189761239;
        noteFreq[1]['B'] = 61.735412657015513;
        noteFreq[2]['C'] = 65.406391325149658;
        noteFreq[2]['C#'] = 69.295657744218024;
        noteFreq[2]['D'] = 73.416191979351890;
        noteFreq[2]['D#'] = 77.781745930520227;
        noteFreq[2]['E'] = 82.406889228217482;
        noteFreq[2]['F'] = 87.307057858250971;
        noteFreq[2]['F#'] = 92.498605677908599;
        noteFreq[2]['G'] = 97.998858995437323;
        noteFreq[2]['G#'] = 103.826174394986284;
        noteFreq[2]['A'] = 110.000000000000000;
        noteFreq[2]['A#'] = 116.540940379522479;
        noteFreq[2]['B'] = 123.470825314031027;
    
        noteFreq[3]['C'] = 130.812782650299317;
        noteFreq[3]['C#'] = 138.591315488436048;
        noteFreq[3]['D'] = 146.832383958703780;
        noteFreq[3]['D#'] = 155.563491861040455;
        noteFreq[3]['E'] = 164.813778456434964;
        noteFreq[3]['F'] = 174.614115716501942;
        noteFreq[3]['F#'] = 184.997211355817199;
        noteFreq[3]['G'] = 195.997717990874647;
        noteFreq[3]['G#'] = 207.652348789972569;
        noteFreq[3]['A'] = 220.000000000000000;
        noteFreq[3]['A#'] = 233.081880759044958;
        noteFreq[3]['B'] = 246.941650628062055;
    
        noteFreq[4]['C'] = 261.625565300598634;
        noteFreq[4]['C#'] = 277.182630976872096;
        noteFreq[4]['D'] = 293.664767917407560;
        noteFreq[4]['D#'] = 311.126983722080910;
        noteFreq[4]['E'] = 329.627556912869929;
        noteFreq[4]['F'] = 349.228231433003884;
        noteFreq[4]['F#'] = 369.994422711634398;
        noteFreq[4]['G'] = 391.995435981749294;
        noteFreq[4]['G#'] = 415.304697579945138;
        noteFreq[4]['A'] = 440.000000000000000;
        noteFreq[4]['A#'] = 466.163761518089916;
        noteFreq[4]['B'] = 493.883301256124111;
    
        noteFreq[5]['C'] = 523.251130601197269;
        noteFreq[5]['C#'] = 554.365261953744192;
        noteFreq[5]['D'] = 587.329535834815120;
        noteFreq[5]['D#'] = 622.253967444161821;
        noteFreq[5]['E'] = 659.255113825739859;
        noteFreq[5]['F'] = 698.456462866007768;
        noteFreq[5]['F#'] = 739.988845423268797;
        noteFreq[5]['G'] = 783.990871963498588;
        noteFreq[5]['G#'] = 830.609395159890277;
        noteFreq[5]['A'] = 880.000000000000000;
        noteFreq[5]['A#'] = 932.327523036179832;
        noteFreq[5]['B'] = 987.766602512248223;
    
        noteFreq[6]['C'] = 1046.502261202394538;
        noteFreq[6]['C#'] = 1108.730523907488384;
        noteFreq[6]['D'] = 1174.659071669630241;
        noteFreq[6]['D#'] = 1244.507934888323642;
        noteFreq[6]['E'] = 1318.510227651479718;
        noteFreq[6]['F'] = 1396.912925732015537;
        noteFreq[6]['F#'] = 1479.977690846537595;
        noteFreq[6]['G'] = 1567.981743926997176;
        noteFreq[6]['G#'] = 1661.218790319780554;
        noteFreq[6]['A'] = 1760.000000000000000;
        noteFreq[6]['A#'] = 1864.655046072359665;
        noteFreq[6]['B'] = 1975.533205024496447;
        noteFreq[7]['C'] = 2093.004522404789077;
        noteFreq[7]['C#'] = 2217.461047814976769;
        noteFreq[7]['D'] = 2349.318143339260482;
        noteFreq[7]['D#'] = 2489.015869776647285;
        noteFreq[7]['E'] = 2637.020455302959437;
        noteFreq[7]['F'] = 2793.825851464031075;
        noteFreq[7]['F#'] = 2959.955381693075191;
        noteFreq[7]['G'] = 3135.963487853994352;
        noteFreq[7]['G#'] = 3322.437580639561108;
        noteFreq[7]['A'] = 3520.000000000000000;
        noteFreq[7]['A#'] = 3729.310092144719331;
        noteFreq[7]['B'] = 3951.066410048992894;
    
        noteFreq[8]['C'] = 4186.009044809578154;
        return noteFreq;
    }

};