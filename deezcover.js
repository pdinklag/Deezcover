config = {
    minTrackId: 700001,   // as of December 31, 2018
    maxTrackId: 18240512, // as of December 31, 2018
    maxAttempts: 100,     // don't want stack overflows

    randomTrackId: function() {
        return Math.floor(Math.random() * (this.maxTrackId - this.minTrackId))
            + this.minTrackId;
    }
};

tracks = $('#tracks');

attempt = function(num) {
    var id = config.randomTrackId();
    $.getJSON('r.php?id=' + id, function(track) {
        if(track.readable) {
            // this track is OK
            tracks.append(`
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
        } else {
            // that failed - try again?
            if(num < config.maxAttempts) {
                attempt(num+1);
            } else {
                // TODO: display message on site?
                console.log('getting a new track failed after ' + num + ' attempts!');
            }
        }
    });
}

// attempt to get one on button click
$('#the-button').click(function() {
    attempt(1);
});

// ... and also on startup!
attempt(1);


