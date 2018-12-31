app = {
    // not every ID is being used, so these are guesses
    minTrackId: 100000,
    maxTrackId: 6100000000,
    maxAttempts: 1000, // don't want stack overflows
    waiting: false,

    engine: Random.engines.mt19937(),
    init: false,

    randomTrackId: function() {
        if(!this.init) {
            this.engine.autoSeed();
            this.init = true;
        }

        return Random.integer(this.minTrackId, this.maxTrackId)(this.engine);
        /*return Math.floor(Math.random() * ( - ))
            + this.minTrackId;*/
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

    attempt: function(num) {
        this.wait(true);

        var id = this.randomTrackId();
        var _app = this;
        $.getJSON('r.php?id=' + id, function(track) {
            if(track.readable) {
                // this track is OK
                _app.tracks.append(`
                    <tr>
                        <td>
                        <a href="${track.link}" title="Open on Deezer">
                        <img src="${track.album.cover_medium}"/
                        ></a></td>
                        <td class="text-left p-2">
                            <div class="title">${track.artist.name} &ndash; ${track.title}</div>
                        </td>
                        <td>
                            <audio controls class="align-middle float-right">
                            <source src="${track.preview}" type="audio/mpeg">
                            </audio>
                        </td>
                    </tr>
                `);
                _app.wait(false);
                console.log('Deezcover: needed ' + num + ' attempts!');
            } else {
                // that failed - try again?
                if(num < _app.maxAttempts) {
                    _app.attempt(num+1);
                } else {
                    // TODO: display message on site?
                    console.log('Deezcover: getting a new track failed after ' + num + ' attempts!');
                    _app.wait(false);
                }
            }
        });
    },
};

// attempt to get one on button click
app.btn.click(function() {
    app.attempt(1);
});

// ... and also on startup!
app.attempt(1);
