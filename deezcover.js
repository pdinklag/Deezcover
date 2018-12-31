app = {
    // not every ID is being used, so these are guesses
    // it may take an actual while (up to 300 attempts seems common) to hit
    minTrackId: 100000,
    maxTrackId: 6100000000,

    // within this range, we will find something more quickly
    quickMinTrackId: 700001,
    quickMaxTrackId: 19999999,

    maxAttempts: 1000, // don't want stack overflows, but this should suffice
    waiting: false,

    engine: Random.engines.mt19937(),
    init: false,

    randomTrackId: function(min = this.minTrackId, max = this.maxTrackId) {
        if(!this.init) {
            this.engine.autoSeed();
            this.init = true;
        }

        return Random.integer(min, max)(this.engine);
    },

    tracks: $('#tracks'),
    btn: $('#the-button'),

    wait: function(b) {
        if(!this.waiting && b) {
            this.waiting = true;
            this.btn.prop('disabled', true);
            $('#app-ready').hide();
            $('#app-waiting').show();
        } else if(this.waiting && !b) {
            this.waiting = false;
            this.btn.prop('disabled', false);
            $('#app-ready').show();
            $('#app-waiting').hide();
        }
    },

    chkStream: $('#stream'),
    stream: false,
    queue: [],
    outstanding: 0,

    enqueue: function(track) {
        if(this.waiting) {
            // don't queue up, display immediately!
            this.wait(false);
            this.display(track);
            ++this.outstanding; // and make sure to request another one!
        } else {
            // add to queue
            this.queue.push(track);
        }

        if(--this.outstanding > 0) {
            this.requestRandomTrack();
        }
    },

    displayNext: function() {
        if(this.queue.length > 0) {
            // display next from queue
            this.display(this.queue.shift());

            // and request the next one!
            this.addRequest();
        } else {
            // we are behind, but there should be a request already!
            this.wait(true);
        }
    },

    addRequest: function() {
        if(this.outstanding > 0) {
            // we are already loading one, settle down and add outstanding request
            ++this.outstanding;
            console.log("outstanding request count now " + this.outstanding);
        } else {
            this.outstanding = 1;
            this.requestRandomTrack();
        }
    },

    requestRandomTrack: function(min = this.minTrackId, max = this.maxTrackId, attempt = 1) {
        var id = this.randomTrackId(min, max);
        var _app = this;
        $.getJSON('r.php?id=' + id, function(track) {
            if(track.readable) {
                // this track is OK
                _app.enqueue(track);
                _app.wait(false);
                console.log('Deezcover: needed ' + attempt + ' attempts!');
            } else {
                // that failed - try again?
                if(attempt < _app.maxAttempts) {
                    _app.requestRandomTrack(min, max, attempt + 1);
                } else {
                    // TODO: display message on site?
                    console.log('Deezcover: getting a new track failed after ' + attempt + ' attempts!');
                    _app.wait(false);
                }
            }
        });
    },

    display: function(track) {
        autoplay = this.stream ? 'autoplay' : '';

        this.tracks.append(`
            <tr>
                <td>
                <a href="${track.link}" title="Open on Deezer">
                <img src="${track.album.cover_medium}"/
                ></a></td>
                <td class="text-left p-2">
                    <div class="title">${track.artist.name} &ndash; ${track.title}</div>
                </td>
                <td>
                    <audio controls ${autoplay} class="align-middle float-right">
                    <source src="${track.preview}" type="audio/mpeg">
                    </audio>
                </td>
            </tr>
        `);

        if(this.stream) {
            var audio = $('#tracks audio').last();

            _app = this;
            audio.on('ended', function() {
                _app.displayNext();
            });
        }
    },
};

// attempt to get one on button click
app.btn.click(function() {
    app.displayNext();
});

app.chkStream.change(function() {
    app.stream = app.chkStream.prop('checked');
});

// Startup
app.wait(true);
app.requestRandomTrack(app.quickMinTrackId, app.quickMaxTrackId);
app.outstanding = 10; // pre-load a few!
